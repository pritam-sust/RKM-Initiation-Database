import { prisma } from '@/lib/db';
import { ParsedRecord, ParseSummary } from '@/types';
import { convertBijoyToUnicode, isBijoyText } from './bijoyToUnicode';
import { normalizeDateToSortable } from '@/lib/dateUtils';

export interface RawParsedPerson {
  unique_id: string;
  name: string;
  father_or_spouse_name?: string | null;
  age?: string | null;
  address: string;
  mobile_number?: string | null;
  occupation?: string | null;
  education?: string | null;
  diksha_date?: string | null;
  diksha_guru?: string | null;
  diksha_venue?: string | null;
  diksha_ceremony_serial?: string | null;
}

/**
 * Checks if a token looks like a Initiation Number.
 * Examples:
 *  - Bengali Unicode: সিএ১২৩৪৫৬, সিএ১২৩৫, ডিএ২০৬৪, ডিএ-৬১৪০, ডিএ2064
 *  - Bijoy ANSI: wWG2064, wWG2065
 *  - English: DA6140, DA6141, CA123456, RKM001, ID-1234
 */
export function isUniqueIdToken(token: string): boolean {
  if (!token) return false;

  const clean = token.replace(/[:;,]$/, '').trim();

  // Pattern 1: Bengali prefix + Bengali/English digits (e.g. সিএ১২৩৪৫৬, ডিএ২০৬৪, ডিএ2064)
  const bnPattern = /^(?:ডিএ|সিএ|ডি-এ|ডিঅ)[\s/\._-]?[0-9\u09E6-\u09EF]{2,10}$/u;

  // Pattern 2: Bijoy representation (e.g. wWG2064, wWG2065)
  const bijoyPattern = /^wWG[\s/\._-]?[0-9]{2,10}$/i;

  // Pattern 3: English uppercase prefix + digits (e.g. DA6140, DA6141, CA123456, RKM-001)
  // Requires uppercase-only to avoid false positives from common words (e.g. "to12", "on34")
  const enPattern = /^[A-Z]{2,8}[\s/\._-]?[0-9]{2,10}$/;

  // Pattern 4: Generic Bengali prefix + digits
  const genericBn = /^[\u0980-\u09FF]{2,8}[\s/\._-]?[0-9\u09E6-\u09EF]{2,10}$/u;

  // Pattern 5: Pure numeric code if >= 4 digits
  const numPattern = /^[0-9\u09E6-\u09EF]{4,10}$/;

  return (
    bnPattern.test(clean) ||
    bijoyPattern.test(clean) ||
    enPattern.test(clean) ||
    genericBn.test(clean) ||
    numPattern.test(clean)
  );
}

/**
 * Parses a single line starting with a Initiation Number or labeled with 'দীক্ষার নম্বর', etc.
 */
export function parseUniqueIdLine(line: string): { unique_id: string; restOfLine: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Check labeled prefixes: e.g. "দীক্ষার নম্বর: সিএ১২৩৪৫৬ শ্রী প্রদীপ দে" or "দীক্ষা নং - DA6140 Sri Pradip"
  const labelPrefixMatch = trimmed.match(
    /^(?:দীক্ষার\s*নম্বর|দীক্ষা\s*নম্বর|দীক্ষার\s*নং|দীক্ষা\s*নং|দীক্ষা\s*ক্রমিক|ইউনিক\s*আইডি|আইডি|Unique\s*ID|ID|Diksha\s*No|Initiation\s*No)[\s:/-]+([^\s,]+)\s*(.*)$/i
  );

  if (labelPrefixMatch) {
    const idToken = labelPrefixMatch[1].replace(/[:;,]$/, '').trim();
    const rest = labelPrefixMatch[2].trim();
    return {
      unique_id: idToken,
      restOfLine: rest,
    };
  }

  // Check token-based starting IDs
  const match = trimmed.match(/^([^\s]+)\s*(.*)$/);
  if (!match) return null;

  const firstToken = match[1].replace(/[:;,]$/, '').trim();
  const rest = match[2].trim();

  if (isUniqueIdToken(firstToken)) {
    return {
      unique_id: firstToken,
      restOfLine: rest,
    };
  }

  return null;
}

/**
 * Detects a ceremony-header line in the block-header document format.
 *
 * The format groups person records under repeating header blocks:
 *   গুরুদেবের কততম দীক্ষানুষ্ঠানঃ  200531     → diksha_ceremony_serial
 *   গুরুদেব নামঃ শ্রীমৎ স্র্‹...       → diksha_guru
 *   দীক্ষানুষ্ঠানের ভেন্যুঃ ...         → diksha_venue
 *   দীক্ষা তারিখঃ ৩০/০৭/২০০৫          → diksha_date
 *
 * Returns the matched field name and extracted value, or null if not a header line.
 */
export function parseHeaderLine(line: string): {
  field: 'diksha_ceremony_serial' | 'diksha_guru' | 'diksha_venue' | 'diksha_date';
  value: string;
} | null {
  const trimmed = line.trim();

  // Header lines use Bengali visarga ঃ (U+0983) as the key–value separator.
  // Fall back to plain colon ':' for documents that normalise punctuation.
  let colonIdx = trimmed.indexOf('\u0983');
  if (colonIdx === -1) colonIdx = trimmed.indexOf(':');
  if (colonIdx === -1) return null;

  const keyword = trimmed.substring(0, colonIdx).trim();
  const value = trimmed.substring(colonIdx + 1).trim();
  if (!value) return null;

  // দীক্ষানুষ্ঠান সিরিয়াল নং: "গুরুদেবের কততম দীক্ষানুষ্ঠানঃ" or "কততম দীক্ষা"
  if (/কততম\s*দীক্ষ/u.test(keyword)) {
    return { field: 'diksha_ceremony_serial', value };
  }

  // Guru: "গুরুদেব নামঃ" or "দীক্ষাগুরুঃ"
  if (/গুরুদেব\s*নাম|দীক্ষাগুরু/u.test(keyword)) {
    return { field: 'diksha_guru', value };
  }

  // Venue: "দীক্ষানুষ্ঠানের ভেন্যুঃ" or "ভেন্যুঃ"
  if (/ভেন্যু/u.test(keyword)) {
    return { field: 'diksha_venue', value };
  }

  // Date: "দীক্ষা তারিখঃ" or "দীক্ষার তারিখঃ"
  if (/দীক্ষ[া\s]*র?\s*তারিখ/u.test(keyword)) {
    return { field: 'diksha_date', value };
  }

  return null;
}

/**
 * Preprocesses document text:
 * 1. Converts Bijoy ANSI text to Unicode Bengali if Bijoy formatting is detected.
 * 2. Inserts newlines before inline Initiation Number patterns so multiple records on a single line are split cleanly.
 */
export function preprocessText(rawText: string): string {
  let text = rawText || '';

  // Check if text is encoded in Bijoy ANSI format
  if (isBijoyText(text)) {
    text = convertBijoyToUnicode(text);
  }

  // Regex matching Initiation Numbers or labeled Initiation Numbers anywhere in text
  const uniqueIdRegex = /(?:^|\s)(?:(?:দীক্ষার\s*নম্বর|দীক্ষা\s*নম্বর|দীক্ষার\s*নং|দীক্ষা\s*নং|ডিএ|সিএ|ডি-এ|wWG|DA|CA|ID|RKM|[A-Z]{2,6})[\s:/\._-]?[0-9\u09E6-\u09EF]{2,10})/gi;

  const lines = text.split(/\r?\n/);
  const formattedLines: string[] = [];

  for (const line of lines) {
    const matches = Array.from(line.matchAll(uniqueIdRegex));
    if (matches.length > 1) {
      let lastIdx = 0;
      for (const m of matches) {
        if (m.index !== undefined && m.index > lastIdx) {
          const prevPart = line.substring(lastIdx, m.index).trim();
          if (prevPart) formattedLines.push(prevPart);
        }
        if (m.index !== undefined) {
          lastIdx = m.index;
        }
      }
      if (lastIdx < line.length) {
        const lastPart = line.substring(lastIdx).trim();
        if (lastPart) formattedLines.push(lastPart);
      }
    } else {
      formattedLines.push(line);
    }
  }

  return formattedLines.join('\n');
}

/**
 * Main Document Parser Engine.
 * Converts raw document text into structured records with Initiation Number, Name, and multiline Address.
 *
 * Supports two document layouts:
 *
 * 1. Block-header format (new): repeated header blocks provide shared diksha_guru / diksha_venue /
 *    diksha_date / diksha_ceremony_serial for all person records that follow until the next block.
 *
 * 2. Flat format (original): per-record labeled fields (e.g. "দীক্ষাগুরু: ...") or Excel sheets.
 *    These continue to work unchanged.
 */
export function parseDocumentText(rawText: string): RawParsedPerson[] {
  const cleanedText = preprocessText(rawText);

  const lines = cleanedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Shared context inherited from the most recent ceremony header block.
  // Starts empty; stays empty for flat-format documents (backward compatible).
  let currentContext: {
    diksha_guru: string | null;
    diksha_venue: string | null;
    diksha_date: string | null;
    diksha_ceremony_serial: string | null;
  } = {
    diksha_guru: null,
    diksha_venue: null,
    diksha_date: null,
    diksha_ceremony_serial: null,
  };

  const rawRecords: Array<{
    unique_id: string;
    name: string;
    father_or_spouse_name?: string | null;
    age?: string | null;
    addressLines: string[];
    mobile_number?: string | null;
    occupation?: string | null;
    education?: string | null;
    diksha_date?: string | null;
    diksha_guru?: string | null;
    diksha_venue?: string | null;
    diksha_ceremony_serial?: string | null;
  }> = [];

  let currentRecord: {
    unique_id: string;
    name: string;
    father_or_spouse_name?: string | null;
    age?: string | null;
    addressLines: string[];
    mobile_number?: string | null;
    occupation?: string | null;
    education?: string | null;
    diksha_date?: string | null;
    diksha_guru?: string | null;
    diksha_venue?: string | null;
    diksha_ceremony_serial?: string | null;
  } | null = null;

  for (const line of lines) {
    // ── Step 1: Detect ceremony header lines ────────────────────────────────────────
    const headerMatch = parseHeaderLine(line);
    if (headerMatch) {
      // Update shared context; header lines never belong to a person record
      currentContext[headerMatch.field] = headerMatch.value;
      continue;
    }

    // ── Step 2: Detect person ID lines ──────────────────────────────────────────
    const idLineMatch = parseUniqueIdLine(line);
    if (idLineMatch) {
      if (currentRecord) rawRecords.push(currentRecord);

      let name = idLineMatch.restOfLine;
      // Start with context date; allow per-line override if present in name portion
      let dikshaDate: string | null = currentContext.diksha_date;
      const dikshaMatch = name.match(/(?:দীক্ষার\s*তারিখ|দীক্ষা\s*তারিখ|Diksha|Initiated)[\s:]*([^\s,]+)/i);
      if (dikshaMatch) {
        dikshaDate = dikshaMatch[1];
        name = name.replace(dikshaMatch[0], '').trim();
      }

      currentRecord = {
        unique_id: idLineMatch.unique_id,
        name,
        father_or_spouse_name: null,
        age: null,
        addressLines: [],
        mobile_number: null,
        occupation: null,
        education: null,
        diksha_date: dikshaDate,
        diksha_guru: currentContext.diksha_guru,
        diksha_venue: currentContext.diksha_venue,
        diksha_ceremony_serial: currentContext.diksha_ceremony_serial,
      };
      continue;
    }

    // ── Step 3: Sub-lines belonging to the current person record ────────────────
    if (!currentRecord) continue; // no active record — skip orphaned lines

    // Name continuation (should rarely happen; mainly for edge-case flat formats)
    if (!currentRecord.name) {
      currentRecord.name = line;
      continue;
    }

    // Per-record diksha date override (flat / old format)
    const dateMatch = line.match(/(?:দীক্ষার\s*তারিখ|দীক্ষা\s*তারিখ|Diksha|Initiated)[\s:]*(.+)$/i);
    if (dateMatch) { currentRecord.diksha_date = dateMatch[1].trim(); continue; }

    // Per-record guru override (flat / old format)
    const guruMatch = line.match(/^(?:দীক্ষাগুরু|Guru)[\s:]*(.+)$/i);
    if (guruMatch) { currentRecord.diksha_guru = guruMatch[1].trim(); continue; }

    // Mobile number
    const mobileMatch = line.match(/(?:মোবাইল|Mobile|Phone|Tel)[\s:]*([0-9\u09E6-\u09EF\s\-+]+)/i);
    if (mobileMatch) { currentRecord.mobile_number = mobileMatch[1].trim(); continue; }

    // Father / spouse — প্র/ or প্র। prefix (most common in this document format)
    const prMatch = line.match(/^প্র[\/।৷]\.?\s*(.+)$/u);
    if (prMatch) { currentRecord.father_or_spouse_name = prMatch[1].trim(); continue; }

    // Father / spouse — keyword labels (পিতা, মাতা, Father, Husband, Spouse)
    const fatherKeyMatch = line.match(/^(?:পিতা|মাতা|Father|Husband|Spouse)[\s:]*(.+)$/iu);
    if (fatherKeyMatch) { currentRecord.father_or_spouse_name = fatherKeyMatch[1].trim(); continue; }

    // Father / spouse — line starting with স্বামী (husband name; keep full text as the reference)
    if (/^স্বামী\s/u.test(line)) { currentRecord.father_or_spouse_name = line; continue; }

    // Everything else → address line
    currentRecord.addressLines.push(line);
  }

  // Push the final record
  if (currentRecord) rawRecords.push(currentRecord);

  // ── Shared address propagation ─────────────────────────────────────────────
  // Documents often list multiple consecutive IDs followed by a single address
  // block that applies to all of them:
  //
  //   বিএ৮০১১  শ্রীপরিমল চন্দ্র বসাক       ← no address
  //   বিএ৮০১২  শ্রীমতী সোমা বসাক
  //       জেলা জজ কোর্ট                      ← address for both
  //       পোঃ/জেলা - চট্টগ্রাম।
  //
  // Backward pass: if record[i] has no address but record[i+1] has one,
  // copy the address lines upward through the chain of empty-address records.
  for (let i = rawRecords.length - 2; i >= 0; i--) {
    if (
      rawRecords[i].addressLines.length === 0 &&
      rawRecords[i + 1].addressLines.length > 0
    ) {
      rawRecords[i].addressLines = [...rawRecords[i + 1].addressLines];
    }
  }

  return rawRecords.map((rec) => ({
    unique_id: rec.unique_id,
    name: rec.name || 'N/A',
    father_or_spouse_name: rec.father_or_spouse_name || null,
    age: rec.age || null,
    address: rec.addressLines.join('\n').trim() || 'N/A',
    mobile_number: rec.mobile_number || null,
    occupation: rec.occupation || null,
    education: rec.education || null,
    diksha_date: rec.diksha_date || null,
    diksha_guru: rec.diksha_guru || null,
    diksha_venue: rec.diksha_venue || null,
    diksha_ceremony_serial: rec.diksha_ceremony_serial || null,
  }));
}

/**
 * Validates parsed records against PostgreSQL database to flag duplicates or invalid records.
 */
export async function validateAndStatusRecords(
  parsed: RawParsedPerson[]
): Promise<ParseSummary> {
  const existingRecords = await prisma.person.findMany({
    where: {
      unique_id: {
        in: parsed.map((p) => p.unique_id),
      },
    },
    select: { unique_id: true },
  });

  const existingSet = new Set(existingRecords.map((r) => r.unique_id));
  const seenInBatch = new Set<string>();

  const records: ParsedRecord[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  parsed.forEach((rec, idx) => {
    let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
    let errorMessage: string | undefined = undefined;

    if (!rec.unique_id || rec.unique_id === 'N/A') {
      status = 'invalid';
      errorMessage = 'Missing Initiation Number';
    } else if (!rec.name || rec.name === 'N/A') {
      status = 'invalid';
      errorMessage = 'Missing Name';
    } else if (existingSet.has(rec.unique_id)) {
      status = 'duplicate';
      errorMessage = 'Initiation Number already exists in database';
    } else if (seenInBatch.has(rec.unique_id)) {
      status = 'duplicate';
      errorMessage = 'Duplicate Initiation Number in this upload batch';
    }

    if (status === 'valid') {
      validCount++;
      seenInBatch.add(rec.unique_id);
    } else if (status === 'duplicate') {
      duplicateCount++;
    } else {
      invalidCount++;
    }

    // Clean age of currency signs or formatting
    const rawAge = rec.age ? rec.age.replace(/[$৳₹€£¥]/g, '').replace(/\.00$/, '').trim() : null;

    records.push({
      tempId: `parsed_${idx}_${Date.now()}`,
      unique_id: rec.unique_id,
      name: rec.name,
      father_or_spouse_name: rec.father_or_spouse_name || null,
      age: rawAge || null,
      address: rec.address,
      mobile_number: rec.mobile_number || null,
      occupation: rec.occupation || null,
      education: rec.education || null,
      diksha_date: rec.diksha_date || null,
      diksha_date_sort: normalizeDateToSortable(rec.diksha_date),
      diksha_guru: rec.diksha_guru || null,
      diksha_venue: rec.diksha_venue || null,
      diksha_ceremony_serial: rec.diksha_ceremony_serial || null,
      status,
      errorMessage,
      selected: status === 'valid',
    });
  });

  return {
    total: parsed.length,
    validCount,
    duplicateCount,
    invalidCount,
    records,
  };
}
