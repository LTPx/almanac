import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

export async function middleware(req) {
  const session = await getSession({ req });

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}
