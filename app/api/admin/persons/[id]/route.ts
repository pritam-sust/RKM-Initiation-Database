import { getAdminSession } from '@/lib/auth';
import { normalizeDateToSortable } from '@/lib/dateUtils';
import { prisma } from '@/lib/db';
import { personSchema } from '@/lib/validators';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const person = await prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ data: person });
  } catch (error) {
    console.error('Admin GET Person by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parseResult = personSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { unique_id, name, father_or_spouse_name, age, address, mobile_number, occupation, education, diksha_date, diksha_guru, diksha_venue, diksha_ceremony_serial } = parseResult.data;

    // Check if unique_id is taken by another record
    const existing = await prisma.person.findFirst({
      where: {
        unique_id,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Initiation Number "${unique_id}" is already used by another record.` },
        { status: 409 }
      );
    }

    const cleanAge = age ? age.replace(/[$৳₹€£¥]/g, '').replace(/\.00$/, '').trim() : null;
    const sortableDate = normalizeDateToSortable(diksha_date);

    const updated = await prisma.person.update({
      where: { id },
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin PUT Person error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.person.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin DELETE Person error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
