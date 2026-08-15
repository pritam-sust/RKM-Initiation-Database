import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { personSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const whereClause = query
      ? {
          OR: [
            { unique_id: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive' as const } },
            { address: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where: whereClause,
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.person.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: persons,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (error) {
    console.error('Admin GET Persons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parseResult = personSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { unique_id, name, address, diksha_date } = parseResult.data;

    // Check if unique_id already exists
    const existing = await prisma.person.findUnique({
      where: { unique_id },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Unique ID "${unique_id}" already exists.` },
        { status: 409 }
      );
    }

    const newPerson = await prisma.person.create({
      data: {
        unique_id,
        name,
        address,
        diksha_date: diksha_date || null,
      },
    });

    return NextResponse.json({ success: true, data: newPerson }, { status: 201 });
  } catch (error) {
    console.error('Admin POST Person error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
