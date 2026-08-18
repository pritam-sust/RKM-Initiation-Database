import { getAdminSession } from '@/lib/auth';
import { parseDocBuffer } from '@/lib/parser/docParser';
import { RawParsedPerson, validateAndStatusRecords } from '@/lib/parser/documentParser';
import { parseDocxBuffer } from '@/lib/parser/docxParser';
import { parseExcelBuffer } from '@/lib/parser/excelParser';
import { parsePdfBuffer } from '@/lib/parser/pdfParser';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

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
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const isDocx = fileName.endsWith('.docx');
    const isDoc = fileName.endsWith('.doc') && !isDocx;
    const isXlsx = fileName.endsWith('.xlsx');
    const isXls = fileName.endsWith('.xls') && !isXlsx;
    const isPdf = fileName.endsWith('.pdf');

    if (!isDocx && !isDoc && !isXlsx && !isXls && !isPdf) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a Word (.docx, .doc), Excel (.xlsx, .xls), or PDF (.pdf) file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedRecords: RawParsedPerson[] = [];

    if (isDocx) {
      parsedRecords = await parseDocxBuffer(buffer);
    } else if (isDoc) {
      parsedRecords = await parseDocBuffer(buffer);
    } else if (isXlsx || isXls) {
      parsedRecords = parseExcelBuffer(buffer);
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
        message: 'No records matching Initiation Number pattern or valid tabular headers found in document.',
      });
    }

    const summary = await validateAndStatusRecords(parsedRecords);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('File parse API error:', error);
    return NextResponse.json(
      { error: 'Failed to process file. Please ensure valid document or spreadsheet formatting.' },
      { status: 500 }
    );
  }
}
