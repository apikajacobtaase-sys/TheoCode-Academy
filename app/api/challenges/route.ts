import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// GET: Fetch all challenges with user's progress
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Fetch all active challenges with user's progress
    const challenges = await sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.difficulty,
        c.points,
        c.language,
        c.is_active,
        COALESCE(cp.status, 'not_started') as user_status,
        cp.solved_at,
        cp.attempts
      FROM challenges c
      LEFT JOIN challenge_progress cp ON c.id = cp.challenge_id AND cp.user_id = ${userId}
      WHERE c.is_active = true
      ORDER BY 
        CASE c.difficulty 
          WHEN 'easy' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'hard' THEN 3 
        END,
        c.points ASC
    `;

    // Calculate user stats
    const solved = challenges.filter((c: any) => c.user_status === 'solved');
    const totalPoints = solved.reduce((sum: number, c: any) => sum + (c.points || 0), 0);

    const stats = {
      totalChallenges: challenges.length,
      solved: solved.length,
      inProgress: challenges.filter((c: any) => c.user_status === 'in_progress').length,
      totalPoints,
    };

    return NextResponse.json({
      success: true,
      challenges,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Challenges API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}