import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 HANDLE COURSE EXAM SAVE
    if (body.action === 'save_course_exam') {
      const { courseId, exams } = body;

      if (!courseId || !Array.isArray(exams)) {
        return NextResponse.json({ error: 'Missing courseId or exams array' }, { status: 400 });
      }

      // 1. Delete existing exams for this course
      await sql`DELETE FROM course_exams WHERE course_id = ${courseId}`;

      // 2. Insert new exams
      for (let i = 0; i < exams.length; i++) {
        const exam = exams[i];
        await sql`
          INSERT INTO course_exams (course_id, type, question, correct_answer, starter_code, order_index)
          VALUES (
            ${courseId},
            ${exam.type || 'theory'},
            ${exam.question},
            ${exam.correctAnswer},
            ${exam.starterCode || null},
            ${i}
          )
        `;
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Course exam saved successfully',
        count: exams.length 
      });
    }

    // 🎯 HANDLE STANDARD MODULE QUIZ SAVE (Fallback)
    const moduleId = body.moduleId || body.module_id;
    const questions = body.questions || body.quiz_questions || [];

    if (!moduleId || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing moduleId or questions' }, { status: 400 });
    }

    // 1. Delete existing questions for this module
    await sql`DELETE FROM quiz_questions WHERE module_id = ${moduleId}`;

    // 2. Insert new questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionText = q.question_text || q.question || q.text || '';
      const options = q.options || q.choices || [];
      const correctAnswer = q.correct_answer || q.correct || q.answer || '';
      const orderIndex = q.order_index ?? q.order ?? i;

      if (!questionText) continue;

      await sql`
        INSERT INTO quiz_questions (module_id, question_text, options, correct_answer, order_index)
        VALUES (${moduleId}, ${questionText}, ${JSON.stringify(options)}, ${correctAnswer}, ${orderIndex})
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Module quiz saved successfully',
      count: questions.length 
    });

  } catch (error: any) {
    console.error('❌ Quiz/Exam API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId') || searchParams.get('module_id');
    const courseId = searchParams.get('courseId') || searchParams.get('course_id');

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 FETCH COURSE EXAMS
    if (courseId) {
      const exams = await sql`
        SELECT id, type, question, correct_answer, starter_code, order_index
        FROM course_exams
        WHERE course_id = ${courseId}
        ORDER BY order_index ASC
      `;
      return NextResponse.json({ exams });
    }

    // 🎯 FETCH MODULE QUIZZES
    if (moduleId) {
      const questions = await sql`
        SELECT id, question_text, options, correct_answer, order_index
        FROM quiz_questions
        WHERE module_id = ${moduleId}
        ORDER BY order_index ASC
      `;
      return NextResponse.json({ questions });
    }

    return NextResponse.json({ error: 'Missing moduleId or courseId' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Quiz/Exam GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}