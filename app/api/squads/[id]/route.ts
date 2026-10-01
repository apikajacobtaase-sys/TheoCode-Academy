import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const squadResult = await sql`
      SELECT s.*, sm.role, sm.joined_at
      FROM squads s
      JOIN squad_members sm ON s.id = sm.squad_id
      WHERE s.id = ${id} AND sm.user_id = ${userId} AND sm.status = 'approved'
    `;

    if (squadResult.length === 0) {
      return NextResponse.json({ error: 'Squad not found or access denied' }, { status: 404 });
    }

    const squad = squadResult[0];

    const members = await sql`
      SELECT sm.user_id, sm.user_name, sm.role, sm.joined_at, COALESCE(AVG(lp.ai_score), 0)::int as average_score
      FROM squad_members sm
      LEFT JOIN lesson_progress lp ON sm.user_id = lp.user_id
      WHERE sm.squad_id = ${id} AND sm.status = 'approved'
      GROUP BY sm.user_id, sm.user_name, sm.role, sm.joined_at
      ORDER BY average_score DESC
    `;

    let pending_requests: any[] = [];
    if (squad.role === 'leader') {
      pending_requests = await sql`
        SELECT user_id, user_name, joined_at 
        FROM squad_members 
        WHERE squad_id = ${id} AND status = 'pending'
        ORDER BY joined_at DESC
      `;
    }

    return NextResponse.json({ squad: { ...squad, members, pending_requests } });
  } catch (error: any) {
    console.error('GET Squad Details Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { name, image_url } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    const leaderCheck = await sql`
      SELECT 1 FROM squad_members WHERE squad_id = ${id} AND user_id = ${userId} AND role = 'leader'
    `;

    if (leaderCheck.length === 0) {
      return NextResponse.json({ error: 'Only the leader can edit the squad' }, { status: 403 });
    }

    const updated = await sql`
      UPDATE squads 
      SET name = COALESCE(${name}, name), 
          image_url = COALESCE(${image_url}, image_url)
      WHERE id = ${id}
      RETURNING id, name, image_url, invite_code
    `;

    return NextResponse.json({ success: true, squad: updated[0] });
  } catch (error: any) {
    console.error('PUT Squad Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}