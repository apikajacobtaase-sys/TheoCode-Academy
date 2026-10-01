import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);

    // Get all enrolled courses with progress
    const courses = await sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        ce.enrolled_at,
        ce.completed as course_completed,
        COALESCE(
          (SELECT COUNT(*) 
           FROM course_modules cm 
           JOIN course_items ci ON cm.id = ci.module_id 
           WHERE cm.course_id = c.id), 0
        )::int as total_lessons,
        COALESCE(
          (SELECT COUNT(*) 
           FROM lesson_progress lp
           JOIN course_items ci ON lp.lesson_id = ci.id
           JOIN course_modules cm ON ci.module_id = cm.id
           WHERE cm.course_id = c.id 
             AND lp.user_id = ce.user_id 
             AND lp.completed = true), 0
        )::int as completed_lessons
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.user_id = ${userId}
      ORDER BY ce.enrolled_at DESC
    `;

    // Calculate progress percentage
    const coursesWithProgress = courses.map((course: any) => ({
      ...course,
      progress: course.total_lessons > 0 
        ? Math.round((course.completed_lessons / course.total_lessons) * 100) 
        : 0
    }));

    return NextResponse.json({ courses: coursesWithProgress });

  } catch (error: any) {
    console.error('❌ My Learning API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}