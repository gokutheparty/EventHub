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

    // Set status to REJECTED
    const updatedClaim = await prisma.vendorClaim.update({
      where: { id: claimId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Claim request rejected successfully.',
      claim: updatedClaim,
    });
  } catch (error) {
    console.error('Reject claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
