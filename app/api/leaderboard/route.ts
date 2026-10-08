import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Get Top 50 Users by Total Points
    const topUsers = await sql`
      SELECT 
        up.user_id,
        up.username,
        up.display_name,
        up.avatar_url,
        COALESCE(SUM(cs.earned_points), 0) as total_points,
        COUNT(CASE WHEN cs.status = 'accepted' THEN 1 END) as challenges_solved
      FROM user_profiles up
      LEFT JOIN challenge_submissions cs ON up.user_id = cs.user_id AND cs.status = 'accepted'
      GROUP BY up.user_id, up.username, up.display_name, up.avatar_url
      ORDER BY total_points DESC, challenges_solved DESC
      LIMIT 50
    `;

    // 🎯 Find current user's rank (if logged in)
    let currentUserRank = null;
    if (user) {
      const [rankData] = await sql`
        WITH RankedUsers AS (
          SELECT 
            up.user_id,
            COALESCE(SUM(cs.earned_points), 0) as total_points,
            RANK() OVER (ORDER BY COALESCE(SUM(cs.earned_points), 0) DESC) as rank
          FROM user_profiles up
          LEFT JOIN challenge_submissions cs ON up.user_id = cs.user_id AND cs.status = 'accepted'
          GROUP BY up.user_id
        )
        SELECT rank, total_points FROM RankedUsers WHERE user_id = ${user.id}
      `;
      
      if (rankData) {
        currentUserRank = {
          rank: rankData.rank,
          total_points: rankData.total_points
        };
      }
    }

    return NextResponse.json({ 
      topUsers, 
      currentUserRank 
    });
  } catch (error: any) {
    console.error('❌ Leaderboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}