import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let stagingItems = await prisma.vendorStaging.findMany({
      where: { approvalStatus: 'PENDING' },
      orderBy: { confidenceScore: 'desc' },
    });

    // Seed mock crawling targets for demo purposes if staging is empty
    if (stagingItems.length === 0) {
      await prisma.vendorStaging.createMany({
        data: [
          {
            name: 'Gold Star Ushers & Protocol',
            description: 'Professional ushering agency offering guest logistics, hostesses, and protocol support for luxury weddings and events in Kumasi.',
            location: '12 Bantama High St, Kumasi',
            city: 'Kumasi',
            region: 'Ashanti',
            phone: '+233 20 888 9991',
            email: 'info@goldstarushers.com',
            website: 'https://goldstarushers.com',
            categories: ['Ushering Agencies'],
            confidenceScore: 0.95,
            trustScore: 0.88,
            sourceUrl: 'https://instagram.com/goldstarushers',
          },
          {
            name: 'Deluxe Decors & Floral design',
            description: 'Stunning luxury floral setups, lighting grids, and wedding stages in Accra and Tema.',
            location: 'Gbawe Road, Accra',
            city: 'Accra',
            region: 'Greater Accra',
            phone: '+233 55 122 3445',
            categories: ['Decorators'],
            confidenceScore: 0.82,
            trustScore: 0.75,
            sourceUrl: 'https://facebook.com/deluxedecorsgh',
          },
          {
            name: 'Dynamic Sound Live Band',
            description: 'Highlife, jazz, and contemporary pop music covers live band for weddings and outdoor corporate events.',
            location: 'Osu Oxford Street, Accra',
            city: 'Accra',
            region: 'Greater Accra',
            phone: '+233 24 999 0000',
            categories: ['Live Bands'],
            confidenceScore: 0.78,
            trustScore: 0.65,
            sourceUrl: 'https://youtube.com/dynamicsoundgh',
          }
        ]
      });

      stagingItems = await prisma.vendorStaging.findMany({
        where: { approvalStatus: 'PENDING' },
        orderBy: { confidenceScore: 'desc' },
      });
    }

    return NextResponse.json(stagingItems);
  } catch (error) {
    console.error('Fetch staging vendors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
