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

    const claimId = params.id;
    const claim = await prisma.vendorClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim request not found' }, { status: 404 });
    }

    // Find the User account associated with this email
    const claimantUser = await prisma.user.findUnique({
      where: { email: claim.claimantEmail },
    });

    if (!claimantUser) {
      return NextResponse.json(
        { error: 'No user account exists with this email. The claimant must register an account first.' },
        { status: 400 }
      );
    }

    // Link Vendor to User and approve Claim
    await prisma.$transaction([
      prisma.vendor.update({
        where: { id: claim.vendorId },
        data: { userId: claimantUser.id },
      }),
      prisma.vendorClaim.update({
        where: { id: claimId },
        data: { status: 'VERIFIED' },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Claim approved and listing transferred successfully.' });
  } catch (error) {
    console.error('Approve claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
