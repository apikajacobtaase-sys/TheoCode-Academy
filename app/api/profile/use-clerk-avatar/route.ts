import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkAvatarUrl = user.imageUrl;
    if (!clerkAvatarUrl) {
      return NextResponse.json(
        { error: 'No avatar found on your Clerk account' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Upsert the profile with the Clerk avatar URL
    await sql`
      INSERT INTO profiles (user_id, avatar_url, updated_at)
      VALUES (${user.id}, ${clerkAvatarUrl}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET avatar_url = ${clerkAvatarUrl}, updated_at = NOW()
    `;

    console.log('✅ Clerk avatar synced for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Clerk avatar synced successfully',
      avatar_url: clerkAvatarUrl,
    });
  } catch (error: any) {
    console.error('❌ Use Clerk Avatar Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Clerk avatar', details: error.message },
      { status: 500 }
    );
  }
}