import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: courseId } = await params;

    console.log('📥 Enrollment API called:', { userId, courseId });

    if (!userId) {
      console.error('❌ No userId - user not authenticated');
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    if (!courseId) {
      console.error('❌ No courseId provided');
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if course exists
    const course = await sql`
      SELECT id, title FROM courses WHERE id = ${courseId} LIMIT 1
    `;

    if (course.length === 0) {
      console.error('❌ Course not found:', courseId);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await sql`
      SELECT id, enrolled_at FROM course_enrollments
      WHERE course_id = ${courseId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      console.log('✅ Already enrolled:', existing[0]);
      return NextResponse.json({
        success: true,
        message: 'Already enrolled',
        enrollment: existing[0]
      });
    }

    // Create enrollment
    const enrollment = await sql`
      INSERT INTO course_enrollments (course_id, user_id, completed)
      VALUES (${courseId}, ${userId}, false)
      RETURNING id, course_id, user_id, enrolled_at
    `;

    console.log('✅ Enrollment created:', enrollment[0]);

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled!',
      enrollment: enrollment[0]
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Enrollment API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}