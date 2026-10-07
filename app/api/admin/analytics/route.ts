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

    // Course popularity
    const popularCourses = await sql`
      SELECT 
        c.id,
        c.title,
        COUNT(ce.id) as enrollments,
        AVG(ce.progress_percentage) as avg_progress
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      GROUP BY c.id, c.title
      ORDER BY enrollments DESC
      LIMIT 10
    `;

    // Completion rates
    const completionStats = await sql`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN progress_percentage = 100 THEN 1 END) as completed,
        ROUND(AVG(progress_percentage), 2) as avg_progress
      FROM course_enrollments
    `;

    // Quiz performance
    const quizStats = await sql`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(percentage) as avg_score,
        MAX(percentage) as highest_score
      FROM quiz_attempts
    `;

    // Recent activity
    const recentActivity = await sql`
      SELECT 
        'enrollment' as type,
        ce.enrolled_at as date,
        c.title as description
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      ORDER BY ce.enrolled_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      popularCourses,
      completionStats: completionStats[0],
      quizStats: quizStats[0],
      recentActivity
    });
  } catch (error: any) {
    console.error('❌ Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}