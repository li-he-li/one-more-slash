import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Mock login endpoint for development/testing
 * Sets a mock session cookie without requiring OAuth
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const mockUser = body.user || {
    userId: 'mock-bargainer-id',
    name: 'Dev User',
    email: 'dev@example.com',
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
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return NextResponse.json({
    success: true,
    user: session,
    message: 'Mock login successful. You can now create bargain sessions.',
  });
}
