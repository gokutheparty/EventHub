import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized vendor access' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: { userId: session.userId },
      include: {
        categories: {
          include: { category: true },
        },
        projects: {
          include: { images: true },
        },
        reputation: true,
        analytics: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Fetch vendor profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const {
      name,
      description,
      location,
      city,
      region,
      country,
      latitude,
      longitude,
      phone,
      email,
      website,
      socialLinks,
      categoryIds, // Array of Category IDs
    } = body;

    // Build categories disconnect/connect transaction data if supplied
    const updateData: any = {
      name: name ?? vendor.name,
      description: description ?? vendor.description,
      location: location ?? vendor.location,
      city: city ?? vendor.city,
      region: region ?? vendor.region,
      country: country ?? vendor.country,
      latitude: (latitude === null || latitude === '') ? null : (latitude !== undefined && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : vendor.latitude),
      longitude: (longitude === null || longitude === '') ? null : (longitude !== undefined && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : vendor.longitude),
      phone: phone ?? vendor.phone,
      email: email ?? vendor.email,
      website: website ?? vendor.website,
      socialLinks: socialLinks ?? vendor.socialLinks,
    };

    if (categoryIds && Array.isArray(categoryIds)) {
      // Clear old associations and write new ones
      await prisma.vendorCategory.deleteMany({
        where: { vendorId: vendor.id },
      });

      updateData.categories = {
        create: categoryIds.map((id: string) => ({
          category: { connect: { id } },
        })),
      };
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: updateData,
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    // Recalculate profile completeness in background (trigger update)
    let fieldsFilled = 0;
    const fieldsToTrack = [
      updatedVendor.name,
      updatedVendor.description,
      updatedVendor.location,
      updatedVendor.phone,
      updatedVendor.email,
      updatedVendor.website,
    ];
    fieldsFilled += fieldsToTrack.filter(Boolean).length;
    if (Object.keys(updatedVendor.socialLinks as object || {}).length > 0) fieldsFilled += 1;
    if (updatedVendor.categories.length > 0) fieldsFilled += 1;

    // Estimate progress percent (max 8 items tracked)
    const completenessPct = Math.min(100, Math.round((fieldsFilled / 8) * 100));

    await prisma.reputationScore.upsert({
      where: { vendorId: vendor.id },
      update: { profileCompletenessPct: completenessPct },
      create: {
        vendorId: vendor.id,
        profileCompletenessPct: completenessPct,
      },
    });

    return NextResponse.json(updatedVendor);
  } catch (error: any) {
    console.error('Update vendor profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
