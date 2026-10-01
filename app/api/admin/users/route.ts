import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);

    // Check if requester is admin (first user or has admin flag)
    const adminCheck = await sql`
      SELECT user_id FROM admin_users WHERE user_id = ${userId}
    `;

    // If admin_users table doesn't exist, treat first user as admin
    let isAdmin = adminCheck.length > 0;
    if (!isAdmin) {
      const allAdmins = await sql`SELECT COUNT(*)::int as count FROM admin_users`;
      if (allAdmins[0].count === 0) isAdmin = true; // First user = admin
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all users with their stats
    const users = await sql`
      SELECT 
        up.user_id,
        up.full_name,
        up.email,
        up.avatar_url,
        up.created_at,
        COALESCE((SELECT COUNT(*)::int FROM lesson_progress lp WHERE lp.user_id = up.user_id AND lp.completed = true), 0) as lessons_completed,
        COALESCE((SELECT COUNT(*)::int FROM module_progress mp WHERE mp.user_id = up.user_id AND mp.completed = true), 0) as modules_completed,
        COALESCE((SELECT ROUND(AVG(mp.score))::int FROM module_progress mp WHERE mp.user_id = up.user_id), 0) as average_score,
        EXISTS(SELECT 1 FROM admin_users au WHERE au.user_id = up.user_id) as is_admin
      FROM user_profiles up
      ORDER BY up.created_at DESC
    `;

    return NextResponse.json({ 
      users,
      totalUsers: users.length,
      adminCount: users.filter((u: any) => u.is_admin).length
    });
  } catch (error: any) {
    console.error('Users API Error:', error.message);
    return NextResponse.json({ error: error.message, users: [] }, { status: 500 });
  }
}

// Toggle admin status
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId, makeAdmin } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    if (makeAdmin) {
      await sql`
        INSERT INTO admin_users (user_id) VALUES (${targetUserId})
        ON CONFLICT (user_id) DO NOTHING
      `;
    } else {
      await sql`DELETE FROM admin_users WHERE user_id = ${targetUserId}`;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}