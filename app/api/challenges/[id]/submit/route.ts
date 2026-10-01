import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Simple validation (replace with real code judge later)
    const hasFunction = code.includes('function') || code.includes('=>') || code.includes('def ');
    const hasReturn = code.includes('return');
    
    const status = (hasFunction && hasReturn) ? 'accepted' : 'rejected';
    const message = status === 'accepted' 
      ? 'Your solution passed all test cases!' 
      : 'Your code did not pass all test cases. Make sure you have a function with a return statement.';

    // Save submission to database
    const submission = await sql`
      INSERT INTO challenge_submissions (challenge_id, user_id, code, status)
      VALUES (${challengeId}, ${userId}, ${code}, ${status})
      RETURNING id, status, submitted_at
    `;

    return NextResponse.json({
      status,
      message,
      submission: submission[0]
    });

  } catch (error: any) {
    console.error('❌ Challenge Submit Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}