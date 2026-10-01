import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { squadId, memberId, status } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    const leaderCheck = await sql`
      SELECT 1 FROM squad_members WHERE squad_id = ${squadId} AND user_id = ${userId} AND role = 'leader'
    `;

    if (leaderCheck.length === 0) {
      return NextResponse.json({ error: 'Only the leader can approve members' }, { status: 403 });
    }

    await sql`
      UPDATE squad_members SET status = ${status} WHERE squad_id = ${squadId} AND user_id = ${memberId}
    `;

    // 🎉 If approved, send a welcome message to the chat
    if (status === 'approved') {
      const newMember = await sql`
        SELECT user_name FROM squad_members WHERE squad_id = ${squadId} AND user_id = ${memberId}
      `;
      
      if (newMember.length > 0) {
        await sql`
          INSERT INTO squad_messages (squad_id, sender_id, sender_name, content, status, is_system_message)
          VALUES (
            ${squadId}, 
            ${memberId}, 
            'System', 
            ${`🎉 Welcome to the squad, ${newMember[0].user_name}! You now have access to all past conversations.`}, 
            'sent', 
            true
          )
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Member Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}