import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Get user profile
    const profileResult = await sql`
      SELECT 
        user_id,
        full_name,
        username,
        profile_image_url,
        is_name_verified,
        created_at
      FROM user_profiles
      WHERE user_id = ${userId}
    `;

    if (profileResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = profileResult[0];

    // Get user stats
    const [coursesCompleted, challengesSolved, squads] = await Promise.all([
      sql`
        SELECT COUNT(*) as count
        FROM course_enrollments
        WHERE user_id = ${userId} AND completed = true
      `.catch(() => [{ count: '0' }]),
      
      sql`
        SELECT COUNT(*) as count
        FROM challenge_submissions
        WHERE user_id = ${userId} AND passed = true
      `.catch(() => [{ count: '0' }]),
      
      sql`
        SELECT s.id, s.name
        FROM squads s
        JOIN squad_members sm ON s.id = sm.squad_id
        WHERE sm.user_id = ${userId}
        LIMIT 10
      `.catch(() => [])
    ]);

    return NextResponse.json({
      profile,
      stats: {
        coursesCompleted: parseInt(coursesCompleted[0]?.count || '0'),
        challengesSolved: parseInt(challengesSolved[0]?.count || '0'),
        squads: squads.length
      },
      squadList: squads
    });

  } catch (error: any) {
    console.error('❌ Profile API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}