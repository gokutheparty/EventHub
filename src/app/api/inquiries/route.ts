import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { vendorId, customerName, customerEmail, customerPhone, details } = await request.json();

    if (!vendorId || !customerName || !customerEmail || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create Inquiry record
    const inquiry = await prisma.inquiry.create({
      data: {
        vendorId,
        customerName,
        customerEmail,
        customerPhone,
        details,
        status: 'PENDING',
      },
    });

    // Update analytics
    try {
      await prisma.vendorAnalytics.upsert({
        where: { vendorId },
        update: { inquiryCount: { increment: 1 } },
        create: { vendorId, inquiryCount: 1 },
      });
    } catch (e) {
      console.error('Failed to update inquiry analytics:', e);
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Create inquiry API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
