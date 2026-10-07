import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const sql = neon(process.env.DATABASE_URL!);

    const challenge = await sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.difficulty,
        c.points,
        c.language,
        c.starter_code,
        COALESCE(cp.status, 'not_started') as user_status
      FROM challenges c
      LEFT JOIN challenge_progress cp ON c.id = cp.challenge_id AND cp.user_id = ${userId}
      WHERE c.id = ${id} AND c.is_active = true
    `;

    if (challenge.length === 0) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      challenge: challenge[0]
    });
  } catch (error: any) {
    console.error('❌ Challenge GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}