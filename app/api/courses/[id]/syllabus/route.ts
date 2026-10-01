import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL!);

    // 1. Fetch all modules for this course
    const modules = await sql`
      SELECT id, title, description, order_index
      FROM course_modules
      WHERE course_id = ${id}
      ORDER BY order_index ASC
    `;

    // 2. Fetch lessons (items) for each module
    for (const mod of modules) {
      const modItems = await sql`
        SELECT id, title, description, item_type, content_text, content_url, video_duration, order_index
        FROM course_items
        WHERE module_id = ${mod.id}
        ORDER BY order_index ASC
      `;
      (mod as any).items = modItems;
    }

    return NextResponse.json({ modules });
  } catch (error: any) {
    console.error('❌ Syllabus API Error:', error.message);
    return NextResponse.json({ error: error.message, modules: [] }, { status: 500 });
  }
}