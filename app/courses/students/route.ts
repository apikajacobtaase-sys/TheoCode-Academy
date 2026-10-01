import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Verify this user is the course creator
    const courseCheck = await sql`
      SELECT 1 FROM courses WHERE id = ${id} AND creator_id = ${userId}
    `;

    if (courseCheck.length === 0) {
      return NextResponse.json({ error: 'Only the course creator can view student analytics' }, { status: 403 });
    }

    // Get course info
    const course = await sql`
      SELECT title FROM courses WHERE id = ${id}
    `;

    // Get total modules in course
    const modules = await sql`
      SELECT id FROM course_modules WHERE course_id = ${id}
    `;
    const totalModules = modules.length;

    // Get all students who have progress on this course
    const students = await sql`
      SELECT 
        mp.user_id,
        up.full_name,
        up.email,
        up.avatar_url,
        COUNT(CASE WHEN mp.completed = true THEN 1 END)::int as completed_modules,
        ROUND(AVG(mp.score))::int as average_score,
        MAX(mp.completed_at) as last_activity,
        MIN(mp.completed_at) as first_activity
      FROM module_progress mp
      LEFT JOIN user_profiles up ON mp.user_id = up.user_id
      WHERE mp.module_id IN (SELECT id FROM course_modules WHERE course_id = ${id})
      GROUP BY mp.user_id, up.full_name, up.email, up.avatar_url
      ORDER BY MAX(mp.completed_at) DESC
    `;

    // Enrich with completion status
    const enrichedStudents = students.map((student) => {
      const completionRate = totalModules > 0 
        ? Math.round((student.completed_modules / totalModules) * 100) 
        : 0;
      const hasCertificate = completionRate === 100 && totalModules > 0;

      return {
        ...student,
        completion_rate: completionRate,
        has_certificate: hasCertificate,
        total_modules: totalModules
      };
    });

    // Calculate overall stats
    const totalStudents = enrichedStudents.length;
    const completedStudents = enrichedStudents.filter(s => s.has_certificate).length;
    const averageScore = totalStudents > 0 
      ? Math.round(enrichedStudents.reduce((sum, s) => sum + (s.average_score || 0), 0) / totalStudents)
      : 0;

    return NextResponse.json({
      courseTitle: course[0]?.title || 'Course',
      totalStudents,
      completedStudents,
      totalModules,
      averageScore,
      completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
      students: enrichedStudents
    });
  } catch (error: any) {
    console.error('Students Analytics Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}