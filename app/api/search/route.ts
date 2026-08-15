import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.max(parseInt(searchParams.get('limit') || '20', 10), 1);
    const skip = (page - 1) * limit;

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

    // Global partial text search across all schema fields
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

    // Individual item filters (partial matching)
    if (unique_id) {
      conditions.push({ unique_id: { contains: unique_id, mode: 'insensitive' } });
    }
    if (name) {
      conditions.push({ name: { contains: name, mode: 'insensitive' } });
    }
    if (father_or_spouse_name) {
      conditions.push({ father_or_spouse_name: { contains: father_or_spouse_name, mode: 'insensitive' } });
    }
    if (age) {
      conditions.push({ age: { contains: age, mode: 'insensitive' } });
    }
    if (address) {
      conditions.push({ address: { contains: address, mode: 'insensitive' } });
    }
    if (mobile_number) {
      conditions.push({ mobile_number: { contains: mobile_number, mode: 'insensitive' } });
    }
    if (occupation) {
      conditions.push({ occupation: { contains: occupation, mode: 'insensitive' } });
    }
    if (education) {
      conditions.push({ education: { contains: education, mode: 'insensitive' } });
    }
    if (diksha_date) {
      conditions.push({ diksha_date: { contains: diksha_date, mode: 'insensitive' } });
    }
    if (diksha_guru) {
      conditions.push({ diksha_guru: { contains: diksha_guru, mode: 'insensitive' } });
    }

    const whereClause: Prisma.PersonWhereInput =
      conditions.length === 0
        ? {}
        : conditions.length === 1
        ? conditions[0]
        : { AND: conditions };

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
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
