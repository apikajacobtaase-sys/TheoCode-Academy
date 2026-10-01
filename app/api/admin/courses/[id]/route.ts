import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Check admin
    const adminCheck = await sql`SELECT 1 FROM admin_users WHERE user_id = ${userId}`;
    const allAdmins = await sql`SELECT COUNT(*)::int as count FROM admin_users`;
    const isAdmin = adminCheck.length > 0 || allAdmins[0].count === 0;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Delete course (cascades to modules, contents, questions)
    await sql`DELETE FROM courses WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Delete Course Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}