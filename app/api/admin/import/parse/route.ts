import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { parseDocxBuffer } from '@/lib/parser/docxParser';
import { parsePdfBuffer } from '@/lib/parser/pdfParser';
import { validateAndStatusRecords } from '@/lib/parser/documentParser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const isDocx = fileName.endsWith('.docx');
    const isPdf = fileName.endsWith('.pdf');

    if (!isDocx && !isPdf) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a .docx or .pdf document.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedRecords: Array<{
      unique_id: string;
      name: string;
      address: string;
      diksha_date?: string | null;
    }> = [];

    if (isDocx) {
      parsedRecords = await parseDocxBuffer(buffer);
    } else if (isPdf) {
      parsedRecords = await parsePdfBuffer(buffer);
    }

    if (!parsedRecords || parsedRecords.length === 0) {
      return NextResponse.json({
        total: 0,
        validCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
        records: [],
        message: 'No records matching Unique ID pattern found in document.',
      });
    }

    const summary = await validateAndStatusRecords(parsedRecords);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('File parse API error:', error);
    return NextResponse.json(
      { error: 'Failed to process document file. Please ensure valid .docx or .pdf formatting.' },
      { status: 500 }
    );
  }
}
