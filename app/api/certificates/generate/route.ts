import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 Check if user completed the course (using progress_percentage only)
    const [enrollment] = await sql`
      SELECT user_id, course_id, progress_percentage, enrolled_at
      FROM course_enrollments 
      WHERE user_id = ${user.id} AND course_id = ${courseId}
    `;

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 400 });
    }

    if (enrollment.progress_percentage !== 100) {
      return NextResponse.json({ error: 'Course not completed yet' }, { status: 400 });
    }

    // Check if certificate already exists
    const [existing] = await sql`
      SELECT * FROM course_certificates 
      WHERE user_id = ${user.id} AND course_id = ${courseId}
    `;

    if (existing) {
      return NextResponse.json({ certificate: existing });
    }

    // Generate unique certificate number
    const certNumber = `TC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const [certificate] = await sql`
      INSERT INTO course_certificates (user_id, course_id, certificate_number)
      VALUES (${user.id}, ${courseId}, ${certNumber})
      RETURNING *
    `;

    return NextResponse.json({ success: true, certificate });
  } catch (error: any) {
    console.error('❌ Certificate Error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate', details: error.message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ certificate: null });
    }

    const { courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const [certificate] = await sql`
      SELECT * FROM course_certificates 
      WHERE user_id = ${user.id} AND course_id = ${courseId}
    `;

    return NextResponse.json({ certificate });
  } catch (error: any) {
    console.error('❌ Certificate GET Error:', error);
    return NextResponse.json({ certificate: null });
  }
}