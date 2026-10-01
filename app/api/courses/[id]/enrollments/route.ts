import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const enrollments = await sql`
      SELECT id, user_id, course_id, enrolled_at
      FROM course_enrollments
      WHERE course_id = ${courseId}
    `;

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    console.error('❌ Enrollments GET Error:', error.message);
    return NextResponse.json({ error: error.message, enrollments: [] }, { status: 500 });
  }
}