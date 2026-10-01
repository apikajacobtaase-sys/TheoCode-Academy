import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const modules = await sql`
      SELECT id, title, description, course_id, order_index
      FROM course_modules
      WHERE course_id = ${courseId}
      ORDER BY order_index ASC
    `;

    // Fetch lessons for each module
    const modulesWithLessons = await Promise.all(
      modules.map(async (module: any) => {
        const lessons = await sql`
          SELECT id, content_type, content_text, content_url, title, order_index
          FROM module_contents
          WHERE module_id = ${module.id}
          ORDER BY order_index ASC
        `;
        return { ...module, lessons };
      })
    );

    return NextResponse.json({ modules: modulesWithLessons });
  } catch (error: any) {
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
    const { title, lessons } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    // Get next order
    const maxOrder = await sql`SELECT COALESCE(MAX(order_index), -1) as max FROM course_modules WHERE course_id = ${courseId}`;
    const nextOrder = (maxOrder[0]?.max || 0) + 1;

    // Create module
    const newModule = await sql`
      INSERT INTO course_modules (course_id, title, order_index)
      VALUES (${courseId}, ${title}, ${nextOrder})
      RETURNING id, title
    `;

    const moduleId = newModule[0].id;

    // Save lessons
    if (lessons && Array.isArray(lessons)) {
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        await sql`
          INSERT INTO module_contents (module_id, content_type, content_text, content_url, title, order_index)
          VALUES (${moduleId}, ${lesson.content_type}, ${lesson.content_text || null}, ${lesson.content_url || null}, ${lesson.title || null}, ${i})
        `;
      }
    }

    return NextResponse.json({ success: true, module: newModule[0] });
  } catch (error: any) {
    console.error('❌ Create Module Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}