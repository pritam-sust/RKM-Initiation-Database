import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
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
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
