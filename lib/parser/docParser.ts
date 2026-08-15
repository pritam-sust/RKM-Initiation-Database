import WordExtractor from 'word-extractor';
import { parseDocumentText } from './documentParser';

export async function parseDocBuffer(buffer: Buffer) {
  const extractor = new WordExtractor();
  const extracted = await extractor.extract(buffer);
  const rawText = extracted.getBody() || '';
  return parseDocumentText(rawText);
}
