import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role !== 'CUSTOMER' && role !== 'VENDOR' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create User
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
      },
    });

    // If role is VENDOR, initialize a blank Vendor listing and metadata
    if (role === 'VENDOR') {
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          name: `${fullName}'s Service`,
          location: 'Accra, Ghana', // Placeholder defaults
          city: 'Accra',
          region: 'Greater Accra',
          country: 'Ghana',
        },
      });

      // Initialize reputation score
      await prisma.reputationScore.create({
        data: {
          vendorId: vendor.id,
          averageRating: 0.0,
          reviewVolume: 0,
          responseSpeedMinutes: 0,
          inquiryConversionRate: 0.0,
          profileCompletenessPct: 10,
          bookingCompletionRate: 0.0,
        },
      });

      // Initialize analytics
      await prisma.vendorAnalytics.create({
        data: {
          vendorId: vendor.id,
          profileViews: 0,
          inquiryCount: 0,
          favoritesCount: 0,
          proposalCount: 0,
        },
      });
    }

    // Create Session cookie
    await createSession(user.id, user.role, user.fullName);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
