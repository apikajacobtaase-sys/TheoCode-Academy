import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: 'Invite code required' }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL!);

    const squad = await sql`
      SELECT id, name FROM squads WHERE invite_code = ${code.toUpperCase()}
    `;

    if (squad.length === 0) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    const existing = await sql`
      SELECT status FROM squad_members WHERE squad_id = ${squad[0].id} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ 
        error: existing[0].status === 'approved' ? 'Already a member' : 'Request already pending' 
      }, { status: 400 });
    }

        // Get user's name from Clerk (fallback to 'New Member')
    let userName = 'New Member';
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      userName = clerkUser.firstName || clerkUser.username || 'New Member';
    } catch (error) {
      console.error('Failed to fetch user name from Clerk:', error);
    }

    await sql`
      INSERT INTO squad_members (squad_id, user_id, user_name, role, status)
      VALUES (${squad[0].id}, ${userId}, ${userName}, 'member', 'pending')
    `;
    // 🎉 Notify the leader with a join request message (visible in chat)
    await sql`
      INSERT INTO squad_messages (squad_id, sender_id, sender_name, content, status, is_system_message)
      VALUES (
        ${squad[0].id}, 
        ${userId}, 
        ${userName}, 
        ${`👋 ${userName} is requesting to join the squad!`}, 
        'sent', 
        true
      )
    `;

    return NextResponse.json({ success: true, message: 'Request sent' });
  } catch (error: any) {
    console.error('Join Squad Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}