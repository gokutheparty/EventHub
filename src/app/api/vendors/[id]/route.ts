import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        categories: {
          include: { category: true },
        },
        projects: {
          include: { images: true },
        },
        reviews: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        reputation: true,
        availabilities: {
          orderBy: { date: 'asc' },
        },
        analytics: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Increment profile views in background analytics
    try {
      await prisma.vendorAnalytics.upsert({
        where: { vendorId: id },
        update: { profileViews: { increment: 1 } },
        create: { vendorId: id, profileViews: 1 },
      });
    } catch (err) {
      console.error('Failed to increment analytics views:', err);
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Fetch vendor details API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
