import * as XLSX from 'xlsx';
import { parseDocumentText, isUniqueIdToken } from './documentParser';
import { isBijoyText, convertBijoyToUnicode } from './bijoyToUnicode';

interface ParsedRawPerson {
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
}

function cleanCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (isBijoyText(str)) {
    str = convertBijoyToUnicode(str);
  }
  return str;
}

export function parseExcelBuffer(buffer: Buffer): ParsedRawPerson[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetNames = workbook.SheetNames;

  if (!sheetNames || sheetNames.length === 0) {
    return [];
  }

  // Iterate sheets until valid rows found
  for (const name of sheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;

    const data: (string | number | Date | null | undefined)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: '',
    });

    if (!data || data.length === 0) continue;

    // 1. Try Header-Based Matching
    const headerRowIdx = findHeaderRow(data);
    if (headerRowIdx !== -1) {
      const headers = data[headerRowIdx].map((h) => cleanCell(h).toLowerCase());
      const colMap = mapHeadersToFields(headers);

      if (colMap.unique_id !== -1 || colMap.name !== -1) {
        const records: ParsedRawPerson[] = [];

        for (let r = headerRowIdx + 1; r < data.length; r++) {
          const row = data[r];
          if (!row || row.length === 0) continue;

          const rawId = colMap.unique_id !== -1 ? cleanCell(row[colMap.unique_id]) : '';
          const rawName = colMap.name !== -1 ? cleanCell(row[colMap.name]) : '';
          const rawAddress = colMap.address !== -1 ? cleanCell(row[colMap.address]) : '';

          // If row has no ID and no Name, skip empty row
          if (!rawId && !rawName) continue;

          records.push({
            unique_id: rawId || 'N/A',
            name: rawName || 'N/A',
            father_or_spouse_name: colMap.father !== -1 ? cleanCell(row[colMap.father]) || null : null,
            age: colMap.age !== -1 ? cleanCell(row[colMap.age]) || null : null,
            address: rawAddress || 'N/A',
            mobile_number: colMap.mobile !== -1 ? cleanCell(row[colMap.mobile]) || null : null,
            occupation: colMap.occupation !== -1 ? cleanCell(row[colMap.occupation]) || null : null,
            education: colMap.education !== -1 ? cleanCell(row[colMap.education]) || null : null,
            diksha_date: colMap.diksha_date !== -1 ? cleanCell(row[colMap.diksha_date]) || null : null,
            diksha_guru: colMap.diksha_guru !== -1 ? cleanCell(row[colMap.diksha_guru]) || null : null,
          });
        }

        if (records.length > 0) {
          return records;
        }
      }
    }

    // 2. Unstructured Row Scanning / Fallback
    const textLines: string[] = [];
    for (const row of data) {
      if (!row || row.length === 0) continue;
      const joined = row
        .map((cell) => cleanCell(cell))
        .filter((cell) => cell.length > 0)
        .join(' ');
      if (joined) {
        textLines.push(joined);
      }
    }

    if (textLines.length > 0) {
      const docParsed = parseDocumentText(textLines.join('\n'));
      if (docParsed.length > 0) {
        return docParsed;
      }
    }
  }

  return [];
}

function findHeaderRow(data: (string | number | Date | null | undefined)[][]): number {
  for (let r = 0; r < Math.min(data.length, 10); r++) {
    const row = data[r];
    if (!row) continue;
    const rowStr = row.map((c) => cleanCell(c).toLowerCase()).join(' ');

    if (
      rowStr.includes('unique') ||
      rowStr.includes('id') ||
      rowStr.includes('আইডি') ||
      rowStr.includes('দীক্ষার নম্বর') ||
      rowStr.includes('দীক্ষা নম্বর') ||
      rowStr.includes('দীক্ষার নং') ||
      rowStr.includes('দীক্ষা নং') ||
      rowStr.includes('নাম') ||
      rowStr.includes('name') ||
      rowStr.includes('address') ||
      rowStr.includes('ঠিকানা')
    ) {
      return r;
    }
  }
  return -1;
}

interface ColumnMapping {
  unique_id: number;
  name: number;
  father: number;
  age: number;
  address: number;
  mobile: number;
  occupation: number;
  education: number;
  diksha_date: number;
  diksha_guru: number;
}

function mapHeadersToFields(headers: string[]): ColumnMapping {
  const map: ColumnMapping = {
    unique_id: -1,
    name: -1,
    father: -1,
    age: -1,
    address: -1,
    mobile: -1,
    occupation: -1,
    education: -1,
    diksha_date: -1,
    diksha_guru: -1,
  };

  headers.forEach((h, idx) => {
    const header = h.trim();

    // Diksha Date (Check first to avoid false matching with 'দীক্ষা')
    if (
      map.diksha_date === -1 &&
      (header.includes('diksha date') ||
        header.includes('initiation date') ||
        header.includes('দীক্ষার তারিখ') ||
        header.includes('দীক্ষা তারিখ') ||
        header.includes('তারিখ') ||
        header.includes('date'))
    ) {
      map.diksha_date = idx;
    }
    // Unique ID / দীক্ষার নম্বর
    else if (
      map.unique_id === -1 &&
      (header.includes('দীক্ষার নম্বর') ||
        header.includes('দীক্ষা নম্বর') ||
        header.includes('দীক্ষার নং') ||
        header.includes('দীক্ষা নং') ||
        header.includes('দীক্ষা ক্রমিক') ||
        header.includes('diksha no') ||
        header.includes('diksha number') ||
        header.includes('initiation no') ||
        header.includes('unique') ||
        header.includes('id') ||
        header.includes('আইডি') ||
        header.includes('sl') ||
        header.includes('code') ||
        header.includes('নম্বর') ||
        header.includes('নং') ||
        header === 'no')
    ) {
      map.unique_id = idx;
    }
    // Name
    else if (
      map.name === -1 &&
      (header.includes('name') ||
        header.includes('নাম') ||
        header.includes('ভক্তের নাম') ||
        header.includes('devotee')) &&
      !header.includes('father') &&
      !header.includes('spouse') &&
      !header.includes('পিতা') &&
      !header.includes('স্বামী') &&
      !header.includes('guru') &&
      !header.includes('গুরু')
    ) {
      map.name = idx;
    }
    // Father or Spouse
    else if (
      map.father === -1 &&
      (header.includes('father') ||
        header.includes('spouse') ||
        header.includes('husband') ||
        header.includes('guardian') ||
        header.includes('পিতা') ||
        header.includes('স্বামী') ||
        header.includes('অভিভাবক'))
    ) {
      map.father = idx;
    }
    // Age
    else if (map.age === -1 && (header.includes('age') || header.includes('বয়স') || header.includes('বয়স'))) {
      map.age = idx;
    }
    // Address
    else if (
      map.address === -1 &&
      (header.includes('address') ||
        header.includes('ঠিকানা') ||
        header.includes('location') ||
        header.includes('village') ||
        header.includes('গ্রাম') ||
        header.includes('জেলা') ||
        header.includes('district'))
    ) {
      map.address = idx;
    }
    // Mobile / Phone
    else if (
      map.mobile === -1 &&
      (header.includes('mobile') ||
        header.includes('phone') ||
        header.includes('contact') ||
        header.includes('মোবাইল') ||
        header.includes('ফোন') ||
        header.includes('মুঠোফোন'))
    ) {
      map.mobile = idx;
    }
    // Occupation
    else if (
      map.occupation === -1 &&
      (header.includes('occupation') ||
        header.includes('profession') ||
        header.includes('job') ||
        header.includes('পেশা'))
    ) {
      map.occupation = idx;
    }
    // Education
    else if (
      map.education === -1 &&
      (header.includes('education') ||
        header.includes('qualification') ||
        header.includes('ডিগ্রি') ||
        header.includes('শিক্ষা') ||
        header.includes('শিক্ষাগত যোগ্যতা') ||
        header.includes('যোগ্যতা'))
    ) {
      map.education = idx;
    }
    // Diksha Guru
    else if (
      map.diksha_guru === -1 &&
      (header.includes('guru') ||
        header.includes('দীক্ষাগুরু') ||
        header.includes('গুরু') ||
        header.includes('swami') ||
        header.includes('মহারাজ'))
    ) {
      map.diksha_guru = idx;
    }
  });

  return map;
}
