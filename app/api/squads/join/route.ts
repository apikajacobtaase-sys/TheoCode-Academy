import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: squadId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Check if squad exists and is public
    const squadCheck = await sql`
      SELECT is_private FROM squads WHERE id = ${squadId}
    `;
    
    if (squadCheck.length === 0) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // 2. Check if user is already a member or has a pending request
    const memberCheck = await sql`
      SELECT status FROM squad_members WHERE squad_id = ${squadId} AND user_id = ${userId}
    `;

    if (memberCheck.length > 0) {
      const status = memberCheck[0].status;
      if (status === 'approved') {
        return NextResponse.json({ error: 'You are already in this squad' }, { status: 400 });
      }
      if (status === 'pending') {
        return NextResponse.json({ error: 'Your request to join is already pending' }, { status: 400 });
      }
    }

    // 3. Add user as pending member
    await sql`
      INSERT INTO squad_members (squad_id, user_id, role, status, joined_at)
      VALUES (${squadId}, ${userId}, 'member', 'pending', NOW())
    `;

    return NextResponse.json({ success: true, message: 'Join request sent!' });
  } catch (error: any) {
    console.error('Join squad error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}