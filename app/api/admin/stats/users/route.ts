import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);

    const countResult = await sql`SELECT COUNT(*) as count FROM user_profiles`;
    
    // 🎯 Changed 'user_id' to 'user_id as id' so the frontend key works perfectly
    const recentResult = await sql`
      SELECT user_id as id, full_name, username, profile_image_url, created_at
      FROM user_profiles
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      count: parseInt(countResult[0].count),
      recent: recentResult
    });
  } catch (error: any) {
    console.error('❌ Stats Users Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}