import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const vendors = await prisma.vendor.findMany({
      include: {
        categories: { include: { category: true } },
        claims: true,
        verificationRecord: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const claims = await prisma.vendorClaim.findMany({
      where: { status: 'PENDING' },
      include: { vendor: true },
    });

    return NextResponse.json({ vendors, claims });
  } catch (error) {
    console.error('Admin fetch vendors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
