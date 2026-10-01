'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedDifficulty, sortBy]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      if (sortBy !== 'newest') params.set('sort', sortBy);

      const url = params.toString() ? `/api/courses?${params.toString()}` : '/api/courses';
      console.log('📡 Fetching courses from:', url);

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Received courses:', data.courses?.length || 0);
        setCourses(data.courses || []);
        setCategories(data.categories || []);
      } else {
        console.error('❌ Failed to fetch courses:', res.status);
        setCourses([]);
      }
    } catch (error) {
      console.error('💥 Fetch error:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    const newUrl = params.toString() ? `/explore?${params.toString()}` : '/explore';
    router.push(newUrl);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-600/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalf) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-600">★</span>);
      }
    }
    return stars;
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">🔍 Explore Courses</h1>
          <p className="text-gray-400">
            Discover courses tailored to your skill level and interests.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  updateFilters('category', e.target.value);
                }}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  updateFilters('difficulty', e.target.value);
                }}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">🟢 Beginner</option>
                <option value="Intermediate">🟡 Intermediate</option>
                <option value="Advanced">🔴 Advanced</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters('sort', e.target.value);
                }}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
              >
                <option value="newest">🆕 Newest First</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="popular">🔥 Most Popular</option>
              </select>
            </div>

          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">Active filters:</span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    updateFilters('category', 'all');
                  }}
                  className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded-full text-sm flex items-center gap-1 hover:bg-green-600/30 transition"
                >
                  {selectedCategory} ✕
                </button>
              )}
              {selectedDifficulty !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedDifficulty('all');
                    updateFilters('difficulty', 'all');
                  }}
                  className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded-full text-sm flex items-center gap-1 hover:bg-green-600/30 transition"
                >
                  {selectedDifficulty} ✕
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSortBy('newest');
                  router.push('/explore');
                }}
                className="px-3 py-1 text-gray-400 hover:text-white text-sm transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-gray-800 rounded-lg mb-4" />
                <div className="h-6 bg-gray-800 rounded mb-2" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800 border-dashed">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No courses found</h2>
            <p className="text-gray-400 mb-6">Try adjusting your filters or check back later.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSortBy('newest');
                router.push('/explore');
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition-all group"
              >
                {/* Course Image/Placeholder */}
                <div className="h-40 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center text-6xl">
                  {course.category === 'Web Development' && '🌐'}
                  {course.category === 'Backend' && '⚙️'}
                  {course.category === 'Data Science' && '📊'}
                  {course.category === 'DevOps' && '🚀'}
                  {!course.category && '📚'}
                </div>

                <div className="p-6">
                  {/* Category & Difficulty Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.category && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded text-xs font-medium">
                        {course.category}
                      </span>
                    )}
                    {course.difficulty && (
                      <span className={`px-2 py-1 border rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex">{renderStars(parseFloat(course.average_rating || '0'))}</div>
                      <span className="text-gray-400 text-xs">
                        ({course.review_count || 0})
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      👥 {course.enrollment_count || 0} enrolled
                    </div>
                  </div>

                  {/* Duration */}
                  {course.duration_hours && (
                    <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
                      ⏱️ {course.duration_hours} hours
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}