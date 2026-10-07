import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Calculate total points per squad by summing up solved challenge points of all members
    const leaderboard = await sql`
      SELECT 
        s.id as squad_id,
        s.name as squad_name,
        s.description,
        s.image_url,
        COUNT(DISTINCT sm.user_id) as member_count,
        COALESCE(SUM(c.points), 0) as total_points
      FROM squads s
      JOIN squad_members sm ON s.id = sm.squad_id AND sm.status = 'approved'
      LEFT JOIN challenge_progress cp ON sm.user_id = cp.user_id AND cp.status = 'solved'
      LEFT JOIN challenges c ON cp.challenge_id = c.id
      GROUP BY s.id, s.name, s.description, s.image_url
      ORDER BY total_points DESC, s.name ASC
      LIMIT 50
    `;

    // 🎯 Find the current user's squad rank to highlight it
    const userSquad = leaderboard.find((s: any) => {
      // We'll do a quick check to see if the user is in this squad
      return true; // Simplified for the list, we can add a specific user check if needed
    });

    return NextResponse.json({
      success: true,
      leaderboard
    });
  } catch (error: any) {
    console.error('❌ Leaderboard API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}