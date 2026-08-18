import * as XLSX from 'xlsx';
import { convertBijoyToUnicode, isBijoyText } from './bijoyToUnicode';
import { parseDocumentText } from './documentParser';

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
      rowStr.includes('ঠিকানা') ||
      rowStr.includes('guru') ||
      rowStr.includes('দীক্ষাগুরু')
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
    const header = h.toLowerCase().replace(/[:;/\\_\-\.]/g, ' ').replace(/\s+/g, ' ').trim();

    // 1. Diksha Date (Check early to distinguish from generic diksha)
    if (
      map.diksha_date === -1 &&
      (header.includes('diksha date') ||
        header.includes('dikkha date') ||
        header.includes('initiation date') ||
        header.includes('date of diksha') ||
        header.includes('দীক্ষার তারিখ') ||
        header.includes('দীক্ষা তারিখ') ||
        header.includes('দীক্ষার সন') ||
        header.includes('দীক্ষা গ্রহণের তারিখ') ||
        (header.includes('তারিখ') && !header.includes('জন্ম')) ||
        header === 'date' ||
        header === 'dt')
    ) {
      map.diksha_date = idx;
    }
    // 2. Diksha Guru (Check early to distinguish from devotee name)
    else if (
      map.diksha_guru === -1 &&
      (header.includes('guru') ||
        header.includes('diksha guru') ||
        header.includes('dikkha guru') ||
        header.includes('guru name') ||
        header.includes('দীক্ষাগুরু') ||
        header.includes('দীক্ষা গুরু') ||
        header.includes('দীক্ষাদাতা') ||
        header.includes('শ্রীগুরু') ||
        header.includes('গুরুদেব') ||
        header.includes('গুরু') ||
        header.includes('swami') ||
        header.includes('মহারাজ'))
    ) {
      map.diksha_guru = idx;
    }
    // 3. Initiation Number / Initiation Number
    else if (
      map.unique_id === -1 &&
      (header.includes('দীক্ষার নম্বর') ||
        header.includes('দীক্ষা নম্বর') ||
        header.includes('দীক্ষার নং') ||
        header.includes('দীক্ষা নং') ||
        header.includes('দীক্ষা ক্রমিক') ||
        header.includes('diksha no') ||
        header.includes('diksha number') ||
        header.includes('dikkha no') ||
        header.includes('initiation no') ||
        header.includes('initiation number') ||
        header.includes('unique id') ||
        header.includes('unique') ||
        header.includes('ইউনিক আইডি') ||
        header.includes('আইডি') ||
        header.includes('sl no') ||
        header.includes('sl') ||
        header.includes('code') ||
        header.includes('serial') ||
        header.includes('ক্রমিক') ||
        header.includes('নম্বর') ||
        header.includes('নং') ||
        header === 'id' ||
        header === 'no')
    ) {
      map.unique_id = idx;
    }
    // 4. Father or Spouse Name
    else if (
      map.father === -1 &&
      (header.includes('father') ||
        header.includes('spouse') ||
        header.includes('husband') ||
        header.includes('guardian') ||
        header.includes('পিতা') ||
        header.includes('স্বামী') ||
        header.includes('পিতা/স্বামী') ||
        header.includes('পিতা/স্বামীর নাম') ||
        header.includes('পিতার নাম') ||
        header.includes('স্বামীর নাম') ||
        header.includes('অভিভাবক'))
    ) {
      map.father = idx;
    }
    // 5. Age
    else if (
      map.age === -1 &&
      (header.includes('age') ||
        header.includes('বয়স') ||
        header.includes('বয়স') ||
        header.includes('years') ||
        header.includes('বছর'))
    ) {
      map.age = idx;
    }
    // 6. Mobile / Phone Number
    else if (
      map.mobile === -1 &&
      (header.includes('mobile') ||
        header.includes('phone') ||
        header.includes('contact') ||
        header.includes('cell') ||
        header.includes('tel') ||
        header.includes('মোবাইল') ||
        header.includes('ফোন') ||
        header.includes('মুঠোফোন') ||
        header.includes('যোগাযোগ'))
    ) {
      map.mobile = idx;
    }
    // 7. Occupation / Profession
    else if (
      map.occupation === -1 &&
      (header.includes('occupation') ||
        header.includes('profession') ||
        header.includes('job') ||
        header.includes('service') ||
        header.includes('business') ||
        header.includes('পেশা') ||
        header.includes('কর্মসংস্থান') ||
        header.includes('বৃত্তি'))
    ) {
      map.occupation = idx;
    }
    // 8. Education / Qualification
    else if (
      map.education === -1 &&
      (header.includes('education') ||
        header.includes('qualification') ||
        header.includes('degree') ||
        header.includes('শিক্ষা') ||
        header.includes('শিক্ষাগত যোগ্যতা') ||
        header.includes('যোগ্যতা'))
    ) {
      map.education = idx;
    }
    // 9. Address
    else if (
      map.address === -1 &&
      (header.includes('address') ||
        header.includes('ঠিকানা') ||
        header.includes('location') ||
        header.includes('village') ||
        header.includes('গ্রাম') ||
        header.includes('জেলা') ||
        header.includes('district') ||
        header.includes('স্থান'))
    ) {
      map.address = idx;
    }
    // 10. Devotee Name (Catch general name if not father/spouse/guru)
    else if (
      map.name === -1 &&
      (header.includes('name') ||
        header.includes('নাম') ||
        header.includes('ভক্তের নাম') ||
        header.includes('দীক্ষিতের নাম') ||
        header.includes('devotee') ||
        header.includes('person') ||
        header.includes('ব্যক্তি')) &&
      !header.includes('father') &&
      !header.includes('spouse') &&
      !header.includes('পিতা') &&
      !header.includes('স্বামী') &&
      !header.includes('guru') &&
      !header.includes('গুরু')
    ) {
      map.name = idx;
    }
  });

  return map;
}
