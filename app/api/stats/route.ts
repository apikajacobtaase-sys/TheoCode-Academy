import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Safely query lesson_progress (user_id is TEXT here)
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE completed = true)::int as completed_lessons,
        COUNT(*)::int as total_submissions,
        COALESCE(AVG(ai_score), 0)::numeric(5,2) as average_score
      FROM lesson_progress
      WHERE user_id = ${userId}
    `;

    const avgScore = Number(stats[0]?.average_score || 0);
    let rank = 'Cadet';
    if (avgScore >= 90) rank = 'Architect';
    else if (avgScore >= 75) rank = 'Tech Lead';
    else if (avgScore >= 50) rank = 'Developer';

    return NextResponse.json({
      rank,
      averageScore: Math.round(avgScore),
      totalSubmissions: stats[0]?.total_submissions || 0,
      completedLessons: stats[0]?.completed_lessons || 0
    });
  } catch (error: any) {
    console.error('Stats Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}