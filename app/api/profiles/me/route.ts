import { auth, currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = user.publicMetadata?.role === 'admin';
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Get username from Clerk
    let username = user.username || '';
    const displayName = user.firstName || user.username || 'User';

    // Check existing profile
    const existing = await sql`
      SELECT username FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existing.length > 0) {
      // Profile exists - use DB username if set, otherwise use Clerk username
      const dbUsername = existing[0].username;
      
      if (dbUsername) {
        return NextResponse.json({ username: dbUsername, isAdmin });
      }
      
      // DB username is null - try to fill it from Clerk
      if (username) {
        await sql`
          UPDATE user_profiles SET username = ${username}, display_name = ${displayName}
          WHERE user_id = ${userId}
        `;
        return NextResponse.json({ username, isAdmin });
      }

      // Neither has a username - generate one from email
      const email = user.emailAddresses?.[0]?.emailAddress || '';
      const emailPrefix = email.split('@')[0] || 'user';
      username = `${emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '')}_${userId.slice(-4)}`;
      
      await sql`
        UPDATE user_profiles SET username = ${username}, display_name = ${displayName}
        WHERE user_id = ${userId}
      `;
      return NextResponse.json({ username, isAdmin });
    }

    // No profile exists - create one
    if (!username) {
      const email = user.emailAddresses?.[0]?.emailAddress || '';
      const emailPrefix = email.split('@')[0] || 'user';
      username = `${emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '')}_${userId.slice(-4)}`;
    }

    await sql`
      INSERT INTO user_profiles (user_id, username, display_name, is_admin)
      VALUES (${userId}, ${username}, ${displayName}, ${isAdmin})
      ON CONFLICT (user_id) DO UPDATE SET username = ${username}, display_name = ${displayName}
    `;

    return NextResponse.json({ username, isAdmin });
  } catch (error: any) {
    console.error('❌ Profile me GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}