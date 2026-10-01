import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, lessonId, completed, aiScore } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, ai_score)
      VALUES (${userId}, ${lessonId}, ${completed}, ${completed ? 'NOW()' : null}, ${aiScore})
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET 
        completed = ${completed},
        completed_at = ${completed ? 'NOW()' : null},
        ai_score = COALESCE(${aiScore}, lesson_progress.ai_score)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const sql = neon(process.env.DATABASE_URL!);

    if (courseId) {
      // Get progress for a specific course
      const progress = await sql`
        SELECT lp.*, l.title as lesson_title, m.title as module_title
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        WHERE lp.user_id = ${userId} AND m.course_id = ${courseId}
      `;
      return NextResponse.json({ progress });
    }

    // Get overall user stats
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE completed = true)::int as completed_lessons,
        COUNT(*)::int as total_attempted,
        AVG(ai_score)::numeric(5,2) as average_score
      FROM lesson_progress
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({ stats: stats[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}