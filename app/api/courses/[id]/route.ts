import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const course = await sql`
      SELECT * FROM courses WHERE id = ${id} LIMIT 1
    `;

    if (course.length === 0) {
      console.warn(`⚠️ Course with ID ${id} not found in database`);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course: course[0] });

  } catch (error: any) {
    console.error('❌ Course [id] API Error:', error.message);
    return NextResponse.json({ error: error.message, course: null }, { status: 500 });
  }
}