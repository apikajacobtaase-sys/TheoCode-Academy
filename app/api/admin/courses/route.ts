import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    // 🎯 Admins see ALL courses (published + drafts)
    const courses = await sql`
      SELECT 
        id,
        title,
        description,
        difficulty,
        category,
        language,
        duration_hours,
        total_lessons,
        total_modules,
        image_url,
        instructor,
        is_published,
        created_at
      FROM courses 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('❌ Admin Courses GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, instructor, image_url, difficulty, category, language, duration_hours, is_published } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      INSERT INTO courses (title, description, instructor, image_url, difficulty, category, language, duration_hours, is_published)
      VALUES (${title}, ${description || ''}, ${instructor || 'TheCode Academy'}, ${image_url || null}, ${difficulty || 'beginner'}, ${category || 'Programming'}, ${language || 'C++'}, ${duration_hours || 0}, ${is_published || false})
      RETURNING id
    `;

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error: any) {
    console.error('❌ Admin Courses POST Error:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}