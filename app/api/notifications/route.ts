import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ unreadCount: 0 }, { status: 200 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 ULTRA-FAST: Only count unread notifications, no complex joins
    // Adjust the table/column names below to match your actual notifications table
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${userId} AND is_read = false
    `;

    const unreadCount = parseInt(result[0].count) || 0;

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Notifications GET Error:', error.message);
    // 🎯 FAIL-SAFE: Return 0 instead of crashing the whole page
    return NextResponse.json({ unreadCount: 0 }, { status: 200 });
  }
}