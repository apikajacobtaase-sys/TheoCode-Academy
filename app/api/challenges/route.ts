import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Fetch REAL challenges from the database
    const dbChallenges = await sql`
      SELECT 
        id, 
        title, 
        difficulty, 
        category, 
        points,
        created_at
      FROM challenges
      ORDER BY created_at DESC
    `;

    // Map to match the frontend's expected shape
    // (Using placeholder stats for now until we build the full analytics engine)
    const challenges = dbChallenges.map((c: any) => ({
      id: c.id, // 🎯 THIS IS NOW THE REAL UUID!
      title: c.title,
      difficulty: c.difficulty || 'Medium',
      category: c.category || 'General',
      solves: Math.floor(Math.random() * 15000) + 500, // Placeholder
      successRate: `${Math.floor(Math.random() * 40) + 50}%`, // Placeholder
      completed: false // Can be updated later by checking challenge_submissions
    }));

    return NextResponse.json({ challenges });
  } catch (error: any) {
    console.error('❌ Challenges List API Error:', error.message);
    return NextResponse.json({ error: error.message, challenges: [] }, { status: 500 });
  }
}