import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Correct Neon syntax for conditional SQL fragments
    const dateCondition = 
      period === 'week' 
        ? sql`AND cs.created_at >= NOW() - INTERVAL '7 days'`
        : period === 'month'
        ? sql`AND cs.created_at >= NOW() - INTERVAL '30 days'`
        : sql``; // All time = no date filter

    // Aggregate points per user from challenge_submissions
    const rows = await sql`
      SELECT
        p.user_id,
        COALESCE(p.display_name, p.username, 'User') AS display_name,
        p.username,
        p.avatar_url,
        COALESCE(SUM(cs.earned_points), 0)::int AS points
      FROM profiles p
      LEFT JOIN challenge_submissions cs
        ON cs.user_id = p.user_id
        AND cs.earned_points > 0
        ${dateCondition}
      GROUP BY p.user_id, p.display_name, p.username, p.avatar_url
      HAVING COALESCE(SUM(cs.earned_points), 0) > 0
      ORDER BY points DESC, p.display_name ASC
      LIMIT 100
    `;

    // Also fetch the current user's points (in case they aren't in the top 100)
    const [currentUserRow] = await sql`
      SELECT
        COALESCE(SUM(cs.earned_points), 0)::int AS points
      FROM challenge_submissions cs
      WHERE cs.user_id = ${user.id}
        AND cs.earned_points > 0
        ${dateCondition}
    `;

    const users = rows.map((row: any, idx: number) => ({
      rank: idx + 1,
      user_id: row.user_id,
      display_name: row.display_name,
      username: row.username || '',
      avatar_url: row.avatar_url || '',
      points: Number(row.points),
    }));

    return NextResponse.json({
      success: true,
      period,
      users,
      current_user_points: currentUserRow ? Number(currentUserRow.points) : 0,
    });
  } catch (error: any) {
    console.error('❌ Leaderboard Error:', error);
    return NextResponse.json(
      { error: 'Failed to load leaderboard', details: error.message },
      { status: 500 }
    );
  }
}