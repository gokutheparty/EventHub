import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to post a review' }, { status: 401 });
    }

    const { rating, reviewText } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    const vendorId = params.id;

    // Save Review
    const review = await prisma.review.create({
      data: {
        vendorId,
        userId: session.userId,
        rating: parseInt(rating),
        reviewText,
      },
    });

    // Recalculate Reputation Score in transaction
    const allReviews = await prisma.review.findMany({
      where: { vendorId },
    });

    const reviewVolume = allReviews.length;
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewVolume;

    // Update reputation score table
    await prisma.reputationScore.upsert({
      where: { vendorId },
      update: {
        averageRating,
        reviewVolume,
      },
      create: {
        vendorId,
        averageRating,
        reviewVolume,
        responseSpeedMinutes: 0,
        inquiryConversionRate: 0.0,
        profileCompletenessPct: 20,
        bookingCompletionRate: 0.0,
      },
    });

    // Increment analytics review/proposal metric counts
    try {
      await prisma.vendorAnalytics.upsert({
        where: { vendorId },
        update: { favoritesCount: { increment: 1 } }, // Using favorite count as mock positive interaction counter
        create: { vendorId, favoritesCount: 1 },
      });
    } catch (err) {
      console.error('Failed to update analytics reviews:', err);
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Create review API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
