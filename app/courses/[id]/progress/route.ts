import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Check if user is enrolled
    const enrollment = await sql`
      SELECT completed FROM course_enrollments 
      WHERE course_id = ${courseId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (enrollment.length === 0) {
      return NextResponse.json({ isEnrolled: false, progress: 0, completedLessons: 0, totalLessons: 0 });
    }

    // Get total lessons in course
    const totalResult = await sql`
      SELECT COUNT(*) as count
      FROM course_modules cm
      JOIN course_items ci ON cm.id = ci.module_id
      WHERE cm.course_id = ${courseId}
    `;

    // Get completed lessons
    const completedResult = await sql`
      SELECT COUNT(*) as count
      FROM lesson_progress lp
      JOIN course_items ci ON lp.lesson_id = ci.id
      JOIN course_modules cm ON ci.module_id = cm.id
      WHERE cm.course_id = ${courseId} 
        AND lp.user_id = ${userId} 
        AND lp.completed = true
    `;

    const totalLessons = parseInt(totalResult[0].count);
    const completedLessons = parseInt(completedResult[0].count);
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({
      isEnrolled: true,
      progress,
      completedLessons,
      totalLessons,
      courseCompleted: enrollment[0].completed
    });

  } catch (error: any) {
    console.error('❌ Course Progress GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}