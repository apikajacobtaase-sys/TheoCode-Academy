import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const sort = searchParams.get('sort') || 'newest';

    const sql = neon(process.env.DATABASE_URL!);

    // 🎯 ALWAYS fetch all courses first (simple, never fails)
    const allCourses = await sql`SELECT * FROM courses ORDER BY created_at DESC`;

    // 🎯 Apply filters in JavaScript (handles NULL values perfectly)
    let filteredCourses = allCourses;

    if (category && category !== 'all') {
      filteredCourses = filteredCourses.filter((c: any) => c.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filteredCourses = filteredCourses.filter((c: any) => c.difficulty === difficulty);
    }

    // 🎯 Sort (default: newest first)
    if (sort === 'rating') {
      // Will be enhanced when we have review stats
      filteredCourses = filteredCourses.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === 'popular') {
      // Will be enhanced when we have enrollment stats
      filteredCourses = filteredCourses.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // 🎯 Get distinct categories (including NULL as "Uncategorized")
    const categoriesSet = new Set<string>();
    allCourses.forEach((c: any) => {
      if (c.category) categoriesSet.add(c.category);
    });
    const categories = Array.from(categoriesSet).sort();

    // 🎯 Add default stats (will be enhanced later)
    const coursesWithStats = filteredCourses.map((course: any) => ({
      ...course,
      average_rating: '0.0',
      review_count: 0,
      enrollment_count: 0
    }));

    console.log(`✅ Returning ${coursesWithStats.length} courses (filtered from ${allCourses.length} total)`);

    return NextResponse.json({ 
      courses: coursesWithStats,
      categories,
      filters: {
        category: category || 'all',
        difficulty: difficulty || 'all',
        sort
      }
    });

  } catch (error: any) {
    console.error('❌ Courses GET Error:', error.message);
    return NextResponse.json({ 
      error: error.message,
      courses: [],
      categories: []
    }, { status: 500 });
  }
}