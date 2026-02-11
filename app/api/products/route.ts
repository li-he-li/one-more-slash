import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createProduct, getActiveProducts } from '@/lib/product-service';

/**
 * GET /api/products - List all active products (for bargain hall)
 * POST /api/products - Create new product (auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const products = await getActiveProducts();

    return NextResponse.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('secondme_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const publisherId = session.userId || session.secondmeId;

    if (!publisherId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.publishPrice || typeof body.publishPrice !== 'number' || body.publishPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid publish price is required (positive number)' },
        { status: 400 }
      );
    }

    if (!body.imageUrl || typeof body.imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (!body.durationDays || ![1, 7, 30].includes(body.durationDays)) {
      return NextResponse.json(
        { error: 'Duration must be 1, 7, or 30 days' },
        { status: 400 }
      );
    }

    // Validate title length
    if (body.title.length < 2 || body.title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (body.description && body.description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be at most 500 characters' },
        { status: 400 }
      );
    }

    // Create product
    console.log('[Create Product] Request body:', body);
    console.log('[Create Product] Publisher ID:', publisherId);

    const product = await createProduct({
      title: body.title,
      description: body.description || null,
      publishPrice: body.publishPrice,
      imageUrl: body.imageUrl,
      publisherId,
      category: body.category || null,
      durationDays: body.durationDays,
    });

    console.log('[Create Product] Created product:', product);

    return NextResponse.json(
      {
        product,
        message: '商品发布成功！',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    meta: error.meta,
    cause: error.cause,
    ...(error.meta && typeof error.meta === 'object' ? {
      target: error.meta.target,
      code: error.meta.code,
      ...error.meta
    } : {})
    });

    // Check if it's a Prisma error
    if (error instanceof Error && error.message.includes('Record to create')) {
      console.error('Prisma validation error - likely foreign key or constraint issue');
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
