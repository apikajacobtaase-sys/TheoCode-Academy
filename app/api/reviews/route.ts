import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const sql = neon(process.env.DATABASE_URL!);

    const reviews = await sql`
      SELECT * FROM course_reviews 
      WHERE course_id = ${courseId} 
      ORDER BY created_at DESC
    `;

    // Calculate average rating
    const avg = await sql`
      SELECT COALESCE(AVG(rating), 0)::numeric(3,1) as avg_rating, COUNT(*)::int as total_reviews
      FROM course_reviews WHERE course_id = ${courseId}
    `;

    return NextResponse.json({ reviews, stats: avg[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { courseId, userId, userName, rating, comment } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    const review = await sql`
      INSERT INTO course_reviews (course_id, user_id, user_name, rating, comment)
      VALUES (${courseId}, ${userId}, ${userName}, ${rating}, ${comment})
      ON CONFLICT (course_id, user_id) 
      DO UPDATE SET rating = ${rating}, comment = ${comment}, created_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({ success: true, review: review[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}