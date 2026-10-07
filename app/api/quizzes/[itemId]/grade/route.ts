import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await request.json();
    const { answers } = body;

    const sql = neon(process.env.DATABASE_URL!);

    const questions = await sql`
      SELECT id, correct_answer, explanation
      FROM quiz_questions 
      WHERE item_id = ${itemId}
    `;

    let score = 0;
    const total = questions.length;
    const results = [];

    for (const q of questions) {
      const userAnswer = answers[q.id] || '';
      const isCorrect = userAnswer === q.correct_answer;
      
      if (isCorrect) score++;

      results.push({
        question_id: q.id,
        is_correct: isCorrect,
        correct_answer: q.correct_answer,
        user_answer: userAnswer,
        explanation: q.explanation
      });
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // 🎯 Save the attempt
    await sql`
      INSERT INTO quiz_attempts (user_id, quiz_item_id, score, total, percentage, answers)
      VALUES (${user.id}, ${itemId}, ${score}, ${total}, ${percentage}, ${JSON.stringify(answers)}::jsonb)
    `;

    return NextResponse.json({ score, total, percentage, results });
  } catch (error: any) {
    console.error('❌ Quiz Grade Error:', error);
    return NextResponse.json({ error: 'Failed to grade quiz' }, { status: 500 });
  }
}