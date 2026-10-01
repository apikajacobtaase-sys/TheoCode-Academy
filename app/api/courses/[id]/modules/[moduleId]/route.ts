import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: courseId, moduleId } = await params;
    
    console.log('🔍 Fetching module:', moduleId, 'for course:', courseId);
    
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch module
    const modules = await sql`
      SELECT id, title, description, course_id, order_index
      FROM course_modules
      WHERE id = ${moduleId} AND course_id = ${courseId}
    `;

    if (modules.length === 0) {
      console.error('❌ Module not found in database');
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const module = modules[0];
    console.log('✅ Module found:', module.title);

    // Fetch contents
    const contents = await sql`
      SELECT id, content_type, content_url, content_text, order_index
      FROM module_contents
      WHERE module_id = ${moduleId}
      ORDER BY order_index ASC
    `;
    console.log('📚 Contents loaded:', contents.length);

    // Fetch quiz questions
    const quiz_questions = await sql`
      SELECT id, question_text, options, correct_answer, order_index
      FROM quiz_questions
      WHERE module_id = ${moduleId}
      ORDER BY order_index ASC
    `;
    console.log('🎯 Quiz questions loaded:', quiz_questions.length);

    return NextResponse.json({
      module: {
        ...module,
        contents,
        quiz_questions
      }
    });
  } catch (error: any) {
    console.error('❌ Module GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}