import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Get reviews with user info
    const reviews = await sql`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.user_id,
        up.full_name,
        up.profile_image_url,
        up.is_name_verified
      FROM course_reviews r
      LEFT JOIN user_profiles up ON r.user_id = up.user_id
      WHERE r.course_id = ${courseId}
      ORDER BY r.created_at DESC
    `;

    // Calculate average rating and count
    const stats = await sql`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating
      FROM course_reviews
      WHERE course_id = ${courseId}
    `;

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews: parseInt(stats[0].total_reviews),
        averageRating: parseFloat(stats[0].average_rating).toFixed(1)
      }
    });

  } catch (error: any) {
    console.error('❌ Reviews GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: courseId } = await params;
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if user is enrolled
    const enrollment = await sql`
      SELECT 1 FROM course_enrollments 
      WHERE course_id = ${courseId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (enrollment.length === 0) {
      return NextResponse.json({ error: 'Must be enrolled to review' }, { status: 403 });
    }

    // Insert or update review (upsert)
    const review = await sql`
      INSERT INTO course_reviews (course_id, user_id, rating, comment)
      VALUES (${courseId}, ${userId}, ${rating}, ${comment || null})
      ON CONFLICT (course_id, user_id) 
      DO UPDATE SET rating = ${rating}, comment = ${comment || null}, updated_at = NOW()
      RETURNING id, rating, comment, created_at
    `;

    return NextResponse.json({ review: review[0] }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Reviews POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: courseId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      DELETE FROM course_reviews 
      WHERE course_id = ${courseId} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Reviews DELETE Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}