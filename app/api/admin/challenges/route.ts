import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const challenges = await sql`
      SELECT 
        id,
        title,
        difficulty,
        category,
        language,
        points,
        JSONB_ARRAY_LENGTH(COALESCE(sample_test_cases, '[]'::jsonb)) as sample_count,
        JSONB_ARRAY_LENGTH(COALESCE(hidden_test_cases, '[]'::jsonb)) as hidden_count,
        created_at
      FROM challenges
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ challenges });
  } catch (error: any) {
    console.error('❌ Admin Challenges API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}