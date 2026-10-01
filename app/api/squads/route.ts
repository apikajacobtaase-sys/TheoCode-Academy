import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const squads = await sql`
      SELECT id, name, description, creator_id, created_at
      FROM squads
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ squads });
  } catch (error: any) {
    console.error('❌ Squads GET Error:', error.message);
    return NextResponse.json({ error: error.message, squads: [] }, { status: 500 });
  }
}