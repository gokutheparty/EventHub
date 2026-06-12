import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: { userId: session.userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const availabilities = await prisma.availabilityRecord.findMany({
      where: { vendorId: vendor.id },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Fetch availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: { userId: session.userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const { date, status, notes } = await request.json();

    if (!date || !status) {
      return NextResponse.json({ error: 'Date and status are required' }, { status: 400 });
    }

    const parsedDate = new Date(date);

    // Upsert date availability record
    const availability = await prisma.availabilityRecord.upsert({
      where: {
        vendorId_date: {
          vendorId: vendor.id,
          date: parsedDate,
        },
      },
      update: {
        status,
        notes,
      },
      create: {
        vendorId: vendor.id,
        date: parsedDate,
        status,
        notes,
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Add availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Availability record ID is required' }, { status: 400 });
    }

    await prisma.availabilityRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Availability record removed' });
  } catch (error) {
    console.error('Delete availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
