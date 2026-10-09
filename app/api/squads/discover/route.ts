import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);

    // Fetch public squads that the user is NOT already a member of
    const result = await sql`
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.is_private,
        COUNT(sm.user_id) as member_count
      FROM squads s
      LEFT JOIN squad_members sm ON s.id = sm.squad_id AND sm.status = 'approved'
      WHERE s.is_private = false
        AND s.id NOT IN (
          SELECT squad_id FROM squad_members WHERE user_id = ${userId}
        )
      GROUP BY s.id, s.name, s.description, s.is_private
      ORDER BY member_count DESC
      LIMIT 50
    `;

    return NextResponse.json({ squads: result });
  } catch (error: any) {
    console.error('Discover squads error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}