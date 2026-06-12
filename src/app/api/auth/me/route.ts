import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    let vendorId = null;
    if (session.role === 'VENDOR') {
      const vendor = await prisma.vendor.findFirst({
        where: { userId: session.userId },
      });
      if (vendor) {
        vendorId = vendor.id;
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        role: session.role,
        fullName: session.fullName,
        vendorId,
      },
    });
  } catch (error) {
    console.error('Fetch session error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
