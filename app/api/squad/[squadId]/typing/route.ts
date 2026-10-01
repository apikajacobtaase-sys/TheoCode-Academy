import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// POST: Update typing status
export async function POST(request: Request, { params }: { params: Promise<{ squadId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { squadId } = await params;
    const { isTyping } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE squad_members 
      SET is_typing = ${isTyping}, 
          typing_since = ${isTyping ? new Date() : null}
      WHERE squad_id = ${squadId} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Typing Status Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Get who is currently typing
export async function GET(request: Request, { params }: { params: Promise<{ squadId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { squadId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Get members who are typing (within last 5 seconds)
    const typingMembers = await sql`
      SELECT user_id, user_name, typing_since
      FROM squad_members
      WHERE squad_id = ${squadId} 
        AND is_typing = true 
        AND typing_since > NOW() - INTERVAL '5 seconds'
        AND user_id != ${userId}
    `;

    return NextResponse.json({ typingMembers });
  } catch (error: any) {
    console.error('Get Typing Status Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}