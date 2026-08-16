import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { personSchema } from '@/lib/validators';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '15', 10), 1), 200);
    const skip = (page - 1) * limit;

    // Sorting
    const sortByParam = searchParams.get('sortBy')?.trim();
    const sortOrderParam = searchParams.get('sortOrder')?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const sortFieldMap: Record<string, keyof Prisma.PersonOrderByWithRelationInput> = {
      name: 'name',
      diksha_guru: 'diksha_guru',
      diksha_date: 'diksha_date',
      unique_id: 'unique_id',
      created_at: 'created_at',
      updated_at: 'updated_at',
      father_or_spouse_name: 'father_or_spouse_name',
      age: 'age',
      mobile_number: 'mobile_number',
      address: 'address',
      occupation: 'occupation',
      education: 'education',
    };

    const sortField = sortByParam && sortFieldMap[sortByParam] ? sortFieldMap[sortByParam] : 'created_at';
    const orderBy: Prisma.PersonOrderByWithRelationInput = {
      [sortField]: sortOrderParam,
    };

    // Field-specific filters
    const unique_id = searchParams.get('unique_id')?.trim();
    const name = searchParams.get('name')?.trim();
    const father_or_spouse_name = searchParams.get('father_or_spouse_name')?.trim();
    const age = searchParams.get('age')?.trim();
    const address = searchParams.get('address')?.trim();
    const mobile_number = searchParams.get('mobile_number')?.trim();
    const occupation = searchParams.get('occupation')?.trim();
    const education = searchParams.get('education')?.trim();
    const diksha_date = searchParams.get('diksha_date')?.trim();
    const diksha_guru = searchParams.get('diksha_guru')?.trim();

    const conditions: Prisma.PersonWhereInput[] = [];

    if (query) {
      conditions.push({
        OR: [
          { unique_id: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { father_or_spouse_name: { contains: query, mode: 'insensitive' } },
          { age: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { mobile_number: { contains: query, mode: 'insensitive' } },
          { occupation: { contains: query, mode: 'insensitive' } },
          { education: { contains: query, mode: 'insensitive' } },
          { diksha_date: { contains: query, mode: 'insensitive' } },
          { diksha_guru: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    if (unique_id) conditions.push({ unique_id: { contains: unique_id, mode: 'insensitive' } });
    if (name) conditions.push({ name: { contains: name, mode: 'insensitive' } });
    if (father_or_spouse_name) conditions.push({ father_or_spouse_name: { contains: father_or_spouse_name, mode: 'insensitive' } });
    if (age) conditions.push({ age: { contains: age, mode: 'insensitive' } });
    if (address) conditions.push({ address: { contains: address, mode: 'insensitive' } });
    if (mobile_number) conditions.push({ mobile_number: { contains: mobile_number, mode: 'insensitive' } });
    if (occupation) conditions.push({ occupation: { contains: occupation, mode: 'insensitive' } });
    if (education) conditions.push({ education: { contains: education, mode: 'insensitive' } });
    if (diksha_date) conditions.push({ diksha_date: { contains: diksha_date, mode: 'insensitive' } });
    if (diksha_guru) conditions.push({ diksha_guru: { contains: diksha_guru, mode: 'insensitive' } });

    const whereClause: Prisma.PersonWhereInput =
      conditions.length === 0
        ? {}
        : conditions.length === 1
        ? conditions[0]
        : { AND: conditions };

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where: whereClause,
        orderBy,
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
      sortBy: sortField,
      sortOrder: sortOrderParam,
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

    const { unique_id, name, father_or_spouse_name, age, address, mobile_number, occupation, education, diksha_date, diksha_guru } = parseResult.data;

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
        father_or_spouse_name: father_or_spouse_name || null,
        age: age || null,
        address,
        mobile_number: mobile_number || null,
        occupation: occupation || null,
        education: education || null,
        diksha_date: diksha_date || null,
        diksha_guru: diksha_guru || null,
      },
    });

    return NextResponse.json({ success: true, data: newPerson }, { status: 201 });
  } catch (error) {
    console.error('Admin POST Person error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Bulk DELETE multiple records by array of IDs
 */
export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawIds = Array.isArray(body?.ids) ? body.ids : [];
    const ids = rawIds.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'No record IDs provided for deletion.' },
        { status: 400 }
      );
    }

    const result = await prisma.person.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Admin Bulk DELETE Persons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
