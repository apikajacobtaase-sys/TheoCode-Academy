import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const challenges = await sql`
      SELECT id, title, difficulty, points, language, is_active, created_at
      FROM challenges
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ challenges });
  } catch (error: any) {
    console.error('❌ Admin Challenges GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}




export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, difficulty, points, language, starter_code, test_cases, category } = body;

    if (!title || !description || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields: title, description, difficulty' }, { status: 400 });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty. Must be easy, medium, or hard.' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Parse test_cases if it's a string
    let parsedTestCases = test_cases;
    if (typeof test_cases === 'string') {
      try {
        parsedTestCases = JSON.parse(test_cases);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON in test_cases' }, { status: 400 });
      }
    }

    // Insert the new challenge
    const [newChallenge] = await sql`
      INSERT INTO challenges (
        title, description, difficulty, points, language, 
        starter_code, test_cases, category, created_by, created_at
      )
      VALUES (
        ${title}, ${description}, ${difficulty}, ${points || 10}, ${language || 'C++'},
        ${starter_code || '// Write your solution here\n'}, 
        ${JSON.stringify(parsedTestCases || [])}::jsonb, 
        ${category || 'general'}, ${user.id}, NOW()
      )
      RETURNING *
    `;

    console.log('✅ Challenge created:', newChallenge.id, 'by', user.id);

    return NextResponse.json({
      success: true,
      message: 'Challenge created successfully!',
      challenge: newChallenge,
    });

  } catch (error: any) {
    console.error('❌ Create Challenge Error:', error);
    return NextResponse.json({ error: 'Failed to create challenge', details: error.message }, { status: 500 });
  }
}