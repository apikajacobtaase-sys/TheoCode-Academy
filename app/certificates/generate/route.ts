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

    // Check if user completed the course
    const [enrollment] = await sql`
      SELECT * FROM course_enrollments 
      WHERE user_id = ${user.id} AND course_id = ${courseId} AND progress_percentage = 100
    `;

    if (!enrollment) {
      return NextResponse.json({ error: 'Course not completed' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}