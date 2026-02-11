import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Mock login endpoint for development/testing
 * Sets a mock session cookie without requiring OAuth
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Mock login not available in production' },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const mockUser = body.user || {
    userId: 'mock-bargainer-id',
    name: 'Test User',
    email: 'test@example.com',
  };

  const session = {
    userId: mockUser.userId,
    secondmeId: mockUser.userId,
    name: mockUser.name,
    email: mockUser.email,
    image: null,
  };

  const cookieStore = await cookies();
  cookieStore.set('secondme_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return NextResponse.json({
    success: true,
    user: session,
    message: 'Mock login successful. You can now create bargain sessions.',
  });
}
