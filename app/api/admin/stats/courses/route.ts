import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT COUNT(*) as count FROM courses`;

    return NextResponse.json({ count: parseInt(result[0].count) });
  } catch (error: any) {
    console.error('❌ Stats Courses Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}