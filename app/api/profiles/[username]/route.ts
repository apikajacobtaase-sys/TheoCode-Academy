export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // 🎯 2. Calculate stats from challenge_submissions (NOT challenge_progress!)
    const stats = await sql`
      SELECT 
        COALESCE(SUM(earned_points), 0) as total_points,
        COUNT(DISTINCT challenge_id) as challenges_solved
      FROM challenge_submissions
      WHERE user_id = ${p.user_id} AND status = 'accepted'
    `;

    // 🎯 3. Calculate global rank from challenge_submissions
    const rankResult = await sql`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT user_id, SUM(earned_points) as total
        FROM challenge_submissions
        WHERE status = 'accepted'
        GROUP BY user_id
        HAVING SUM(earned_points) > ${stats[0].total_points}
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

    // 🎯 5. Fetch recent activity from challenge_submissions
    const recentActivity = await sql`
      SELECT c.title, c.difficulty, cs.earned_points as points, cs.submitted_at as solved_at
      FROM challenge_submissions cs
      JOIN challenges c ON cs.challenge_id = c.id
      WHERE cs.user_id = ${p.user_id} AND cs.status = 'accepted'
      ORDER BY cs.submitted_at DESC
      LIMIT 5
    `;

    const response = {
      success: true,
      isOwner,
      profile: p,
      stats: {
        totalPoints: Number(stats[0].total_points) || 0,
        challengesSolved: Number(stats[0].challenges_solved) || 0,
        globalRank: Number(rankResult[0].rank) || 1
      },
      squads,
      recentActivity
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error: any) {
    console.error('❌ Profile GET Error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}