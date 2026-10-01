import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Bulletproof query using MAX() to avoid GROUP BY null issues
    const realUsers = await sql`
      SELECT 
        ce.user_id,
        COALESCE(MAX(up.full_name), 'Anonymous Developer') as name,
        COALESCE(MAX(up.avatar_url), MAX(up.profile_image_url)) as image_url,
        COUNT(CASE WHEN ce.completed = true THEN 1 END) as courses_completed,
        COUNT(*) as total_enrollments
      FROM course_enrollments ce
      LEFT JOIN user_profiles up ON ce.user_id = up.user_id
      GROUP BY ce.user_id
      ORDER BY courses_completed DESC, total_enrollments DESC
      LIMIT 50
    `;

    console.log('📊 Leaderboard DB Result:', realUsers); // <-- Check your terminal for this!

    if (realUsers && realUsers.length > 0) {
      const leaderboardData = realUsers.map((u: any) => {
        const courses = parseInt(u.courses_completed) || 0;
        const challenges = 0;
        const xp = (courses * 100) + (challenges * 50);
        
        return {
          id: u.user_id,
          name: u.name || 'Anonymous Developer',
          image: u.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`,
          courses: courses,
          challenges: challenges,
          xp: xp
        };
      });
      
      return NextResponse.json({ leaderboard: leaderboardData });
    }

    console.log('⚠️ No enrollments found in database');
    return NextResponse.json({ leaderboard: [] });

  } catch (error: any) {
    console.error('❌ Leaderboard API Error:', error.message);
    return NextResponse.json({ error: error.message, leaderboard: [] }, { status: 500 });
  }
}