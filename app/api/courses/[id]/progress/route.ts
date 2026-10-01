import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: courseId } = await params;

    console.log('🔍 Progress API called:', { userId, courseId });

    if (!userId) {
      console.warn('⚠️ No userId found - user not logged in');
      return NextResponse.json({ isEnrolled: false, progress: 0 });
    }

    if (!courseId) {
      console.warn('⚠️ No courseId provided');
      return NextResponse.json({ isEnrolled: false, progress: 0 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if user is enrolled
    const enrollment = await sql`
      SELECT id, completed, enrolled_at
      FROM course_enrollments
      WHERE user_id = ${userId} AND course_id = ${courseId}
      LIMIT 1
    `;

    console.log('📊 Enrollment check:', {
      found: enrollment.length > 0,
      enrollment: enrollment[0] || null
    });

    if (enrollment.length === 0) {
      return NextResponse.json({
        isEnrolled: false,
        progress: 0,
        completedLessons: 0,
        totalLessons: 0
      });
    }

    // Count total lessons in the course
    const totalLessonsResult = await sql`
      SELECT COUNT(*) as count
      FROM course_items i
      JOIN course_modules m ON i.module_id = m.id
      WHERE m.course_id = ${courseId}
    `;

    const totalLessons = parseInt(totalLessonsResult[0].count) || 0;

    // Count completed lessons
    const completedLessonsResult = await sql`
      SELECT COUNT(*) as count
      FROM lesson_progress lp
      JOIN course_items i ON lp.lesson_id = i.id
      JOIN course_modules m ON i.module_id = m.id
      WHERE m.course_id = ${courseId}
        AND lp.user_id = ${userId}
        AND lp.completed = true
    `;

    const completedLessons = parseInt(completedLessonsResult[0].count) || 0;

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    console.log('✅ Progress calculated:', {
      totalLessons,
      completedLessons,
      progress
    });

    return NextResponse.json({
      isEnrolled: true,
      progress,
      completedLessons,
      totalLessons,
      enrollmentCompleted: enrollment[0].completed
    });

  } catch (error: any) {
    console.error('❌ Progress API Error:', error.message);
    return NextResponse.json({
      isEnrolled: false,
      progress: 0,
      error: error.message
    }, { status: 500 });
  }
}