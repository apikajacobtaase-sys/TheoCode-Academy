import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

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
      console.error('❌ GET Messages: Missing squad ID');
      return NextResponse.json({ error: 'Missing squad ID' }, { status: 400 });
    }

    console.log('🔍 GET Messages for squad:', squadId);

    const sql = neon(process.env.DATABASE_URL!);

    // 1. Verify membership
    const memberCheck = await sql`
      SELECT 1 FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
      LIMIT 1
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Not a member of this squad' }, { status: 403 });
    }

    // 2. Fetch messages (LIGHTWEIGHT: Excludes heavy file_data column)
    const messages = await sql`
      SELECT 
        id, sender_id, sender_name, content, message_type, 
        media_url, media_type, media_name,
        file_name, file_size, file_mime,
        reply_to_id, status, created_at
      FROM squad_messages 
      WHERE squad_id = ${squadId} 
      ORDER BY created_at DESC 
      LIMIT 50
    `;

    // Reverse to show oldest first
    messages.reverse();

    console.log('✅ GET Messages success. Found', messages.length, 'messages.');
    return NextResponse.json({ messages });

  } catch (error: any) {
    console.error('❌ MESSAGES API GET Error:', error.message);
    console.error('❌ Full Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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

    const body = await request.json();
    
    // 🎯 SMOKETEST: Log the EXACT payload the frontend is sending
    console.log('📩 RAW BODY RECEIVED:', JSON.stringify(body, null, 2));

    const { content, message_type, media_url, media_type, media_name, reply_to_id } = body;

    const sql = neon(process.env.DATABASE_URL!);

    const memberCheck = await sql`
      SELECT user_name FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
      LIMIT 1
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Not a member of this squad' }, { status: 403 });
    }

    const userName = memberCheck[0].user_name || 'Unknown';

    const newMessage = await sql`
      INSERT INTO squad_messages (
        squad_id, sender_id, sender_name, content, message_type, 
        media_url, media_type, media_name, reply_to_id, status
      )
      VALUES (
        ${squadId}, ${userId}, ${userName}, ${content || ''}, ${message_type || 'text'},
        ${media_url || null}, ${media_type || null}, ${media_name || null}, ${reply_to_id || null}, 'sent'
      )
      RETURNING id, sender_id, sender_name, content, message_type, media_url, media_type, media_name, reply_to_id, status, created_at
    `;

    return NextResponse.json({ success: true, message: newMessage[0] });

  } catch (error: any) {
    console.error('❌ MESSAGES API POST Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Keep your existing GET function below this...