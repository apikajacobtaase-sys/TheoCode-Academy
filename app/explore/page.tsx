'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

  // 🎯 Quick Filter Pills for intelligent, one-click searching
  const quickFilters = ['Python', 'JavaScript', 'React', 'Beginner', 'Advanced'];

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, []);

  // 🎯 INTELLIGENT SEARCH LOGIC (Tokenized AND matching)
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const lowerQuery = query.toLowerCase();
      // Split search into individual words (tokens)
      const queryTokens = lowerQuery.split(/\s+/).filter(t => t.length > 0);
      
      const filtered = courses.filter((course) => {
        // Combine all searchable fields into one string
        const searchableText = `
          ${course.title} 
          ${course.description} 
          ${course.category || ''} 
          ${course.language} 
          ${course.difficulty || ''}
        `.toLowerCase();
        
        // 🎯 MAGIC: Course must match ALL tokens (e.g., "Python" AND "Beginner")
        return queryTokens.every(token => searchableText.includes(token));
      });
      setFilteredCourses(filtered);
    }
  }, [query, courses]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.trim() === '') {
      router.replace('/explore', { scroll: false });
    } else {
      router.replace(`/explore?q=${encodeURIComponent(value)}`, { scroll: false });
    }
  };

  const applyQuickFilter = (filter: string) => {
    setSearchInput(filter);
    router.replace(`/explore?q=${encodeURIComponent(filter)}`, { scroll: false });
  };

  // 🎯 Helper for premium card gradients based on language
  const getLanguageGradient = (lang: string) => {
    switch(lang?.toLowerCase()) {
      case 'python': return 'from-blue-900/40 to-yellow-900/20';
      case 'javascript': return 'from-yellow-900/30 to-gray-900/40';
      case 'react': return 'from-cyan-900/30 to-blue-900/40';
      case 'html/css': return 'from-orange-900/30 to-purple-900/40';
      default: return 'from-purple-900/30 to-pink-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* 🎯 1. HERO SECTION WITH my-learning2.jpg */}
      <div className="relative py-20 md:py-28 px-4 sm:px-8 border-b border-gray-800 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/my-learning2.jpg" 
            alt="Learning background" 
            fill 
            className="object-cover opacity-30" 
            priority
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            What do you want to<br className="hidden sm:block" /> learn today?
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Explore our library of interactive coding courses and challenges.
          </p>
          
          {/* 🎯 Intelligent Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by topic, language, or difficulty..."
              className="w-full bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl py-4 px-6 pl-14 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition text-lg shadow-2xl"
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchInput && (
              <button 
                onClick={() => { setSearchInput(''); router.replace('/explore', { scroll: false }); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* 🎯 Quick Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {quickFilters.map(f => (
              <button 
                key={f} 
                onClick={() => applyQuickFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  query.toLowerCase() === f.toLowerCase() 
                    ? 'bg-green-600 border-green-500 text-white' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 2. COURSES GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-green-400 animate-pulse text-xl">Loading courses...</div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search terms or check back later!</p>
            <button 
              onClick={() => { setSearchInput(''); router.replace('/explore'); }}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {query ? `Results for "${query}"` : 'All Available Courses'}
              </h2>
              <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link 
                  key={course.id} 
                  href={`/courses/${course.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 flex flex-col"
                >
                  {/* 🎯 Premium Language Gradient Header */}
                  <div className={`h-24 bg-gradient-to-br ${getLanguageGradient(course.language)} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-4xl font-bold text-white/20 uppercase tracking-widest">
                      {course.language}
                    </span>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <span className="px-2.5 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {course.category || 'General'}
                      </span>
                      {course.difficulty && (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          course.difficulty === 'easy' || course.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                          course.difficulty === 'medium' || course.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' :
                          'bg-red-900/30 text-red-400 border-red-500/30'
                        }`}>
                          {course.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                      {course.description || 'No description available.'}
                    </p>
                    
                    <div className="flex items-center text-green-400 font-bold text-sm group-hover:translate-x-1 transition-transform pt-4 border-t border-gray-800">
                      Start Learning 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 🎯 3. LEADERBOARD ENGAGEMENT BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <Link href="/leaderboard" className="block relative rounded-2xl overflow-hidden border border-gray-800 group hover:border-green-500/50 transition-all shadow-2xl">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/leaderboard.jpg" 
              alt="Leaderboard" 
              fill 
              className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to test your skills?</h3>
              <p className="text-gray-300 max-w-lg">Compete with others on the global leaderboard, complete challenges, and earn exclusive badges.</p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 group-hover:bg-green-500 rounded-xl font-bold text-lg whitespace-nowrap transition shadow-lg shadow-green-900/20">
                View Leaderboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

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