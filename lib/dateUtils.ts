/**
 * Utility functions for Bengali/English date normalization, conversion, and sorting
 */

export function convertBengaliToEnglishDigits(str: string): string {
  if (!str) return '';
  const bnToEn: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
}

export function convertEnglishToBengaliDigits(str: string): string {
  if (!str) return '';
  const enToBn: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return str.replace(/[0-9]/g, (d) => enToBn[d] || d);
}

/**
 * Normalizes any date string (Bengali or English, DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.)
 * into a standardized sortable ISO format "YYYY-MM-DD".
 * If only year is given, returns "YYYY-00-00".
 * Returns null if invalid or unparseable.
 */
export function normalizeDateToSortable(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === 'N/A' || trimmed === '—' || trimmed === '-') return null;

  // Convert Bengali digits to English
  const asciiStr = convertBengaliToEnglishDigits(trimmed);

  // 1. Check if it's an ISO format "YYYY-MM-DD" or "YYYY/MM/DD"
  const isoMatch = asciiStr.match(/^(\d{4})[-/\.](\d{1,2})[-/\.](\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 2. Check standard "DD/MM/YYYY" or "DD-MM-YYYY" or "DD.MM.YYYY"
  const dmyMatch = asciiStr.match(/^(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 3. Check "DD/MM/YY" or "DD-MM-YY"
  const dmyShortMatch = asciiStr.match(/^(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{2})$/);
  if (dmyShortMatch) {
    const day = dmyShortMatch[1].padStart(2, '0');
    const month = dmyShortMatch[2].padStart(2, '0');
    const yy = parseInt(dmyShortMatch[3], 10);
    const year = yy > 50 ? `19${dmyShortMatch[3]}` : `20${dmyShortMatch[3]}`;
    return `${year}-${month}-${day}`;
  }

  // 4. Check if only 4-digit Year "YYYY" (e.g. 2008 or ২০০৮)
  const yearOnlyMatch = asciiStr.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return `${yearOnlyMatch[1]}-00-00`;
  }

  // 5. Check "Month YYYY" or "MM/YYYY"
  const myMatch = asciiStr.match(/^(\d{1,2})[-/\.](\d{4})$/);
  if (myMatch) {
    const month = myMatch[1].padStart(2, '0');
    const year = myMatch[2];
    return `${year}-${month}-00`;
  }

  // 6. Try standard Date.parse if text format e.g. "25 March 2012"
  const parsedTimestamp = Date.parse(asciiStr);
  if (!isNaN(parsedTimestamp)) {
    const d = new Date(parsedTimestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Generates search variants for a date query to match both Bengali & English formats,
 * with slashes, dashes, dots, and normalized ISO forms.
 */
export function getDateSearchVariants(query: string): string[] {
  if (!query) return [];
  const trimmed = query.trim();
  const variants = new Set<string>();

  variants.add(trimmed);

  // English ASCII version
  const ascii = convertBengaliToEnglishDigits(trimmed);
  variants.add(ascii);

  // Bengali Unicode version
  const bengali = convertEnglishToBengaliDigits(trimmed);
  variants.add(bengali);

  // Normalized sortable form (e.g. 2008-03-29)
  const sortable = normalizeDateToSortable(trimmed);
  if (sortable) {
    variants.add(sortable);
    // Add YYYY-MM and YYYY
    const parts = sortable.split('-');
    if (parts.length >= 1 && parts[0] !== '0000') {
      variants.add(parts[0]);
      variants.add(convertEnglishToBengaliDigits(parts[0]));
    }
  }

  // Slashes <-> Dashes <-> Dots variations
  const replaceSeparators = (str: string) => {
    variants.add(str.replace(/[-/\.]/g, '/'));
    variants.add(str.replace(/[-/\.]/g, '-'));
    variants.add(str.replace(/[-/\.]/g, '.'));
  };

  replaceSeparators(trimmed);
  replaceSeparators(ascii);
  replaceSeparators(bengali);

  return Array.from(variants).filter((v) => v.length > 0);
}
