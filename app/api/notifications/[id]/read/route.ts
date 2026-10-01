import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Use is_read instead of read
    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Notification Read Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}