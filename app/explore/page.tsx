'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// 🎯 CRITICAL: Tells Next.js not to statically generate this page
export const dynamic = 'force-dynamic';

interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  category?: string;
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  // Fetch all courses on mount
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        const fetchedCourses = data.courses || [];
        setCourses(fetchedCourses);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, []);

  // Filter courses whenever the query or courses list changes
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = courses.filter((course) => 
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description.toLowerCase().includes(lowerQuery) ||
        course.category?.toLowerCase().includes(lowerQuery) ||
        course.language.toLowerCase().includes(lowerQuery)
      );
      setFilteredCourses(filtered);
    }
  }, [query, courses]);

  // Update URL when user types in the search box
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.trim() === '') {
      router.replace('/explore', { scroll: false });
    } else {
      router.replace(`/explore?q=${encodeURIComponent(value)}`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🎯 Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/20 to-black py-16 px-4 sm:px-8 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
            What do you want to learn today?
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Explore our library of interactive coding courses and challenges.
          </p>
          
          {/* 🎯 Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by topic, language, or difficulty (e.g., 'Python', 'Arrays')..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 px-6 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition text-lg"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 🎯 Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-green-400 animate-pulse text-xl">Loading courses...</div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-gray-400">Try adjusting your search terms or check back later for new courses!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {query ? `Results for "${query}"` : 'All Available Courses'}
              </h2>
              <span className="text-gray-400 text-sm">{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link 
                  key={course.id} 
                  href={`/courses/${course.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-purple-900/30 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wide">
                      {course.language}
                    </span>
                    {course.difficulty && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        course.difficulty === 'easy' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                        course.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' :
                        'bg-red-900/30 text-red-400 border-red-500/30'
                      }`}>
                        {course.difficulty}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                    {course.description || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center text-green-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                    View Course 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 🎯 CRITICAL: The default export wraps the search-params-using component in Suspense
export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading Explore...</div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}