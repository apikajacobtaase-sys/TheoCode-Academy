import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// GET: Fetch all courses
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);

    const adminCheck = await sql`SELECT 1 FROM admin_users WHERE user_id = ${userId}`;
    const allAdmins = await sql`SELECT COUNT(*)::int as count FROM admin_users`;
    const isAdmin = adminCheck.length > 0 || allAdmins[0].count === 0;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = await sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.created_at,
        up.full_name as creator_name,
        (SELECT COUNT(*)::int FROM course_modules cm WHERE cm.course_id = c.id) as module_count,
        (SELECT COUNT(DISTINCT mp.user_id)::int FROM module_progress mp 
         JOIN course_modules cm ON mp.module_id = cm.id 
         WHERE cm.course_id = c.id) as student_count,
        (SELECT ROUND(AVG(mp.score))::int FROM module_progress mp 
         JOIN course_modules cm ON mp.module_id = cm.id 
         WHERE cm.course_id = c.id AND mp.completed = true) as completion_rate
      FROM courses c
      LEFT JOIN user_profiles up ON c.creator_id = up.user_id
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('❌ Admin Courses GET Error:', error.message);
    return NextResponse.json({ error: error.message, courses: [] }, { status: 500 });
  }
}

// POST: Create a new course
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, language } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    const adminCheck = await sql`SELECT 1 FROM admin_users WHERE user_id = ${userId}`;
    const allAdmins = await sql`SELECT COUNT(*)::int as count FROM admin_users`;
    const isAdmin = adminCheck.length > 0 || allAdmins[0].count === 0;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const course = await sql`
      INSERT INTO courses (title, description, creator_id, language)
      VALUES (${title}, ${description}, ${userId}, ${language || 'English'})
      RETURNING id, title, description, creator_id, language
    `;

    return NextResponse.json({ success: true, course: course[0] });
  } catch (error: any) {
    console.error('❌ Create Course Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a course (accepts query parameter)
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId parameter' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const adminCheck = await sql`SELECT 1 FROM admin_users WHERE user_id = ${userId}`;
    const allAdmins = await sql`SELECT COUNT(*)::int as count FROM admin_users`;
    const isAdmin = adminCheck.length > 0 || allAdmins[0].count === 0;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await sql`DELETE FROM courses WHERE id = ${courseId}`;

    return NextResponse.json({ success: true, message: 'Course deleted' });
  } catch (error: any) {
    console.error('❌ Delete Course Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}