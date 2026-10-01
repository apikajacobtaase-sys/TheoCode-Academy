import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId, lessonId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Mark lesson as complete (upsert)
    await sql`
      INSERT INTO lesson_progress (lesson_id, user_id, completed, completed_at)
      VALUES (${lessonId}, ${userId}, true, NOW())
      ON CONFLICT (lesson_id, user_id) 
      DO UPDATE SET completed = true, completed_at = NOW()
    `;

    // Check if ALL lessons in the course are now complete
    const totalLessons = await sql`
      SELECT COUNT(*) as count
      FROM course_items i
      JOIN course_modules m ON i.module_id = m.id
      WHERE m.course_id = ${courseId}
    `;

    const completedLessons = await sql`
      SELECT COUNT(*) as count
      FROM lesson_progress lp
      JOIN course_items i ON lp.lesson_id = i.id
      JOIN course_modules m ON i.module_id = m.id
      WHERE m.course_id = ${courseId} 
        AND lp.user_id = ${userId} 
        AND lp.completed = true
    `;

    const total = parseInt(totalLessons[0].count);
    const completed = parseInt(completedLessons[0].count);
    const courseCompleted = total > 0 && completed === total;

    // If course is complete, mark enrollment as completed
    if (courseCompleted) {
      await sql`
        UPDATE course_enrollments 
        SET completed = true
        WHERE course_id = ${courseId} AND user_id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      completedLessons: completed,
      totalLessons: total,
      courseCompleted
    });

  } catch (error: any) {
    console.error('❌ Lesson Progress API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}