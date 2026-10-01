import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: courseId, lessonId } = await params;
    
    if (!courseId || !lessonId) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Fetch the lesson from course_items (the new schema)
    const lessonResult = await sql`
      SELECT 
        i.id,
        i.title,
        i.description,
        i.item_type,
        i.content_text,
        i.content_url,
        i.video_duration,
        i.order_index,
        i.module_id,
        m.title as module_title,
        m.course_id
      FROM course_items i
      JOIN course_modules m ON i.module_id = m.id
      WHERE i.id = ${lessonId} AND m.course_id = ${courseId}
      LIMIT 1
    `;

    if (lessonResult.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lesson = lessonResult[0];

    // 🎯 Get ALL lessons in the course for navigation (prev/next)
    const allLessons = await sql`
      SELECT 
        i.id,
        i.title,
        i.item_type,
        i.order_index,
        m.order_index as module_order,
        m.title as module_title,
        COALESCE(lp.completed, false) as completed
      FROM course_items i
      JOIN course_modules m ON i.module_id = m.id
      LEFT JOIN lesson_progress lp ON i.id = lp.lesson_id AND lp.user_id = ${userId}
      WHERE m.course_id = ${courseId}
      ORDER BY m.order_index ASC, i.order_index ASC
    `;

    const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return NextResponse.json({
      lesson,
      allLessons,
      currentIndex,
      prevLesson,
      nextLesson,
      totalLessons: allLessons.length
    });

  } catch (error: any) {
    console.error('❌ Lesson API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}