import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { bulkImportSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parseResult = bulkImportSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid import data payload', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { records } = parseResult.data;

    // Check for existing records to enforce unique_id constraint
    const uniqueIds = records.map((r) => r.unique_id);
    const existing = await prisma.person.findMany({
      where: { unique_id: { in: uniqueIds } },
      select: { unique_id: true },
    });

    const existingSet = new Set(existing.map((e) => e.unique_id));
    const validRecordsToInsert = records.filter((r) => !existingSet.has(r.unique_id));

    if (validRecordsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid non-duplicate records to import.' },
        { status: 400 }
      );
    }

    // Execute bulk insert in a single transaction
    const createdCount = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const rec of validRecordsToInsert) {
        await tx.person.create({
          data: {
            unique_id: rec.unique_id,
            name: rec.name,
            address: rec.address,
            diksha_date: rec.diksha_date || null,
          },
        });
        count++;
      }
      return count;
    });

    return NextResponse.json({
      success: true,
      importedCount: createdCount,
      skippedDuplicates: records.length - validRecordsToInsert.length,
    });
  } catch (error) {
    console.error('Import confirm API error:', error);
    return NextResponse.json(
      { error: 'Database import transaction failed.' },
      { status: 500 }
    );
  }
}
