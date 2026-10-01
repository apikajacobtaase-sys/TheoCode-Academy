import { auth, currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const sql = neon(process.env.DATABASE_URL!);
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
    const email = user.emailAddresses[0]?.emailAddress || null;
    const avatarUrl = user.imageUrl || null;

    await sql`
      INSERT INTO user_profiles (user_id, full_name, email, avatar_url)
      VALUES (${userId}, ${fullName}, ${email}, ${avatarUrl})
      ON CONFLICT (user_id) DO UPDATE 
      SET full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}