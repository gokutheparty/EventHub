import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const body = await request.json();
    const { title, eventType, guestCount, budgetRange, description, testimonial, imageUrls } = body;

    if (!title) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
    }

    // Create project and nested images
    const project = await prisma.portfolioProject.create({
      data: {
        vendorId: vendor.id,
        title,
        eventType,
        guestCount: guestCount ? parseInt(guestCount) : null,
        budgetRange,
        description,
        testimonial,
        images: {
          create: imageUrls && Array.isArray(imageUrls)
            ? imageUrls.map((url: string, index: number) => ({
                imageUrl: url,
                isPrimary: index === 0,
              }))
            : [],
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Create portfolio project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
