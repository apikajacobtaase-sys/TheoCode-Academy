import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

// 🎯 POST: Enroll in a course
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
      VALUES (${userId}, ${id}, NOW())
      ON CONFLICT (user_id, course_id) DO NOTHING
    `;

    return NextResponse.json({ enrolled: true });
  } catch (error: any) {
    console.error('Enroll error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🎯 GET: Check if user is enrolled
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ enrolled: false });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      SELECT 1 FROM course_enrollments 
      WHERE user_id = ${userId} AND course_id = ${id}
    `;

    return NextResponse.json({ enrolled: result.length > 0 });
  } catch (error: any) {
    return NextResponse.json({ enrolled: false });
  }
}

// 🎯 DELETE: Unenroll from a course (FIXED)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 1. Delete progress for lessons in this course (using subquery)
    await sql`
      DELETE FROM lesson_progress 
      WHERE user_id = ${userId} 
      AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ${id})
    `;

    // 🎯 2. Delete the enrollment itself
    await sql`
      DELETE FROM course_enrollments 
      WHERE user_id = ${userId} AND course_id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Unenrolled successfully' });
  } catch (error: any) {
    console.error('Unenroll error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}