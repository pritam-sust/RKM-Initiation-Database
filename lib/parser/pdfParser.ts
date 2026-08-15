import { parseDocumentText } from './documentParser';

export async function parsePdfBuffer(buffer: Buffer) {
  // pdf-parse v1 tries to `require('./test/data/05-versions-space.pdf')` on module load.
  // Providing that stub file prevents the ENOENT. The standard index.js is safe after that.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  const rawText = data.text || '';
  return parseDocumentText(rawText);
}
