import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ enrollments: [] });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const enrollments = await sql`
      SELECT 
        ce.course_id,
        c.title,
        c.image_url,
        ce.progress_percentage,
        ce.enrolled_at,
        ce.completed_at
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.user_id = ${user.id}
      ORDER BY ce.enrolled_at DESC
    `;

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    console.error('❌ My Learning Error:', error);
    return NextResponse.json({ enrollments: [] });
  }
}