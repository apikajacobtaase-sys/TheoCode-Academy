import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// 🎯 GET: Fetch messages for the squad
export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId?: string; id?: string }> }
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

    const memberCheck = await sql`
      SELECT 1 FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Not a member of this squad' }, { status: 403 });
    }

    const messages = await sql`
      SELECT id, sender_id, sender_name, content, media_url, media_type, media_name, status, created_at, reply_to_id
      FROM squad_messages 
      WHERE squad_id = ${squadId} 
      ORDER BY created_at ASC 
      LIMIT 100
    `;

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('❌ MESSAGES API GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🎯 POST: Send a new message to the squad
export async function POST(
  request: Request,
  { params }: { params: Promise<{ squadId?: string; id?: string }> }
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

    const { content, message_type, file_data, file_name, file_size, file_mime, reply_to_id } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    // 1. Verify membership and get user's name
    const memberCheck = await sql`
      SELECT user_name FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Not a member of this squad' }, { status: 403 });
    }

    const userName = memberCheck[0].user_name || 'Unknown';

    // 2. Insert the new message into the database
    const newMessage = await sql`
      INSERT INTO squad_messages (
        squad_id, sender_id, sender_name, content, message_type, 
        media_url, media_type, media_name, reply_to_id, status
      )
      VALUES (
        ${squadId}, ${userId}, ${userName}, ${content || ''}, ${message_type || 'text'},
        ${file_data || null}, ${file_mime || null}, ${file_name || null}, ${reply_to_id || null}, 'sent'
      )
      RETURNING id, sender_id, sender_name, content, media_url, media_type, media_name, status, created_at, reply_to_id
    `;

    return NextResponse.json({ success: true, message: newMessage[0] });
  } catch (error: any) {
    console.error('❌ MESSAGES API POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}