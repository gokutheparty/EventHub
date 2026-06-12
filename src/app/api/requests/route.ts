import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category'); // event type match

    const where: any = {
      status: 'OPEN',
    };

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (category) {
      where.eventType = { contains: category, mode: 'insensitive' };
    }

    const requests = await prisma.eventRequest.findMany({
      where,
      include: {
        customer: {
          select: { fullName: true },
        },
        proposals: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Fetch event requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only registered customers can create event requests' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      eventType,
      guestCount,
      budgetRange,
      location,
      city,
      region,
      eventDate,
      details,
    } = body;

    if (!title || !eventType || !location || !eventDate || !details) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const eventRequest = await prisma.eventRequest.create({
      data: {
        customerId: session.userId,
        title,
        eventType,
        guestCount: guestCount ? parseInt(guestCount) : null,
        budgetRange,
        location,
        city,
        region,
        eventDate: new Date(eventDate),
        details,
        status: 'OPEN',
      },
    });

    return NextResponse.json(eventRequest);
  } catch (error) {
    console.error('Create event request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
