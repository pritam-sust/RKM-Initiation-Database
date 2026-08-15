import mammoth from 'mammoth';
import { parseDocumentText } from './documentParser';

export async function parseDocxBuffer(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value || '';
  return parseDocumentText(rawText);
}
