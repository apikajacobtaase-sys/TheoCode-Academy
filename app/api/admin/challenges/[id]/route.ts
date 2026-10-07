import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM challenges WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin Challenge DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
  }
}