import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const discussions = await sql`
      SELECT * FROM lesson_discussions 
      WHERE lesson_id = ${lessonId} AND parent_id IS NULL
      ORDER BY created_at DESC
    `;

    // Fetch replies for each discussion
    for (const d of discussions) {
      const replies = await sql`
        SELECT * FROM lesson_discussions 
        WHERE parent_id = ${d.id}
        ORDER BY created_at ASC
      `;
      d.replies = replies;
    }

    return NextResponse.json({ discussions });
  } catch (error: any) {
    console.error('❌ Discussions GET Error:', error);
    return NextResponse.json({ discussions: [] });
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

    const { id: lessonId } = await params;
    const body = await request.json();
    const { content, parent_id } = body;

    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      INSERT INTO lesson_discussions (lesson_id, user_id, username, content, parent_id)
      VALUES (${lessonId}, ${user.id}, ${user.username || 'User'}, ${content}, ${parent_id || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, discussion: result[0] });
  } catch (error: any) {
    console.error('❌ Discussion POST Error:', error);
    return NextResponse.json({ error: 'Failed to post' }, { status: 500 });
  }
}