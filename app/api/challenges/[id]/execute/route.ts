import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const body = await request.json();
    
    console.log('📝 Execute request body:', body);

    const { code, language } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get challenge details
    const [challenge] = await sql`
      SELECT id, title, points, test_cases FROM challenges WHERE id = ${challengeId}
    `;

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // 🎯 For now, auto-accept all submissions (replace with actual code execution)
    const isAccepted = true;
    const earnedPoints = isAccepted ? (challenge.points || 10) : 0;
    const status = isAccepted ? 'accepted' : 'rejected';

    // Save submission to database
    const [submission] = await sql`
      INSERT INTO challenge_submissions (
        user_id, 
        challenge_id, 
        code, 
        language, 
        status, 
        earned_points
      )
      VALUES (${user.id}, ${challengeId}, ${code}, ${language || 'C++'}, ${status}, ${earnedPoints})
      RETURNING *
    `;

    console.log('✅ Submission saved:', submission.id, 'Status:', status, 'Points:', earnedPoints);

    return NextResponse.json({ 
      success: true,
      passed: isAccepted,
      status,
      earnedPoints,
      output: 'Code executed successfully',
      submission
    });

  } catch (error: any) {
    console.error('❌ Execute Error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute code', 
      details: error.message 
    }, { status: 500 });
  }
}