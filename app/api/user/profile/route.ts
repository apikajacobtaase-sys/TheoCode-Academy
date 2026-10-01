import { auth, clerkClient } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);
    
    const profile = await sql`
      SELECT user_id, full_name, username, profile_image_url, is_name_verified
      FROM user_profiles
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({ 
      profile: profile[0] || { user_id: userId, full_name: '', username: '', profile_image_url: '', is_name_verified: false } 
    });
  } catch (error: any) {
    console.error('❌ Profile GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { full_name, username, profile_image_url, is_name_verified } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Sync to Clerk (Safely wrapped in try/catch so it doesn't break the DB save)
    try {
      const clerk = await clerkClient();
      const nameParts = full_name ? full_name.split(' ') : [];
      await clerk.users.updateUser(userId, {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
      });
    } catch (clerkError) {
      console.warn('Clerk sync warning (non-fatal):', clerkError);
    }

    // 🎯 Save to our database
    await sql`
      INSERT INTO user_profiles (user_id, full_name, username, profile_image_url, is_name_verified, updated_at)
      VALUES (${userId}, ${full_name}, ${username}, ${profile_image_url}, ${is_name_verified}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = ${full_name},
        username = ${username},
        profile_image_url = ${profile_image_url},
        is_name_verified = ${is_name_verified},
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Profile PUT Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}