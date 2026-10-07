import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15: params is a Promise, we MUST await it
    const { squadId } = await params;

    console.log('✅ API HIT: Fetching messages for squad:', squadId, 'user:', userId);

    const sql = neon(process.env.DATABASE_URL!);

    // Check if user is an approved member
    const memberCheck = await sql`
      SELECT 1 FROM squad_members 
      WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Fetch messages
    const messages = await sql`
      SELECT id, sender_id, sender_name, content, media_url, media_type, media_name, status, created_at 
      FROM squad_messages 
      WHERE squad_id = ${squadId} 
      ORDER BY created_at ASC 
      LIMIT 100
    `;

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('❌ Squad Messages GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}