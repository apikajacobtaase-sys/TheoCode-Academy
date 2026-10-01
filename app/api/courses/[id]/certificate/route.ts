import { auth, currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Allow admin to view any student's certificate via ?studentId=xxx
    const targetUserId = searchParams.get('studentId') || userId;
    
    const sql = neon(process.env.DATABASE_URL!);

    // If admin is viewing another student, verify they're the course creator
    if (targetUserId !== userId) {
      const courseCheck = await sql`
        SELECT 1 FROM courses WHERE id = ${id} AND creator_id = ${userId}
      `;
      if (courseCheck.length === 0) {
        return NextResponse.json({ error: 'Only the course creator can view student certificates' }, { status: 403 });
      }
    }

    // Get user profile
    const userProfile = await sql`
      SELECT full_name FROM user_profiles WHERE user_id = ${targetUserId}
    `;

    // Get course details
    const course = await sql`
      SELECT title FROM courses WHERE id = ${id}
    `;

    // Check if user completed all modules
    const modules = await sql`
      SELECT id FROM course_modules WHERE course_id = ${id}
    `;

    const progress = await sql`
      SELECT COUNT(*)::int as completed_count
      FROM module_progress
      WHERE user_id = ${targetUserId} 
        AND module_id IN (SELECT id FROM course_modules WHERE course_id = ${id})
        AND completed = true
    `;

    const totalModules = modules.length;
    const completedModules = progress[0]?.completed_count || 0;
    const isComplete = totalModules > 0 && completedModules === totalModules;

    // Get completion date
    const lastCompletion = await sql`
      SELECT MAX(completed_at) as completed_at
      FROM module_progress
      WHERE user_id = ${targetUserId} 
        AND module_id IN (SELECT id FROM course_modules WHERE course_id = ${id})
        AND completed = true
    `;

    return NextResponse.json({
      eligible: isComplete,
      userName: userProfile[0]?.full_name || 'Student',
      courseTitle: course[0]?.title || 'Course',
      completedAt: lastCompletion[0]?.completed_at || new Date(),
      totalModules,
      completedModules
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}