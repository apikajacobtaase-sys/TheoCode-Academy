import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// 🎯 Simple UUID validation to prevent database crashes
const isValidUUID = (id: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    // 🎯 Reject invalid IDs immediately with a 400 error instead of crashing the DB
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid challenge ID format. Must be a UUID.' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const challengeResult = await sql`
      SELECT 
        id, title, description, difficulty, language, starter_code, 
        solution_code, test_cases, prompt, creator_id, expected_output, 
        hints, category, points, created_at
      FROM challenges
      WHERE id = ${id}
      LIMIT 1
    `;

    if (challengeResult.length === 0) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const challenge = challengeResult[0];

    let userSubmission = null;
    if (userId) {
      const submissionResult = await sql`
        SELECT id, status, submitted_at, code
        FROM challenge_submissions
        WHERE challenge_id = ${id} AND user_id = ${userId}
        ORDER BY submitted_at DESC
        LIMIT 1
      `;
      if (submissionResult.length > 0) {
        userSubmission = submissionResult[0];
      }
    }

    return NextResponse.json({ challenge, userSubmission });

  } catch (error: any) {
    console.error('❌ Challenge API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}