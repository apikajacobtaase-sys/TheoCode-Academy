import { auth, currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const [profile] = await sql`
      SELECT display_name, username, bio, email, avatar_url
      FROM profiles
      WHERE user_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      profile: profile || {
        display_name: user.fullName || '',
        username: user.username || '',
        bio: '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        avatar_url: user.imageUrl || '',
      },
    });
  } catch (error: any) {
    console.error('❌ Get Profile Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}


// 🎯 PUT: Update current user's profile (THIS WAS MISSING!)
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { username, display_name, bio, location, avatar_url, website, github_url } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // Check if username is taken by another user
    if (username) {
      const existing = await sql`
        SELECT user_id FROM user_profiles 
        WHERE username = ${username} AND user_id != ${userId}
      `;
      if (existing.length > 0) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
      }
    }

    // Update the profile
    const updated = await sql`
      UPDATE user_profiles 
      SET 
        username = COALESCE(${username || null}, username),
        display_name = COALESCE(${display_name || null}, display_name),
        bio = COALESCE(${bio || null}, bio),
        location = COALESCE(${location || null}, location),
        avatar_url = COALESCE(${avatar_url || null}, avatar_url),
        website = COALESCE(${website || null}, website),
        github_url = COALESCE(${github_url || null}, github_url),
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING username, display_name, bio, location, avatar_url, website, github_url
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      username: updated[0].username,
      profile: updated[0]
    });
  } catch (error: any) {
    console.error('❌ Profile me PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}