import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: courseId } = await params;
    const { moduleId, item_type, title, description, content } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    // Get next order index for this module
    const maxOrder = await sql`
      SELECT COALESCE(MAX(order_index), -1) as max 
      FROM learning_items 
      WHERE module_id = ${moduleId}
    `;
    const nextOrder = (maxOrder[0]?.max || 0) + 1;

    // Insert the new learning item
    const newItem = await sql`
      INSERT INTO learning_items (module_id, item_type, title, description, content, order_index)
      VALUES (${moduleId}, ${item_type}, ${title}, ${description || ''}, ${JSON.stringify(content)}, ${nextOrder})
      RETURNING id, item_type, title, description, content, order_index
    `;

    return NextResponse.json({ success: true, item: newItem[0] });
  } catch (error: any) {
    console.error('❌ Create Learning Item Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}