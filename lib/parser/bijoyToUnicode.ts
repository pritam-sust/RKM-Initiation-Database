/**
 * Converts Bijoy (ANSI / SutonnyMJ) Bengali text into standard Unicode Bengali.
 */

// Map of Bijoy conjuncts and special characters to Unicode
const BIJOY_REPLACEMENTS: Array<[RegExp, string]> = [
  // Unique ID prefix replacements
  [/wWG/g, 'ডিএ'],

  // Special Conjuncts
  [/²/g, 'ক্ষ'],
  [/³/g, 'ক্ত'],
  [/µ/g, 'ক্র'],
  [/¼/g, 'ঙ্ক'],
  [/½/g, 'ঙ্গ'],
  [/¾/g, 'জ্জ'],
  [/¿/g, 'জ্ঞ'],
  [/À/g, 'ণ্ড'],
  [/Á/g, 'ণ্ঠ'],
  [/Â/g, 'ঞ্চ'],
  [/Ã/g, 'ঞ্ছ'],
  [/Ä/g, 'ঞ্জ'],
  [/Å/g, 'ঞ্ছ'],
  [/Æ/g, 'ট্ট'],
  [/Ç/g, 'ট্ফ'],
  [/È/g, 'ঠ্ঠ'],
  [/É/g, 'ড্ড'],
  [/Ê/g, 'ঢ্ঢ'],
  [/Ë/g, 'ন্ত'],
  [/Ì/g, 'ন্থ'],
  [/Í/g, 'ন্দ'],
  [/Î/g, 'ন্ধ'],
  [/Ï/g, 'ন্ন'],
  [/Ð/g, 'ন্ড'],
  [/Ñ/g, 'ণ্ণ'],
  [/Ò/g, 'ব্দ'],
  [/Ó/g, 'ব্ধ'],
  [/Ô/g, 'ম্ভ'],
  [/Õ/g, 'ম্ন'],
  [/Ö/g, 'গ্র'],
  [/×/g, 'হ্ন'],
  [/Ø/g, 'হ্ন'],
  [/Ù/g, 'হ্ম'],
  [/Ú/g, 'ক্ল'],
  [/Û/g, 'গ্ল'],
  [/Ü/g, 'প্ল'],
  [/Ý/g, 'ফ্ল'],
  [/Þ/g, 'ব্ল'],
  [/ß/g, 'ভ্ল'],
  [/à/g, 'স্ম'],
  [/á/g, 'শ্চ'],
  [/â/g, 'শ্ছ'],
  [/ã/g, 'ষ্ণ'],
  [/ä/g, 'ষ্ঠ'],
  [/å/g, 'স্থ'],
  [/æ/g, 'স্ফ'],
  [/ç/g, 'স্ক'],
  [/è/g, 'স্ট'],
  [/é/g, 'স্প'],
  [/ê/g, 'স্ন'],
  [/ë/g, 'স্ফ'],
  [/ì/g, 'দ্ভ'],
  [/í/g, 'দ্ভব'],
  [/î/g, 'দ্মহ'],
  [/ï/g, 'দ্ধ'],
  [/ð/g, 'দ্ব'],
  [/ñ/g, 'দ্ম'],
  [/ò/g, 'দ্গ'],
  [/ó/g, 'দ্ঘ'],
  [/ô/g, 'ত্ত'],
  [/õ/g, 'ত্থ'],
  [/ö/g, 'ত্ন'],
  [/÷/g, 'ত্ম'],
  [/ø/g, 'ত্ব'],

  // Vowels
  [/A/g, 'অ'],
  [/Av/g, 'আ'],
  [/B/g, 'ই'],
  [/C/g, 'ঈ'],
  [/D/g, 'উ'],
  [/E/g, 'ঊ'],
  [/F/g, 'ঋ'],
  [/G/g, 'এ'],
  [/H/g, 'ঐ'],
  [/I/g, 'ও'],
  [/J/g, 'ঔ'],

  // Consonants
  [/K/g, 'ক'],
  [/L/g, 'খ'],
  [/M/g, 'গ'],
  [/N/g, 'ঘ'],
  [/O/g, 'ঙ'],
  [/P/g, 'চ'],
  [/Q/g, 'ছ'],
  [/R/g, 'জ'],
  [/S/g, 'ঝ'],
  [/T/g, 'ঞ'],
  [/U/g, 'ট'],
  [/V/g, 'ঠ'],
  [/W/g, 'ড'],
  [/X/g, 'ঢ'],
  [/Y/g, 'ণ'],
  [/Z/g, 'ত'],
  [/_/g, 'থ'],
  [/`/g, 'দ'],
  [/a/g, 'ধ'],
  [/b/g, 'ন'],
  [/c/g, 'প'],
  [/d/g, 'ফ'],
  [/e/g, 'ব'],
  [/f/g, 'ভ'],
  [/g/g, 'ম'],
  [/h/g, 'য'],
  [/i/g, 'র'],
  [/j/g, 'ল'],
  [/k/g, 'শ'],
  [/l/g, 'ষ'],
  [/m/g, 'স'],
  [/n/g, 'হ'],
  [/o/g, 'ড়'],
  [/p/g, 'ঢ়'],
  [/q/g, 'য়'],
  [/r/g, 'ৎ'],
  [/s/g, 'ং'],
  [/t/g, 'ঃ'],
  [/u/g, 'ঁ'],

  // Post-vowel signs (Kars)
  [/v/g, 'া'],
  [/w/g, 'ি'],
  [/x/g, 'ী'],
  [/y/g, 'ু'],
  [/z/g, 'ূ'],
  [/~/g, 'ৃ'],
];

/**
 * Detects if a text string contains Bijoy ANSI characters.
 */
export function isBijoyText(text: string): boolean {
  if (!text) return false;
  // Check for signature Bijoy indicators
  const bijoyPatterns = [/wWG\d+/i, /kªx/i, /‡cvt/i, /MÖvg/i, /cÖ\//i, /PµeZx/i, /†PŠayix/i, /‡/g, /†/g, /ˆ/g];
  return bijoyPatterns.some((pattern) => pattern.test(text));
}

/**
 * Converts English digits to Bengali digits when converting Bijoy text.
 */
export function convertDigitsToBengali(text: string): string {
  const map: Record<string, string> = {
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
  return text.replace(/[0-9]/g, (w) => map[w] || w);
}

/**
 * Rearranges pre-positioned vowels (e-kar, oi-kar, etc.) and Reph in Bijoy text.
 */
function fixBijoyVowelPositions(text: string): string {
  let str = text;

  // Handle reph (©) -> moves before consonant
  str = str.replace(/([ক-হ])©/g, 'র্$1');

  // Handle e-kar (‡ or †) typed before consonant -> move after consonant
  str = str.replace(/[‡†]([ক-হ]ª?)/g, '$1ে');

  // Handle oi-kar (ˆ) -> move after consonant
  str = str.replace(/ˆ([ক-হ]ª?)/g, '$1ৈ');

  // Handle ou-kar (‰ or Š) -> move after consonant
  str = str.replace(/‰([ক-হ]ª?)/g, '$1ৌ');
  str = str.replace(/Š([ক-হ]ª?)/g, '$1ৌ');

  // Handle r-phala (ª)
  str = str.replace(/ª/g, '্র');

  return str;
}

export function convertBijoyToUnicode(text: string): string {
  if (!text) return '';

  let converted = text;

  // First apply character replacements
  for (const [pattern, rep] of BIJOY_REPLACEMENTS) {
    converted = converted.replace(pattern, rep);
  }

  // Then rearrange pre-positioned vowels and reph
  converted = fixBijoyVowelPositions(converted);

  // Convert digits attached to Bengali prefixes (e.g. ডিএ2064 -> ডিএ২০৬৪)
  converted = converted.replace(/(ডিএ|সিএ|ডি-এ)([0-9]+)/gi, (match, prefix, num) => {
    return prefix + convertDigitsToBengali(num);
  });

  return converted;
}
