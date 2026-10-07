import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const users = await sql`
      SELECT 
        up.user_id,
        up.username,
        up.display_name,
        up.is_admin,
        COALESCE(COUNT(DISTINCT cp.challenge_id), 0) as lessons_completed,
        0 as modules_completed,
        0 as avg_score
      FROM user_profiles up
      LEFT JOIN challenge_progress cp ON up.user_id = cp.user_id AND cp.status = 'solved'
      GROUP BY up.user_id, up.username, up.display_name, up.is_admin
      ORDER BY up.created_at DESC
    `;

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('❌ Admin Users Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}