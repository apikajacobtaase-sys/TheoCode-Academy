import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ progress: 0, completedLessons: [] });
    }

    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Get total lessons
    const [total] = await sql`
      SELECT COUNT(*) as count FROM lessons WHERE course_id = ${courseId}
    `;

    // Get completed lessons
    const completed = await sql`
      SELECT lesson_id FROM lesson_completions 
      WHERE user_id = ${user.id} AND course_id = ${courseId}
    `;

    const totalLessons = parseInt(total.count) || 1;
    const completedCount = completed.length;
    const progress = Math.round((completedCount / totalLessons) * 100);

    // Update enrollment progress
    await sql`
      UPDATE course_enrollments 
      SET progress_percentage = ${progress},
          completed_at = CASE WHEN ${progress} = 100 THEN NOW() ELSE completed_at END
      WHERE user_id = ${user.id} AND course_id = ${courseId}
    `;

    return NextResponse.json({
      progress,
      completedLessons: completed.map(c => c.lesson_id),
      totalLessons,
      completedCount
    });
  } catch (error: any) {
    console.error('❌ Progress Error:', error);
    return NextResponse.json({ progress: 0, completedLessons: [] });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const body = await request.json();
    const { lessonId } = body;

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO lesson_completions (user_id, lesson_id, course_id)
      VALUES (${user.id}, ${lessonId}, ${courseId})
      ON CONFLICT (user_id, lesson_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Mark Complete Error:', error);
    return NextResponse.json({ error: 'Failed to mark complete' }, { status: 500 });
  }
}