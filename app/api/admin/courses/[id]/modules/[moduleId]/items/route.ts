import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { moduleId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const items = await sql`
      SELECT id, module_id, title, description, item_type, content_text, content_url, video_duration, order_index, created_at
      FROM course_items
      WHERE module_id = ${moduleId}
      ORDER BY order_index ASC
    `;

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('❌ Items GET Error:', error.message);
    return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  }
}

export async function POST(
  
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
   console.log('🚀 SERVER HIT: POST /items received!', await params);
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { moduleId } = await params;
    const body = await request.json();
    const { title, description, item_type, content_text, content_url, video_duration, order_index } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL!);

    let nextOrder = order_index;
    if (nextOrder === undefined || nextOrder === null) {
      const maxOrder = await sql`
        SELECT COALESCE(MAX(order_index), 0) as max_order 
        FROM course_items 
        WHERE module_id = ${moduleId}
      `;
      nextOrder = parseInt(maxOrder[0].max_order) + 1;
    }

    const newItem = await sql`
      INSERT INTO course_items (module_id, title, description, item_type, content_text, content_url, video_duration, order_index)
      VALUES (${moduleId}, ${title}, ${description || null}, ${item_type || 'reading'}, ${content_text || null}, ${content_url || null}, ${video_duration || null}, ${nextOrder})
      RETURNING *
    `;

    console.log(`✅ Created lesson: ${title} in module ${moduleId}`);
    return NextResponse.json({ item: newItem[0] }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Items POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}