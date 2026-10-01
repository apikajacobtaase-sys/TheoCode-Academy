import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { squadId, content, media_url, media_type, media_name, tempId } = body;

    if (!squadId) {
      return NextResponse.json({ error: 'squadId is required' }, { status: 400 });
    }

    console.log('📥 Received message data:', { content, media_url, media_type, media_name });

    if ((!content || content.trim().length === 0) && !media_url) {
      return NextResponse.json({ error: 'Message must have text or media' }, { status: 400 });
    }

    if (content && content.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const memberCheck = await sql`
      SELECT user_name FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Not a member of this squad' }, { status: 403 });
    }

    const lastMessage = await sql`
      SELECT created_at FROM squad_messages 
      WHERE squad_id = ${squadId} AND sender_id = ${userId} 
      ORDER BY created_at DESC LIMIT 1
    `;

    if (lastMessage.length > 0) {
      const timeDiff = Date.now() - new Date(lastMessage[0].created_at).getTime();
      if (timeDiff < 2000) {
        return NextResponse.json({ error: 'Please slow down!' }, { status: 429 });
      }
    }

    console.log('📤 Inserting message with media:', { media_url, media_type, media_name });

    const message = await sql`
      INSERT INTO squad_messages (squad_id, sender_id, sender_name, content, media_url, media_type, media_name, status)
      VALUES (${squadId}, ${userId}, ${memberCheck[0].user_name}, ${content?.trim() || null}, ${media_url || null}, ${media_type || null}, ${media_name || null}, 'sent')
      RETURNING id, sender_id, sender_name, content, media_url, media_type, media_name, status, created_at
    `;

    console.log('✅ Message inserted successfully:', message[0]);

    return NextResponse.json({ success: true, message: message[0], tempId });
  } catch (error: any) {
    console.error('Chat POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 🎯 FIX: Get squadId from the URL query string instead of params
    const { searchParams } = new URL(request.url);
    const squadId = searchParams.get('squadId');

    if (!squadId) {
      return NextResponse.json({ error: 'squadId is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const memberCheck = await sql`
      SELECT 1 FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await sql`
      SELECT id, sender_id, sender_name, content, media_url, media_type, media_name, status, created_at 
      FROM squad_messages 
      WHERE squad_id = ${squadId} 
      ORDER BY created_at ASC 
      LIMIT 100
    `;

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Chat GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}