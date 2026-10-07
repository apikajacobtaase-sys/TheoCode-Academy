import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 1. Fetch course details (only if published)
    const [course] = await sql`
      SELECT id, title, description, difficulty, category, language, duration_hours, total_lessons, instructor, image_url
      FROM courses 
      WHERE id = ${id} AND is_published = true
    `;

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 🎯 2. Fetch lessons
    const lessons = await sql`
      SELECT id, title, description, duration_minutes, order_index
      FROM lessons 
      WHERE course_id = ${id} 
      ORDER BY order_index
    `;

    // 🎯 3. Fetch items for each lesson
    for (const lesson of lessons) {
      const items = await sql`
        SELECT id, item_type, title, content, file_url, metadata
        FROM lesson_items 
        WHERE lesson_id = ${lesson.id} 
        ORDER BY order_index
      `;
      
      // 🎯 4. If it's a quiz, fetch its questions
      for (const item of items) {
            // 🎯 If it's a quiz, fetch its questions (WITHOUT correct_answer!)
      if (item.item_type === 'quiz') {
        const questions = await sql`
          SELECT id, question_text, options, explanation, order_index
          FROM quiz_questions 
          WHERE item_id = ${item.id} 
          ORDER BY order_index
        `;
        item.questions = questions;
      }
      }
      lesson.items = items;
    }

    return NextResponse.json({ course, lessons });
  } catch (error: any) {
    console.error('❌ Course GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}