import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Authenticate: must be the creator of the event request OR a vendor
    const eventRequest = await prisma.eventRequest.findUnique({
      where: { id: requestId },
    });

    if (!eventRequest) {
      return NextResponse.json({ error: 'Event request not found' }, { status: 404 });
    }

    if (session.role === 'CUSTOMER' && eventRequest.customerId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized access to proposals' }, { status: 401 });
    }

    const proposals = await prisma.vendorProposal.findMany({
      where: { requestId },
      include: {
        vendor: {
          include: {
            reputation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Fetch proposals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only registered vendors can submit proposals' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: { userId: session.userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const { requestId, priceEstimate, proposalText } = await request.json();

    if (!requestId || !proposalText) {
      return NextResponse.json({ error: 'Request ID and pitch description are required' }, { status: 400 });
    }

    const proposal = await prisma.vendorProposal.create({
      data: {
        requestId,
        vendorId: vendor.id,
        priceEstimate: priceEstimate ? parseFloat(priceEstimate) : null,
        proposalText,
        status: 'SUBMITTED',
      },
    });

    // Update analytics
    try {
      await prisma.vendorAnalytics.upsert({
        where: { vendorId: vendor.id },
        update: { proposalCount: { increment: 1 } },
        create: { vendorId, proposalCount: 1 },
      });
    } catch (e) {
      console.error('Failed to update analytics proposals:', e);
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Submit proposal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
