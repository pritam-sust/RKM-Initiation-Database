import { getAdminSession } from '@/lib/auth';
import { getDateSearchVariants, normalizeDateToSortable } from '@/lib/dateUtils';
import { prisma } from '@/lib/db';
import { personSchema } from '@/lib/validators';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

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

    let orderBy: Prisma.PersonOrderByWithRelationInput | Prisma.PersonOrderByWithRelationInput[];

    if (sortByParam === 'diksha_date') {
      // True chronological sorting using normalized ISO date column (nulls placed at end)
      orderBy = {
        diksha_date_sort: {
          sort: sortOrderParam,
          nulls: 'last',
        },
      };
    } else {
      const sortFieldMap: Record<string, keyof Prisma.PersonOrderByWithRelationInput> = {
        name: 'name',
        diksha_guru: 'diksha_guru',
        diksha_venue: 'diksha_venue',
        diksha_ceremony_serial: 'diksha_ceremony_serial',
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
      orderBy = {
        [sortField]: sortOrderParam,
      };
    }

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
    const diksha_venue = searchParams.get('diksha_venue')?.trim();
    const diksha_ceremony_serial = searchParams.get('diksha_ceremony_serial')?.trim();

    const conditions: Prisma.PersonWhereInput[] = [];

    if (query) {
      // Check if global query has commas (multiple IDs or search terms)
      if (query.includes(',') || query.includes('，') || query.includes('、')) {
        const queryTokens = query
          .split(/[,，、]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        if (queryTokens.length > 1) {
          conditions.push({
            OR: queryTokens.flatMap((token) => {
              const dateVariants = getDateSearchVariants(token);
              return [
                { unique_id: { contains: token, mode: 'insensitive' as const } },
                { name: { contains: token, mode: 'insensitive' as const } },
                { diksha_guru: { contains: token, mode: 'insensitive' as const } },
                { diksha_venue: { contains: token, mode: 'insensitive' as const } },
                ...dateVariants.map((dv) => ({ diksha_date: { contains: dv, mode: 'insensitive' as const } })),
                ...dateVariants.map((dv) => ({ diksha_date_sort: { contains: dv, mode: 'insensitive' as const } })),
              ];
            }),
          });
        }
      } else {
        const dateVariants = getDateSearchVariants(query);
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
            { diksha_venue: { contains: query, mode: 'insensitive' } },
            { diksha_ceremony_serial: { contains: query, mode: 'insensitive' } },
            ...dateVariants.map((dv) => ({ diksha_date: { contains: dv, mode: 'insensitive' as const } })),
            ...dateVariants.map((dv) => ({ diksha_date_sort: { contains: dv, mode: 'insensitive' as const } })),
          ],
        });
      }
    }

    // Support comma-separated Unique IDs / Initiation Numbers
    if (unique_id) {
      const idTokens = unique_id
        .split(/[,，、]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (idTokens.length > 1) {
        conditions.push({
          OR: idTokens.map((token) => ({
            unique_id: { contains: token, mode: 'insensitive' as const },
          })),
        });
      } else if (idTokens.length === 1) {
        conditions.push({ unique_id: { contains: idTokens[0], mode: 'insensitive' } });
      }
    }

    if (name) conditions.push({ name: { contains: name, mode: 'insensitive' } });
    if (father_or_spouse_name) conditions.push({ father_or_spouse_name: { contains: father_or_spouse_name, mode: 'insensitive' } });
    if (age) conditions.push({ age: { contains: age, mode: 'insensitive' } });
    if (address) conditions.push({ address: { contains: address, mode: 'insensitive' } });
    if (mobile_number) conditions.push({ mobile_number: { contains: mobile_number, mode: 'insensitive' } });
    if (occupation) conditions.push({ occupation: { contains: occupation, mode: 'insensitive' } });
    if (education) conditions.push({ education: { contains: education, mode: 'insensitive' } });

    // Bilingual Date Search (supports Bengali digits, English digits, slashes, dashes, years, ISO)
    if (diksha_date) {
      const dateVariants = getDateSearchVariants(diksha_date);
      conditions.push({
        OR: [
          ...dateVariants.map((dv) => ({ diksha_date: { contains: dv, mode: 'insensitive' as const } })),
          ...dateVariants.map((dv) => ({ diksha_date_sort: { contains: dv, mode: 'insensitive' as const } })),
        ],
      });
    }

    if (diksha_guru) conditions.push({ diksha_guru: { contains: diksha_guru, mode: 'insensitive' } });
    if (diksha_venue) conditions.push({ diksha_venue: { contains: diksha_venue, mode: 'insensitive' } });
    if (diksha_ceremony_serial) conditions.push({ diksha_ceremony_serial: { contains: diksha_ceremony_serial, mode: 'insensitive' } });

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
      sortBy: sortByParam || 'created_at',
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

    const {
      unique_id,
      name,
      father_or_spouse_name,
      age,
      address,
      mobile_number,
      occupation,
      education,
      diksha_date,
      diksha_guru,
      diksha_venue,
      diksha_ceremony_serial,
    } = parseResult.data;

    // Check if unique_id already exists
    const existing = await prisma.person.findUnique({
      where: { unique_id },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Initiation Number "${unique_id}" already exists.` },
        { status: 409 }
      );
    }

    const cleanAge = age ? age.replace(/[$৳₹€£¥]/g, '').replace(/\.00$/, '').trim() : null;
    const sortableDate = normalizeDateToSortable(diksha_date);

    const newPerson = await prisma.person.create({
      data: {
        unique_id,
        name,
        father_or_spouse_name: father_or_spouse_name || null,
        age: cleanAge || null,
        address,
        mobile_number: mobile_number || null,
        occupation: occupation || null,
        education: education || null,
        diksha_date: diksha_date || null,
        diksha_date_sort: sortableDate,
        diksha_guru: diksha_guru || null,
        diksha_venue: diksha_venue || null,
        diksha_ceremony_serial: diksha_ceremony_serial || null,
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
