import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { moduleId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const progress = await sql`
      SELECT completed, score, completed_at
      FROM module_progress
      WHERE user_id = ${userId} AND module_id = ${moduleId}
      LIMIT 1
    `;

    return NextResponse.json({
      completed: progress.length > 0 && progress[0].completed,
      score: progress.length > 0 ? progress[0].score : null,
      completed_at: progress.length > 0 ? progress[0].completed_at : null
    });
  } catch (error: any) {
    console.error('❌ Progress GET Error:', error.message);
    return NextResponse.json({ error: error.message, completed: false }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { moduleId } = await params;
    const { completed, score } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO module_progress (user_id, module_id, completed, score, completed_at)
      VALUES (${userId}, ${moduleId}, ${completed}, ${score || 0}, NOW())
      ON CONFLICT (user_id, module_id)
      DO UPDATE SET
        completed = ${completed},
        score = GREATEST(COALESCE(module_progress.score, 0), ${score || 0}),
        completed_at = CASE WHEN ${completed} THEN NOW() ELSE module_progress.completed_at END
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Progress POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}