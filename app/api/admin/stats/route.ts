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

    // 🎯 Count all users
    const [totalUsers] = await sql`
      SELECT COUNT(*) as count FROM user_profiles
    `;

    // 🎯 Count admins (check both database and Clerk metadata)
    const [adminCount] = await sql`
      SELECT COUNT(*) as count FROM user_profiles WHERE is_admin = true
    `;

    // 🎯 Count challenges
    const [totalChallenges] = await sql`
      SELECT COUNT(*) as count FROM challenges
    `;

    // 🎯 Count squads
    const [totalSquads] = await sql`
      SELECT COUNT(*) as count FROM squads
    `;

    // 🎯 Count solved challenges
    const [totalSolved] = await sql`
      SELECT COUNT(*) as count FROM challenge_progress WHERE status = 'solved'
    `;

    const stats = {
      totalUsers: parseInt(totalUsers.count) || 0,
      totalAdmins: parseInt(adminCount.count) || 0,
      totalChallenges: parseInt(totalChallenges.count) || 0,
      totalSquads: parseInt(totalSquads.count) || 0,
      totalSolved: parseInt(totalSolved.count) || 0
    };

    console.log('📊 Admin Stats:', stats);

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('❌ Admin Stats Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      details: error.message 
    }, { status: 500 });
  }
}