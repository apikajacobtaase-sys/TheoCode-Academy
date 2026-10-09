import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: squadId, memberId } = await params;
    const { action } = await request.json(); // 'approve' or 'reject'
    const sql = neon(process.env.DATABASE_URL!);

    // Verify user is owner or leader
    const roleCheck = await sql`
      SELECT role FROM squad_members WHERE squad_id = ${squadId} AND user_id = ${userId} AND status = 'approved'
    `;
    
    if (roleCheck.length === 0 || (roleCheck[0].role !== 'owner' && roleCheck[0].role !== 'leader')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'approve') {
      await sql`
        UPDATE squad_members SET status = 'approved' WHERE squad_id = ${squadId} AND user_id = ${memberId}
      `;
    } else if (action === 'reject') {
      await sql`
        DELETE FROM squad_members WHERE squad_id = ${squadId} AND user_id = ${memberId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}