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
      console.error('❌ No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const body = await request.json();
    const { code, language } = body;

    console.log('📝 Submission received:', { userId: user.id, challengeId, language });

    const sql = neon(process.env.DATABASE_URL!);

    // Get challenge details
    const [challenge] = await sql`
      SELECT id, title, points FROM challenges WHERE id = ${challengeId}
    `;

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // For now, auto-accept (replace with your actual code tester)
    const isAccepted = true;
    const earnedPoints = isAccepted ? (challenge.points || 10) : 0;
    const status = isAccepted ? 'accepted' : 'rejected';

    // Save to database
    const [submission] = await sql`
      INSERT INTO challenge_submissions (
        user_id, 
        challenge_id, 
        code, 
        language, 
        status, 
        earned_points
      )
      VALUES (${user.id}, ${challengeId}, ${code}, ${language}, ${status}, ${earnedPoints})
      RETURNING *
    `;

    console.log('✅ Submission saved:', submission.id);

    return NextResponse.json({ 
      success: true, 
      status, 
      earnedPoints,
      submission 
    });

  } catch (error: any) {
    console.error('❌ Submission Error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit', 
      details: error.message 
    }, { status: 500 });
  }
}