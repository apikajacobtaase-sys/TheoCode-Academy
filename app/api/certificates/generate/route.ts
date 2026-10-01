import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if user has completed the course
    const enrollment = await sql`
      SELECT completed FROM course_enrollments 
      WHERE course_id = ${courseId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (enrollment.length === 0) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    if (!enrollment[0].completed) {
      return NextResponse.json({ error: 'Course not completed' }, { status: 403 });
    }

    // Check if certificate already exists
    const existing = await sql`
      SELECT * FROM certificates 
      WHERE course_id = ${courseId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ certificate: existing[0] });
    }

    // Generate unique certificate number
    const certNumber = `TC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create certificate
    const certificate = await sql`
      INSERT INTO certificates (user_id, course_id, certificate_number)
      VALUES (${userId}, ${courseId}, ${certNumber})
      RETURNING *
    `;

    return NextResponse.json({ certificate: certificate[0] }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Certificate Generation Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}