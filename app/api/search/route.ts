import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        courses: [], 
        challenges: [], 
        users: [],
        squads: []
      });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const searchTerm = `%${query}%`;

    // Search across all content types in parallel
    const [courses, challenges, users, squads] = await Promise.all([
      // Courses
      sql`
        SELECT id, title, description, 'course' as type
        FROM courses
        WHERE title ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
        LIMIT 5
      `,
      
      // Challenges (if table exists)
      sql`
        SELECT id, title, description, 'challenge' as type
        FROM challenges
        WHERE title ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
        LIMIT 5
      `.catch(() => []),
      
      // Users
      sql`
        SELECT user_id as id, full_name as title, 'user' as type, profile_image_url
        FROM user_profiles
        WHERE full_name ILIKE ${searchTerm} OR username ILIKE ${searchTerm}
        LIMIT 5
      `,
      
      // Squads
      sql`
        SELECT id, name as title, description, 'squad' as type
        FROM squads
        WHERE name ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
        LIMIT 5
      `
    ]);

    return NextResponse.json({ 
      courses,
      challenges,
      users,
      squads,
      totalResults: courses.length + challenges.length + users.length + squads.length
    });

  } catch (error: any) {
    console.error('❌ Search API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}