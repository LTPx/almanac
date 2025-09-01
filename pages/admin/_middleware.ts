import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}
