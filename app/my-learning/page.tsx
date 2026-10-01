'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import ProgressBar from '@/components/ProgressBar';

export default function MyLearningPage() {
  const { user, isLoaded } = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchEnrolledCourses();
    }
  }, [isLoaded, user]);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch('/api/my-learning');
      if (res.ok) {
        const data = await res.json();
        setEnrolledCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading your courses...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your learning</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">📖 My Learning</h1>
          <p className="text-gray-400">
            Track your progress and continue where you left off.
          </p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800 border-dashed">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No courses yet</h2>
            <p className="text-gray-400 mb-8">Start your learning journey by enrolling in a course!</p>
            <Link 
              href="/explore" 
              className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">
                  {course.title}
                </h3>
                
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="mb-4">
                  <ProgressBar 
                    progress={course.progress || 0} 
                    label={`${course.completed_lessons || 0} of ${course.total_lessons || 0} lessons`}
                    size="md"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Enrolled {new Date(course.enrolled_at).toLocaleDateString()}
                  </span>
                  
                  {course.progress === 100 ? (
                    <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                      ✅ Completed
                    </span>
                  ) : course.progress > 0 ? (
                    <span className="text-xs bg-green-600/20 text-green-400 px-3 py-1 rounded-full font-bold">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full font-bold">
                      Not Started
                    </span>
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