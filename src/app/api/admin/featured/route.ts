import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vendorId, startDate, endDate, priority } = await request.json();

    if (!vendorId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Create Featured Placement
    const placement = await prisma.featuredPlacement.create({
      data: {
        vendorId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        priority: priority ? parseInt(priority) : 0,
      },
    });

    return NextResponse.json({ success: true, placement });
  } catch (error) {
    console.error('Create featured placement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
