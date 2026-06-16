import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    const res = await fetch(`${aiServiceUrl}/crawl/${jobId}`, {
      method: 'GET',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch job status from FastAPI' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Crawl Status Proxy] Error fetching job status:', error);
    return NextResponse.json({ error: 'Failed to contact backend crawler service' }, { status: 500 });
  }
}
