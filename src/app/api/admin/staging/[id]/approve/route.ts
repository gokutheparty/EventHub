import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stagingId = params.id;
    const stagingItem = await prisma.vendorStaging.findUnique({
      where: { id: stagingId },
    });

    if (!stagingItem) {
      return NextResponse.json({ error: 'Staging candidate not found' }, { status: 404 });
    }

    // Process categories linking
    const categoryConnects = [];
    if (stagingItem.categories && stagingItem.categories.length > 0) {
      for (const catName of stagingItem.categories) {
        // Find by name
        let category = await prisma.category.findFirst({
          where: { name: { equals: catName, mode: 'insensitive' } },
        });

        // Fallback: create category if missing
        if (!category) {
          const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          category = await prisma.category.create({
            data: { name: catName, slug },
          });
        }

        categoryConnects.push({
          category: { connect: { id: category.id } },
        });
      }
    }

    // Ingest into production Vendors table
    const vendor = await prisma.vendor.create({
      data: {
        name: stagingItem.name,
        description: stagingItem.description,
        location: stagingItem.location || 'Ghana',
        city: stagingItem.city,
        region: stagingItem.region,
        country: stagingItem.country,
        latitude: stagingItem.latitude,
        longitude: stagingItem.longitude,
        phone: stagingItem.phone,
        email: stagingItem.email,
        website: stagingItem.website,
        socialLinks: stagingItem.socialLinks || {},
        isVerified: false, // Ingested candidates are unverified by default
        categories: {
          create: categoryConnects,
        },
      },
    });

    // Initialize reputation score placeholder
    await prisma.reputationScore.create({
      data: {
        vendorId: vendor.id,
        averageRating: 0.0,
        reviewVolume: 0,
        responseSpeedMinutes: 0,
        inquiryConversionRate: 0.0,
        profileCompletenessPct: 40, // Has some data from extraction
        bookingCompletionRate: 0.0,
      },
    });

    // Initialize analytics placeholder
    await prisma.vendorAnalytics.create({
      data: {
        vendorId: vendor.id,
        profileViews: 0,
        inquiryCount: 0,
        favoritesCount: 0,
        proposalCount: 0,
      },
    });

    // Mark staging record as approved
    await prisma.vendorStaging.update({
      where: { id: stagingId },
      data: { approvalStatus: 'APPROVED' },
    });

    // Add log
    await prisma.aiAcquisitionLog.create({
      data: {
        agentName: 'Extraction Agent',
        action: 'APPROVED_STAGING',
        details: `Ingested ${stagingItem.name} (Staging ID: ${stagingId}) into Vendor ${vendor.id}`,
      },
    });

    return NextResponse.json({ success: true, vendorId: vendor.id });
  } catch (error) {
    console.error('Ingest staging vendor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
