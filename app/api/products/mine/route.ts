import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserProducts } from '@/lib/product-service';

/**
 * GET /api/products/mine - Get current user's products (all statuses)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('secondme_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId || session.secondmeId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'expired' | 'deleted' | null;

    const products = await getUserProducts(userId, status || undefined);

    return NextResponse.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
