import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch all challenges
    const challenges = await sql`
      SELECT id, title, description, difficulty, points, language, category, created_at
      FROM challenges
      ORDER BY created_at DESC
    `;

    // If signed in, fetch user progress
    let progressMap: Record<string, string> = {};
    if (user) {
      const progress = await sql`
        SELECT challenge_id, status
        FROM challenge_progress
        WHERE user_id = ${user.id}
      `;
      progress.forEach((p: any) => {
        progressMap[p.challenge_id] = p.status;
      });
    }

    const enriched = challenges.map((c: any) => ({
      ...c,
      user_status: progressMap[c.id] || null,
    }));

    return NextResponse.json({ success: true, challenges: enriched });
  } catch (error: any) {
    console.error('❌ List Challenges Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges', details: error.message },
      { status: 500 }
    );
  }
}