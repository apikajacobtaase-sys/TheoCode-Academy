import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function PUT(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, avatar_url, bio } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // Update or create profile
    await sql`
      INSERT INTO user_profiles (user_id, username, display_name, avatar_url, bio)
      VALUES (
        ${user.id}, 
        ${user.username}, 
        ${display_name || user.fullName || user.username}, 
        ${avatar_url},
        ${bio || null}
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Profile Update Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}