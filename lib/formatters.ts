/**
 * Converts Western digits (0-9) to Bengali Unicode digits (০-৯) when language is 'bn'
 * Handles localized comma separators as well.
 */
export function formatNumber(
  num: number | string | null | undefined,
  language: 'en' | 'bn' = 'en'
): string {
  if (num === null || num === undefined) return '';
  const str = typeof num === 'number' ? num.toLocaleString('en-US') : String(num);
  if (language !== 'bn') return str;

  const bnDigits: Record<string, string> = {
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

  return str.replace(/[0-9]/g, (d) => bnDigits[d] || d);
}
