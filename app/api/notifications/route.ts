import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Use is_read instead of read
    const notifications = await sql`
      SELECT id, title, message, type, link, is_read as read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('❌ Notifications GET Error:', error.message);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId, title, message, type, link } = await request.json();

    if (!targetUserId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const notification = await sql`
      INSERT INTO notifications (user_id, title, message, type, link, is_read)
      VALUES (${targetUserId}, ${title}, ${message || null}, ${type || 'info'}, ${link || null}, false)
      RETURNING *
    `;

    return NextResponse.json({ notification: notification[0] }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Notifications POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}