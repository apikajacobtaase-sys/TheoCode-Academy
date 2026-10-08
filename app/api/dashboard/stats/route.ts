import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 1. Get Challenges Solved & Total Points
    const [challengeStats] = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as challenges_solved,
        COALESCE(SUM(earned_points), 0) as total_points
      FROM challenge_submissions
      WHERE user_id = ${user.id}
    `;

    // 🎯 2. Get Courses Completed (progress = 100%)
    const [courseStats] = await sql`
      SELECT COUNT(*) as courses_completed
      FROM course_enrollments
      WHERE user_id = ${user.id} AND progress_percentage = 100
    `;

    // 🎯 3. Calculate Dynamic Rank based on Total Points
    const points = parseInt(challengeStats.total_points) || 0;
    let rank = '🌱 Novice';
    let nextRank = '🛡️ Engineer';
    let pointsToNext = 50;

    if (points >= 200) {
      rank = '👑 Grandmaster';
      nextRank = 'Max Level';
      pointsToNext = 0;
    } else if (points >= 100) {
      rank = '🐉 Expert';
      nextRank = '👑 Grandmaster';
      pointsToNext = 200 - points;
    } else if (points >= 50) {
      rank = '🛡️ Engineer';
      nextRank = '🐉 Expert';
      pointsToNext = 100 - points;
    } else {
      pointsToNext = 50 - points;
    }

    const progressToNext = pointsToNext > 0 ? Math.round(((points % 50) / 50) * 100) : 100;

    return NextResponse.json({
      challenges_solved: parseInt(challengeStats.challenges_solved) || 0,
      total_points: points,
      courses_completed: parseInt(courseStats.courses_completed) || 0,
      current_rank: rank,
      next_rank: nextRank,
      points_to_next: pointsToNext,
      progress_to_next: progressToNext
    });

  } catch (error: any) {
    console.error('❌ Dashboard Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}