import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> } // 🎯 Changed lessonId to id
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { itemId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM lesson_items WHERE id = ${itemId}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Lesson Item DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}