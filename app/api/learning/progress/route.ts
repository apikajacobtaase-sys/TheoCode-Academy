import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Learning Progress API called for userId:', userId);

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 FIXED: Only select columns that ACTUALLY EXIST in your courses table
    const enrolledCourses = await sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.difficulty,
        c.duration_hours,
        c.total_modules,
        c.total_lessons,
        c.created_at as course_created_at,
        ce.enrolled_at,
        ce.completed,
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT CASE WHEN lp.completed = true THEN ci.id END) as completed_items
      FROM courses c
      JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN course_modules cm ON c.id = cm.course_id
      LEFT JOIN course_items ci ON cm.id = ci.module_id
      LEFT JOIN lesson_progress lp ON ci.id = lp.lesson_id AND lp.user_id = ${userId}
      WHERE ce.user_id = ${userId}
      GROUP BY c.id, c.title, c.description, c.category, c.difficulty, c.duration_hours, c.total_modules, c.total_lessons, c.created_at, ce.enrolled_at, ce.completed
      ORDER BY ce.enrolled_at DESC
    `;

    console.log('📊 Raw database result count:', enrolledCourses.length);

    const coursesWithProgress = enrolledCourses.map((course: any) => {
      const totalItems = parseInt(course.total_items) || 0;
      const completedItems = parseInt(course.completed_items) || 0;
      
      // 🎯 If the database says it's completed, force progress to 100%
      const isCompleted = course.completed === true || course.completed === 'true';
      const progress = isCompleted ? 100 : (totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        // 🎯 Use a placeholder image since the database doesn't have image_url
        image: '/images/my-learning1.jpg',
        category: course.category,
        difficulty: course.difficulty,
        durationHours: course.duration_hours,
        totalModules: course.total_modules,
        totalLessons: course.total_lessons,
        enrolledAt: course.enrolled_at,
        isCompleted: isCompleted,
        progress,
        totalLessonsCount: totalItems,
        completedLessonsCount: completedItems,
      };
    });

    const activeCourses = coursesWithProgress.filter((c: any) => !c.isCompleted && c.progress < 100);
    const completedCourses = coursesWithProgress.filter((c: any) => c.isCompleted || c.progress === 100);

    const continueCourse = activeCourses.length > 0 ? activeCourses[0] : (completedCourses.length > 0 ? completedCourses[0] : null);

    const stats = {
      inProgress: activeCourses.length,
      completed: completedCourses.length,
      totalEnrolled: coursesWithProgress.length,
    };

    console.log('✅ Final stats:', stats);
    console.log('✅ Completed courses:', completedCourses.length);

    return NextResponse.json({
      success: true,
      stats,
      continueCourse,
      activeCourses,
      completedCourses,
    });
  } catch (error: any) {
    console.error('❌ Learning Progress API Error:', error.message);
    console.error('❌ Full Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}