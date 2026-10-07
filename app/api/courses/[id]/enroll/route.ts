import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO course_enrollments (user_id, course_id, progress_percentage)
      VALUES (${user.id}, ${courseId}, 0)
      ON CONFLICT (user_id, course_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Enroll POST Error:', error);
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ enrolled: false });
    }

    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const [enrollment] = await sql`
      SELECT * FROM course_enrollments 
      WHERE user_id = ${user.id} AND course_id = ${courseId}
    `;

    return NextResponse.json({ enrolled: !!enrollment });
  } catch (error: any) {
    console.error('❌ Enroll GET Error:', error);
    return NextResponse.json({ enrolled: false });
  }
}