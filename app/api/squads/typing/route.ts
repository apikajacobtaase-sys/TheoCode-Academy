import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// GET: Fetch who is currently typing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id?: string; squadId?: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const squadId = resolvedParams.squadId || resolvedParams.id;

    if (!squadId) {
      return NextResponse.json({ error: 'Missing squad ID' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Cleanup: Delete typing entries older than 3 seconds
    await sql`
      DELETE FROM squad_typing 
      WHERE squad_id = ${squadId} AND typing_at < NOW() - INTERVAL '3 seconds'
    `;

    // 🎯 Fetch active typers (excluding the current user)
    const typers = await sql`
      SELECT user_id, user_name, typing_at
      FROM squad_typing
      WHERE squad_id = ${squadId} AND user_id != ${userId}
      ORDER BY typing_at DESC
    `;

    return NextResponse.json({ typers });
  } catch (error: any) {
    console.error('❌ Typing GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Mark current user as typing (upsert)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id?: string; squadId?: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const squadId = resolvedParams.squadId || resolvedParams.id;

    if (!squadId) {
      return NextResponse.json({ error: 'Missing squad ID' }, { status: 400 });
    }

    const body = await request.json();
    const userName = body.user_name || 'User';

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Upsert: Update timestamp if already typing, or insert new entry
    await sql`
      INSERT INTO squad_typing (squad_id, user_id, user_name, typing_at)
      VALUES (${squadId}, ${userId}, ${userName}, NOW())
      ON CONFLICT (squad_id, user_id) 
      DO UPDATE SET typing_at = NOW(), user_name = ${userName}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Typing POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Clear typing status (when message is sent or user stops)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id?: string; squadId?: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const squadId = resolvedParams.squadId || resolvedParams.id;

    if (!squadId) {
      return NextResponse.json({ error: 'Missing squad ID' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      DELETE FROM squad_typing 
      WHERE squad_id = ${squadId} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Typing DELETE Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}