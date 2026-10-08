'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

export default function MyLearningPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/my-learning')
        .then(r => r.json())
        .then(data => {
          setEnrollments(data.enrollments || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-black flex items-center justify-center">
        <div className="text-green-500 dark:text-green-400 animate-pulse font-medium">Loading your learning journey...</div>
      </div>
    );
  }

  const completedCount = enrollments.filter((e) => e.progress_percentage === 100).length;
  const inProgressCount = enrollments.length - completedCount;

  // 🎯 Fallback images for course cards
  const fallbackImages = [
    '/images/my-learning1.jpg',
    '/images/my-learning2.jpg',
    '/images/my-learning3.jpg'
  ];

  return (
    <main className="min-h-screen bg-[#f0f2f5] dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* 🎯 Professional Hero Section */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <Image
          src="/images/my-learning1.jpg"
          alt="My Learning Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || 'Learner'} 👋
            </h1>
            <p className="text-gray-300 text-lg max-w-xl">
              Pick up right where you left off and continue your journey to mastery.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 -mt-12 relative z-10">
        
        {/* 🎯 Quick Stats Cards (Clean, professional style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Enrolled</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{enrollments.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{completedCount}</p>
          </div>
        </div>

        {/* 🎯 Course List */}
        {enrollments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-4">
              📚
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No courses yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Start exploring to build your skills!
            </p>
            <Link 
              href="/courses" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg font-bold transition shadow-md"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📖 Your Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((e, index) => {
                // Cycle through the 3 beautiful images if the course has no image_url
                const courseImage = e.image_url || fallbackImages[index % fallbackImages.length];
                const isCompleted = e.progress_percentage === 100;

                return (
                  <Link 
                    key={e.course_id} 
                    href={`/courses/${e.course_id}`} 
                    className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-green-500/50 transition-all duration-300"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={courseImage}
                        alt={e.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {isCompleted && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                          ✓ Completed
                        </div>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-green-400 transition-colors">
                        {e.title}
                      </h3>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          <span>{isCompleted ? 'Completed' : 'In Progress'}</span>
                          <span>{e.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500 dark:bg-green-500'
                            }`} 
                            style={{ width: `${e.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Enrolled {new Date(e.enrolled_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-green-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          {isCompleted ? 'Review' : 'Continue'} →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}