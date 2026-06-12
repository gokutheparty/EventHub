import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { vendorId, claimantEmail, claimantPhone } = await request.json();

    if (!vendorId || !claimantEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const verificationToken = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 digit code

    const claim = await prisma.vendorClaim.create({
      data: {
        vendorId,
        claimantEmail,
        claimantPhone,
        verificationToken,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Claim request submitted successfully',
      claimId: claim.id,
    });
  } catch (error) {
    console.error('Create vendor claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
