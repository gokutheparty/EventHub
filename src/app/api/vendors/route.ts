import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const city = searchParams.get('city');
    const query = searchParams.get('q');
    const verifiedOnly = searchParams.get('verified') === 'true';
    const minRating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : null;

    // Build Prisma query filters
    const where: any = {};

    if (categorySlug) {
      where.categories = {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      };
    }

    if (city) {
      where.city = {
        equals: city,
        mode: 'insensitive',
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (verifiedOnly) {
      where.isVerified = true;
    }

    if (minRating) {
      where.reputation = {
        averageRating: {
          gte: minRating,
        },
      };
    }

    // Fetch vendors matching criteria
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        categories: {
          include: { category: true },
        },
        projects: {
          include: { images: true },
          take: 1, // Only grab a thumbnail
        },
        reputation: true,
        featuredPlacements: {
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
    });

    // Sort: Featured vendors (active placements) first, sorted by priority, then by reputation score, then by date
    const sortedVendors = vendors.sort((a, b) => {
      const aFeatured = a.featuredPlacements.length > 0;
      const bFeatured = b.featuredPlacements.length > 0;

      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;

      if (aFeatured && bFeatured) {
        const aPriority = a.featuredPlacements[0].priority;
        const bPriority = b.featuredPlacements[0].priority;
        if (aPriority !== bPriority) return bPriority - aPriority;
      }

      // Fallback to average rating
      const aRating = a.reputation?.averageRating ?? 0;
      const bRating = b.reputation?.averageRating ?? 0;
      if (aRating !== bRating) return bRating - aRating;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Format response payload
    const results = sortedVendors.map((v) => {
      const primaryImage = v.projects[0]?.images[0]?.imageUrl || null;
      return {
        id: v.id,
        name: v.name,
        description: v.description,
        location: v.location,
        city: v.city,
        region: v.region,
        country: v.country,
        latitude: v.latitude,
        longitude: v.longitude,
        phone: v.phone,
        website: v.website,
        isVerified: v.isVerified,
        verificationLevel: v.verificationLevel,
        isFeatured: v.featuredPlacements.length > 0,
        categories: v.categories.map((c) => c.category.name),
        thumbnail: primaryImage,
        reputation: v.reputation
          ? {
              averageRating: v.reputation.averageRating,
              reviewVolume: v.reputation.reviewVolume,
            }
          : { averageRating: 0.0, reviewVolume: 0 },
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search vendors API error:', error);
    return NextResponse.json({ error: 'Failed to search vendors' }, { status: 500 });
  }
}
