import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.userId },
      include: {
        vendor: {
          include: {
            categories: { include: { category: true } },
            reputation: true,
          },
        },
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Fetch favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to favorite a vendor' }, { status: 401 });
    }

    const { vendorId } = await request.json();

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.userId,
        vendorId,
      },
    });

    // Increment favoritesCount on analytics
    try {
      await prisma.vendorAnalytics.upsert({
        where: { vendorId },
        update: { favoritesCount: { increment: 1 } },
        create: { vendorId, favoritesCount: 1 },
      });
    } catch (e) {
      console.error('Failed to update analytics favorites:', e);
    }

    return NextResponse.json({ success: true, favorite });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return NextResponse.json({ error: 'Internal server error or record already exists' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    await prisma.favorite.delete({
      where: {
        userId_vendorId: {
          userId: session.userId,
          vendorId,
        },
      },
    });

    // Decrement favoritesCount on analytics if possible
    try {
      await prisma.vendorAnalytics.update({
        where: { vendorId },
        data: { favoritesCount: { decrement: 1 } },
      });
    } catch (e) {
      console.error('Failed to decrement analytics favorites:', e);
    }

    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Delete favorite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
