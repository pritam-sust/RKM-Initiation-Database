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

  // Pattern 3: English prefix + digits (e.g. DA6140, DA6141, CA123456, RKM-001)
  const enPattern = /^[a-zA-Z]{2,8}[\s/\._-]?[0-9]{2,10}$/;

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
 */
export function parseDocumentText(rawText: string): RawParsedPerson[] {
  const cleanedText = preprocessText(rawText);

  const lines = cleanedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

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
  } | null = null;

  for (const line of lines) {
    const idLineMatch = parseUniqueIdLine(line);

    if (idLineMatch) {
      // Save previous record if existing
      if (currentRecord) {
        rawRecords.push(currentRecord);
      }

      let name = idLineMatch.restOfLine;
      let dikshaDate: string | null = null;

      // Extract optional diksha date patterns if present in name line
      const dikshaMatch = name.match(/(?:দীক্ষার\s*তারিখ|দীক্ষা\s*তারিখ|দীক্ষা|Diksha|Initiated)[\s:]*([^\s,]+)/i);
      if (dikshaMatch) {
        dikshaDate = dikshaMatch[1];
        name = name.replace(dikshaMatch[0], '').trim();
      }

      currentRecord = {
        unique_id: idLineMatch.unique_id,
        name: name,
        father_or_spouse_name: null,
        age: null,
        addressLines: [],
        mobile_number: null,
        occupation: null,
        education: null,
        diksha_date: dikshaDate,
        diksha_guru: null,
      };
    } else if (currentRecord) {
      if (!currentRecord.name) {
        currentRecord.name = line;
      } else {
        const dateMatch = line.match(/(?:দীক্ষার\s*তারিখ|দীক্ষা\s*তারিখ|দীক্ষা|Diksha|Initiated)[\s:]*(.+)$/i);
        const guruMatch = line.match(/(?:দীক্ষাগুরু|Guru|Swami)[\s:]*(.+)$/i);
        const mobileMatch = line.match(/(?:মোবাইল|Mobile|Phone|Tel)[\s:]*([0-9\u09E6-\u09EF\s\-+]+)/i);
        const fatherMatch = line.match(/(?:পিতা|স্বামী|Father|Spouse|Husband)[\s:]*(.+)$/i);

        if (dateMatch) {
          currentRecord.diksha_date = dateMatch[1].trim();
        } else if (guruMatch) {
          currentRecord.diksha_guru = guruMatch[1].trim();
        } else if (mobileMatch) {
          currentRecord.mobile_number = mobileMatch[1].trim();
        } else if (fatherMatch) {
          currentRecord.father_or_spouse_name = fatherMatch[1].trim();
        } else {
          currentRecord.addressLines.push(line);
        }
      }
    }
  }

  // Push the final record
  if (currentRecord) {
    rawRecords.push(currentRecord);
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
