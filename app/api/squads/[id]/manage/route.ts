import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// DELETE: Leader deletes the entire squad
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // 🔒 SECURITY: Verify user is the leader
    const leaderCheck = await sql`
      SELECT 1 FROM squad_members 
      WHERE squad_id = ${id} AND user_id = ${userId} AND role = 'leader' AND status = 'approved'
    `;

    if (leaderCheck.length === 0) {
      return NextResponse.json({ error: 'Only the squad leader can delete the squad' }, { status: 403 });
    }

    // Delete the squad (CASCADE will delete all members and messages)
    await sql`DELETE FROM squads WHERE id = ${id}`;

    console.log(`✅ Squad ${id} deleted by leader ${userId}`);
    return NextResponse.json({ success: true, message: 'Squad deleted successfully' });
  } catch (error: any) {
    console.error('DELETE Squad Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Member leaves the squad
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { action } = await request.json();

    if (action !== 'leave') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🔒 SECURITY: Verify user is a member
    const memberCheck = await sql`
      SELECT role, user_name FROM squad_members 
      WHERE squad_id = ${id} AND user_id = ${userId} AND status = 'approved'
    `;

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'You are not a member of this squad' }, { status: 403 });
    }

    // 🔒 SECURITY: Prevent leader from leaving (they must delete or transfer leadership)
    if (memberCheck[0].role === 'leader') {
      return NextResponse.json({ 
        error: 'As the leader, you must delete the squad or transfer leadership before leaving' 
      }, { status: 403 });
    }

    // Send a system message announcing the departure
    await sql`
      INSERT INTO squad_messages (squad_id, sender_id, sender_name, content, status, is_system_message)
      VALUES (
        ${id}, 
        ${userId}, 
        'System', 
        ${`👋 ${memberCheck[0].user_name} has left the squad`}, 
        'sent', 
        true
      )
    `;

    // Remove the member
    await sql`DELETE FROM squad_members WHERE squad_id = ${id} AND user_id = ${userId}`;

    console.log(`✅ User ${userId} left squad ${id}`);
    return NextResponse.json({ success: true, message: 'You have left the squad' });
  } catch (error: any) {
    console.error('Leave Squad Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}