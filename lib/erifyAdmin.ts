import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function verifyAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    return { 
      isAdmin: false, 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    };
  }

  // 🎯 FIX: currentUser() returns the user object directly, not { user }
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.isAdmin !== true) {
    return { 
      isAdmin: false, 
      error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) 
    };
  }

  return { isAdmin: true, userId };
}