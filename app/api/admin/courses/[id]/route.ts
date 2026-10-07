import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    // 🎯 Better admin check with detailed logging
    if (!user) {
      console.error('❌ No user found in request');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (user.publicMetadata?.role !== 'admin') {
      console.error('❌ User is not admin:', user.id);
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    console.log('🔍 Fetching course:', id);
    
    const sql = neon(process.env.DATABASE_URL!);

    const [course] = await sql`SELECT * FROM courses WHERE id = ${id}`;
    
    if (!course) {
      console.error('❌ Course not found:', id);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const lessons = await sql`SELECT * FROM lessons WHERE course_id = ${id} ORDER BY order_index`;

    console.log('✅ Course found:', course.title, 'with', lessons.length, 'lessons');

    return NextResponse.json({ course, lessons });
  } catch (error: any) {
    console.error('❌ Admin Course GET Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch course',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE courses SET
        title = ${body.title},
        description = ${body.description || ''},
        instructor = ${body.instructor || 'TheCode Academy'},
        image_url = ${body.image_url || null},
        difficulty = ${body.difficulty || 'beginner'},
        category = ${body.category || 'Programming'},
        language = ${body.language || 'C++'},
        duration_hours = ${body.duration_hours || 0},
        is_published = ${body.is_published || false},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin Course PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM courses WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin Course DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}