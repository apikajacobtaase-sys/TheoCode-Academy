import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: lessonId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const items = await sql`
      SELECT * FROM lesson_items 
      WHERE lesson_id = ${lessonId} 
      ORDER BY order_index
    `;

    // 🎯 For quiz items, fetch their questions
    for (let item of items) {
      if (item.item_type === 'quiz') {
        const questions = await sql`
          SELECT * FROM quiz_questions 
          WHERE item_id = ${item.id} 
          ORDER BY order_index
        `;
        item.questions = questions;
      }
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('❌ Lesson Items GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: lessonId } = await params;
    const body = await request.json();
    const { item_type, title, content, file_url, order_index, metadata } = body;

    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      INSERT INTO lesson_items (lesson_id, item_type, title, content, file_url, order_index, metadata)
      VALUES (${lessonId}, ${item_type}, ${title || ''}, ${content || null}, ${file_url || null}, ${order_index || 0}, ${JSON.stringify(metadata || {})}::jsonb)
      RETURNING id
    `;

    const itemId = result[0].id;

    // 🎯 If it's a quiz, insert the questions
    if (item_type === 'quiz' && metadata?.questions) {
      for (let i = 0; i < metadata.questions.length; i++) {
        const q = metadata.questions[i];
        await sql`
          INSERT INTO quiz_questions (item_id, question_text, options, correct_answer, explanation, order_index)
          VALUES (${itemId}, ${q.question_text}, ${JSON.stringify(q.options)}::jsonb, ${q.correct_answer}, ${q.explanation || null}, ${i})
        `;
      }
    }

    return NextResponse.json({ success: true, id: itemId });
  } catch (error: any) {
    console.error('❌ Lesson Item POST Error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
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

    const { id: itemId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM lesson_items WHERE id = ${itemId}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Lesson Item DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}