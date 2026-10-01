import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Add strict admin check here if you have an is_admin column
    // const adminCheck = await sql`SELECT 1 FROM user_profiles WHERE user_id = ${userId} AND is_admin = TRUE LIMIT 1`;
    // if (adminCheck.length === 0) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { title, message, type, link, target, targetId } = await request.json();

    if (!title || !message || !target) {
      return NextResponse.json({ error: 'Title, message, and target are required' }, { status: 400 });
    }

    if ((target === 'course' || target === 'squad') && !targetId) {
      return NextResponse.json({ error: 'Target ID is required for course or squad broadcasts' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    let result;

    if (target === 'all') {
      // 🌍 Universal: Send to everyone in user_profiles
      result = await sql`
        INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
        SELECT user_id, ${title}, ${message}, ${type}, ${link || null}, FALSE, NOW()
        FROM user_profiles
        RETURNING id
      `;
    } else if (target === 'course') {
      // 📚 Course-Specific: Send only to enrolled users
      result = await sql`
        INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
        SELECT user_id, ${title}, ${message}, ${type}, ${link || null}, FALSE, NOW()
        FROM course_enrollments
        WHERE course_id = ${targetId}
        RETURNING id
      `;
    } else if (target === 'squad') {
      // 🛡️ Squad-Specific: Send only to squad members
      result = await sql`
        INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
        SELECT user_id, ${title}, ${message}, ${type}, ${link || null}, FALSE, NOW()
        FROM squad_members
        WHERE squad_id = ${targetId}
        RETURNING id
      `;
    } else {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      count: result.length 
    });

  } catch (error: any) {
    console.error('❌ Broadcast API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to send broadcast' }, { status: 500 });
  }
}