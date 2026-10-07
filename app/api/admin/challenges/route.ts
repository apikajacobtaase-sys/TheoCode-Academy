import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const challenges = await sql`
      SELECT id, title, difficulty, points, language, is_active, created_at
      FROM challenges
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ challenges });
  } catch (error: any) {
    console.error('❌ Admin Challenges GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}