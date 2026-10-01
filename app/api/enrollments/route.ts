import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const sql = neon(process.env.DATABASE_URL!);

    if (courseId && userId) {
      // Check if user is enrolled in specific course
      const enrollment = await sql`
        SELECT * FROM enrollments 
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `;
      return NextResponse.json({ enrolled: enrollment.length > 0, enrollment: enrollment[0] || null });
    }

    if (userId) {
      // Get all enrollments for user
      const enrollments = await sql`
        SELECT e.*, c.title, c.description, c.language, c.total_lessons, c.total_modules
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ${userId}
        ORDER BY e.enrolled_at DESC
      `;
      return NextResponse.json({ enrollments });
    }

    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  } catch (error: any) {
    console.error('Enrollments Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, courseId } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    // Check if already enrolled
    const existing = await sql`
      SELECT id FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Already enrolled', enrolled: true });
    }

    const enrollment = await sql`
      INSERT INTO enrollments (user_id, course_id)
      VALUES (${userId}, ${courseId})
      RETURNING *
    `;

    return NextResponse.json({ success: true, enrolled: true, enrollment: enrollment[0] });
  } catch (error: any) {
    console.error('Enrollment Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, courseId, completed } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE enrollments 
      SET completed = ${completed}, completed_at = ${completed ? 'NOW()' : null}
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}