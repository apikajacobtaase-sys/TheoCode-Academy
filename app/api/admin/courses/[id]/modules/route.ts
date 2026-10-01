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

    const modules = await sql`
      SELECT id, title, description, content, content_type, media_url, media_type, video_duration, order_index, created_at
      FROM course_modules
      WHERE course_id = ${courseId}
      ORDER BY order_index ASC
    `;

    return NextResponse.json({ modules });
  } catch (error: any) {
    console.error('❌ Modules GET Error:', error.message);
    return NextResponse.json({ error: error.message, modules: [] }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: courseId } = await params;
    const { title, description, content, content_type, media_url, video_duration, order_index } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    let nextOrder = order_index;
    if (nextOrder === undefined || nextOrder === null) {
      const maxOrder = await sql`
        SELECT COALESCE(MAX(order_index), 0) as max_order
        FROM course_modules
        WHERE course_id = ${courseId}
      `;
      nextOrder = parseInt(maxOrder[0].max_order) + 1;
    }

    const newModule = await sql`
      INSERT INTO course_modules (course_id, title, description, content, content_type, media_url, media_type, video_duration, order_index)
      VALUES (${courseId}, ${title}, ${description || null}, ${content || null}, ${content_type || 'text'}, ${media_url || null}, null, ${video_duration || null}, ${nextOrder})
      RETURNING *
    `;

    console.log(`✅ Created module: ${title} in course ${courseId}`);

    return NextResponse.json({ module: newModule[0] }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Modules POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}