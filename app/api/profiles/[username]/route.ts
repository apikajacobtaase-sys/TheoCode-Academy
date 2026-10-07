import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { userId: currentUserId } = await auth();

    const sql = neon(process.env.DATABASE_URL!);

    // 1. Fetch the profile
    const profile = await sql`
      SELECT * FROM user_profiles WHERE username = ${username}
    `;

    if (profile.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const p = profile[0];
    const isOwner = currentUserId === p.user_id;

    // 2. Calculate stats
    const stats = await sql`
      SELECT 
        COALESCE(SUM(c.points), 0) as total_points,
        COUNT(DISTINCT cp.challenge_id) as challenges_solved
      FROM challenge_progress cp
      JOIN challenges c ON cp.challenge_id = c.id
      WHERE cp.user_id = ${p.user_id} AND cp.status = 'solved'
    `;

    // 3. Calculate global rank
    const rankResult = await sql`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT cp.user_id, SUM(c.points) as total
        FROM challenge_progress cp
        JOIN challenges c ON cp.challenge_id = c.id
        WHERE cp.status = 'solved'
        GROUP BY cp.user_id
        HAVING SUM(c.points) > ${stats[0].total_points}
      ) as higher
    `;

    // 4. Fetch squads
    const squads = await sql`
      SELECT s.id, s.name, s.image_url
      FROM squad_members sm
      JOIN squads s ON sm.squad_id = s.id
      WHERE sm.user_id = ${p.user_id} AND sm.status = 'approved'
      LIMIT 10
    `;

    // 5. Fetch recent activity (last 5 solved challenges)
    const recentActivity = await sql`
      SELECT c.title, c.difficulty, c.points, cp.solved_at
      FROM challenge_progress cp
      JOIN challenges c ON cp.challenge_id = c.id
      WHERE cp.user_id = ${p.user_id} AND cp.status = 'solved'
      ORDER BY cp.solved_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      isOwner,
      profile: p,
      stats: {
        totalPoints: parseInt(stats[0].total_points) || 0,
        challengesSolved: parseInt(stats[0].challenges_solved) || 0,
        globalRank: parseInt(rankResult[0].rank) || 0
      },
      squads,
      recentActivity
    });

  } catch (error: any) {
    console.error('❌ Profile GET Error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}