import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Added MIN(id) as id so React has a unique key for each grouped row
    const notifications = await sql`
      SELECT 
        MIN(id) as id,
        title,
        message,
        type,
        link,
        MIN(created_at) as created_at,
        COUNT(*) as recipient_count
      FROM notifications
      GROUP BY title, message, type, link
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('❌ Admin Notifications GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Delete all notifications with this title (the broadcast)
    await sql`
      DELETE FROM notifications
      WHERE title = ${title}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin Notifications DELETE Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}