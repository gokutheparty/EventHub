import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, city, sourceUrl } = await request.json();

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    console.log(`[Crawl Proxy] Forwarding crawl request to ${aiServiceUrl}/crawl`);

    const res = await fetch(`${aiServiceUrl}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        target_city: city,
        source_url: sourceUrl || null,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Crawl Proxy] FastAPI returned error: ${errText}`);
      return NextResponse.json({ error: 'FastAPI service failed to queue crawl job' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Crawl Proxy] Error forwarding crawl request:', error);
    return NextResponse.json({ error: 'Failed to contact backend crawler service' }, { status: 500 });
  }
}
