import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: courseId } = await params;
    const body = await request.json();
    const { title, description, content, video_url, order_index, duration_minutes } = body;

    if (!title) {
      return NextResponse.json({ error: 'Lesson title is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      INSERT INTO lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
      VALUES (${courseId}, ${title}, ${description || ''}, ${content || ''}, ${video_url || null}, ${order_index || 0}, ${duration_minutes || 0})
      RETURNING id
    `;

    // Update course lesson count
    await sql`
      UPDATE courses SET 
        total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = ${courseId}),
        updated_at = NOW()
      WHERE id = ${courseId}
    `;

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error: any) {
    console.error('❌ Lesson POST Error:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: lessonId } = await params;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM lessons WHERE id = ${lessonId}`;

    // Update course lesson count
    if (courseId) {
      await sql`
        UPDATE courses SET 
          total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = ${courseId}),
          updated_at = NOW()
        WHERE id = ${courseId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Lesson DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}