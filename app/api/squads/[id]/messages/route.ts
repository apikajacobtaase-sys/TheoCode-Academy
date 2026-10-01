import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: squadId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const membership = await sql`
      SELECT 1 FROM squad_members WHERE squad_id = ${squadId} AND user_id = ${userId} LIMIT 1
    `;
    if (membership.length === 0) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const messages = await sql`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.sender_id,
        m.message_type,
        m.file_data,
        m.file_name,
        m.file_size,
        m.file_mime,
        m.reply_to_id,
        m.is_read,
        up.full_name as sender_name,
        up.profile_image_url as sender_image,
        up.is_name_verified,
        reply.content as reply_content,
        reply.message_type as reply_type,
        reply_sender.full_name as reply_sender_name
      FROM squad_messages m
      LEFT JOIN user_profiles up ON m.sender_id = up.user_id
      LEFT JOIN squad_messages reply ON m.reply_to_id = reply.id
      LEFT JOIN user_profiles reply_sender ON reply.sender_id = reply_sender.user_id
      WHERE m.squad_id = ${squadId}
      ORDER BY m.created_at ASC
    `;

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('❌ Squad Messages GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: squadId } = await params;
    const body = await request.json();
    const { content, message_type = 'text', file_data, file_name, file_size, file_mime, reply_to_id } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // Verify membership
    const membership = await sql`
      SELECT 1 FROM squad_members WHERE squad_id = ${squadId} AND user_id = ${userId} LIMIT 1
    `;
    if (membership.length === 0) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Validation
    if (message_type === 'text' && (!content || !content.trim())) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }
    if (message_type !== 'text' && !file_data) {
      return NextResponse.json({ error: 'File data required' }, { status: 400 });
    }

    const newMessage = await sql`
      INSERT INTO squad_messages (
        squad_id, sender_id, content, message_type, 
        file_data, file_name, file_size, file_mime, reply_to_id
      )
      VALUES (
        ${squadId}, ${userId}, ${content || null}, ${message_type},
        ${file_data || null}, ${file_name || null}, ${file_size || null}, 
        ${file_mime || null}, ${reply_to_id || null}
      )
      RETURNING id, content, message_type, file_name, file_size, file_mime, created_at
    `;

    return NextResponse.json({ message: newMessage[0] }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Squad Messages POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Mark messages as read
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: squadId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE squad_messages 
      SET is_read = TRUE, read_at = NOW()
      WHERE squad_id = ${squadId} 
        AND sender_id != ${userId}
        AND is_read = FALSE
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}