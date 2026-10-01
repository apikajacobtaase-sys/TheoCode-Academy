import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: courseId, moduleId } = await params;
    const updates = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = ['title', 'description', 'content', 'content_type', 'media_url', 'media_type', 'video_duration', 'order_index'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${values.length + 1}`);
        values.push(updates[field]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(moduleId);
    values.push(courseId);

    const query = `
      UPDATE course_modules
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND course_id = $${values.length}
      RETURNING *
    `;

    // 🎯 Use sql.query() instead of sql()
    const result = await sql.query(query, values);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({ module: result[0] });
  } catch (error: any) {
    console.error('❌ Module PUT Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: courseId, moduleId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      DELETE FROM course_modules
      WHERE id = ${moduleId} AND course_id = ${courseId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Module DELETE Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}