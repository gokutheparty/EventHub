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

    const { level, status, notes } = await request.json();

    if (!level || !status) {
      return NextResponse.json({ error: 'Missing level or status' }, { status: 400 });
    }

    const vendorId = params.id;

    // Update Vendor table
    const isApproved = status === 'APPROVED';
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        isVerified: isApproved,
        verificationLevel: isApproved ? level : null,
      },
    });

    // Create Verification record
    const verification = await prisma.verification.upsert({
      where: { vendorId },
      update: {
        verificationStatus: status,
        verificationLevel: level,
        verificationDate: new Date(),
        verifiedById: session.userId,
        notes,
      },
      create: {
        vendorId,
        verificationStatus: status,
        verificationLevel: level,
        verificationDate: new Date(),
        verifiedById: session.userId,
        notes,
      },
    });

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error('Admin verify vendor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
