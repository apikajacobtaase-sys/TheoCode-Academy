import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, is_private } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Squad name is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 🎯 FIXED: Added 'created_by' to satisfy the NOT NULL constraint
    const newSquad = await sql`
      INSERT INTO squads (name, description, is_private, creator_id, created_by, invite_code)
      VALUES (${name.trim()}, ${description || ''}, ${is_private || false}, ${userId}, ${userId}, ${inviteCode})
      RETURNING id, name, description, is_private, creator_id, created_by, invite_code, created_at
    `;

    const squad = newSquad[0];

    let userName = 'Unknown';
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      userName = clerkUser.firstName || clerkUser.username || 'Unknown';
    } catch (error) {
      console.error('Failed to fetch user name:', error);
    }

    await sql`
      INSERT INTO squad_members (squad_id, user_id, user_name, role, status)
      VALUES (${squad.id}, ${userId}, ${userName}, 'owner', 'approved')
    `;

    return NextResponse.json({ success: true, squad });
  } catch (error: any) {
    console.error('❌ Squad Creation Error:', error.message);
    return NextResponse.json({ error: 'Failed to create squad' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const squads = await sql`
      SELECT s.*, sm.role as user_role, sm.status as member_status
      FROM squads s
      JOIN squad_members sm ON s.id = sm.squad_id
      WHERE sm.user_id = ${userId}
      ORDER BY s.created_at DESC
    `;

    return NextResponse.json({ squads });
  } catch (error: any) {
    console.error('❌ Squads GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch squads' }, { status: 500 });
  }
}