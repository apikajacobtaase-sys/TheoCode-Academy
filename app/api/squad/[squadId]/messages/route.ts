import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ squadId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { squadId } = await params;
    const { content, media_url, media_type, media_name, is_system_message, sender_name } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    // For system messages, skip membership check (they're sent by the system)
    if (!is_system_message) {
      const memberCheck = await sql`
        SELECT user_name FROM squad_members 
        WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
      `;
      if (memberCheck.length === 0) {
        return NextResponse.json({ error: 'Not a member of this squad' }, { status: 403 });
      }

      if ((!content || content.trim().length === 0) && !media_url) {
        return NextResponse.json({ error: 'Message must have text or media' }, { status: 400 });
      }
      if (content && content.length > 2000) {
        return NextResponse.json({ error: 'Message too long' }, { status: 400 });
      }

      const message = await sql`
        INSERT INTO squad_messages (squad_id, sender_id, sender_name, content, media_url, media_type, media_name, status, is_system_message)
        VALUES (${squadId}, ${userId}, ${memberCheck[0].user_name || 'Unknown'}, ${content?.trim() || null}, ${media_url || null}, ${media_type || null}, ${media_name || null}, 'sent', false)
        RETURNING id, sender_id, sender_name, content, media_url, media_type, media_name, status, is_system_message, created_at
      `;
      return NextResponse.json({ success: true, message: message[0] });
    } else {
      // System message (e.g., welcome message)
      const message = await sql`
        INSERT INTO squad_messages (squad_id, sender_id, sender_name, content, status, is_system_message)
        VALUES (${squadId}, ${userId}, ${sender_name || 'System'}, ${content}, 'sent', true)
        RETURNING id, sender_id, sender_name, content, media_url, media_type, media_name, status, is_system_message, created_at
      `;
      return NextResponse.json({ success: true, message: message[0] });
    }
  } catch (error: any) {
    console.error('Chat POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ squadId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { squadId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const memberCheck = await sql`
      SELECT 1, joined_at FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
        // 🟢 Mark messages as read by this user
    await sql`
      UPDATE squad_messages 
      SET read_by = array_append(read_by, ${userId})
      WHERE squad_id = ${squadId} 
        AND sender_id != ${userId} 
        AND NOT (${userId} = ANY(read_by))
    `;
        // Update last active time
    await sql`
      UPDATE squad_members 
      SET last_active = NOW() 
      WHERE squad_id = ${squadId} AND user_id = ${userId}
    `;
    // Load 500 messages so new users see plenty of history
    const messages = await sql`
      SELECT id, sender_id, sender_name, content, media_url, media_type, media_name, status, is_system_message, created_at 
      FROM squad_messages 
      WHERE squad_id = ${squadId} 
      ORDER BY created_at ASC 
      LIMIT 500
    `;

    return NextResponse.json({ 
      messages,
      userJoinedAt: memberCheck[0]?.joined_at
    });
  } catch (error: any) {
    console.error('Chat GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}