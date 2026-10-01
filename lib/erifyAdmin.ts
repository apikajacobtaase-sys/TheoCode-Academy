import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function verifyAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    return { isAdmin: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  // Fetch user's metadata from Clerk
  const { user } = await (await import('@clerk/nextjs/server')).currentUser();
  
  if (!user || user.publicMetadata?.isAdmin !== true) {
    return { isAdmin: false, error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) };
  }

  return { isAdmin: true, userId };
}