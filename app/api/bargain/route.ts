import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createBargainSession } from '@/lib/bargain-service';

interface CreateBargainRequest {
  productId: string;
  publishPrice: number;
  targetPrice: number;
  publisherId: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('secondme_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const bargainerId = session.userId || session.secondmeId;

    const body: CreateBargainRequest = await request.json();

    // For demo, we'll use a mock publisher ID
    // In production, this would come from the product owner
    const publisherId = body.publisherId || 'mock-publisher-id';

    const bargainSession = await createBargainSession({
      productId: body.productId,
      publisherId,
      bargainerId,
      publishPrice: body.publishPrice,
      targetPrice: body.targetPrice,
    });

    return NextResponse.json({
      sessionId: bargainSession.id,
      session: bargainSession,
    });
  } catch (error) {
    console.error('Error creating bargain session:', error);
    return NextResponse.json(
      { error: 'Failed to create bargain session' },
      { status: 500 }
    );
  }
}
