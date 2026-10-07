import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const courses = await sql`
      SELECT * FROM courses WHERE is_published = true ORDER BY created_at DESC
    `;
    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('❌ Courses GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}