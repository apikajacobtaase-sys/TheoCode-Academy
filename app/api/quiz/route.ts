import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const sql = neon(process.env.DATABASE_URL!);

    if (courseId && userId) {
      // Get total lessons in course
      const totalResult = await sql`
        SELECT COUNT(*)::int as total FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = ${courseId}
      `;
      const totalLessons = totalResult[0]?.total || 0;

      // Get completed lessons
      const completedResult = await sql`
        SELECT COUNT(DISTINCT lp.lesson_id)::int as completed FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = ${courseId} AND lp.user_id = ${userId} AND lp.completed = true
      `;
      const completedLessons = completedResult[0]?.completed || 0;

      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return NextResponse.json({ totalLessons, completedLessons, percentage });
    }

    return NextResponse.json({ error: 'userId and courseId required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, lessonId, completed, aiScore } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, ai_score)
      VALUES (${userId}, ${lessonId}, ${completed}, NOW(), ${aiScore || null})
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET 
        completed = ${completed},
        completed_at = NOW(),
        ai_score = COALESCE(${aiScore}, lesson_progress.ai_score)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}