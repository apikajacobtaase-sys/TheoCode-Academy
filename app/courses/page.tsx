'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Courses() {
  const { user, isLoaded } = useUser();
  const [courses, setCourses] = useState<any[]>([]);
  
  // 🎯 FIX 1: Explicitly type the Set as Set<string>
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set<string>());
  const [loadingEnroll, setLoadingEnroll] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then(data => {
        setCourses(data.courses || []);
        setLoadingCourses(false);
      })
      .catch(error => {
        console.error('Courses fetch error:', error);
        setCourses([]);
        setLoadingCourses(false);
      });
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`/api/enrollments?userId=${user.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch enrollments');
          return res.json();
        })
        .then(data => {
          // 🎯 FIX 2: Explicitly type the new Set as Set<string>
          const ids = new Set<string>((data.enrollments || []).map((e: any) => String(e.course_id)));
          setEnrolledCourseIds(ids);
        })
        .catch(error => {
          console.error('Enrollments fetch error:', error);
        });
    }
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    setLoadingEnroll(courseId);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, courseId })
      });
      const data = await res.json();
      if (data.enrolled) {
        setEnrolledCourseIds(new Set<string>([...enrolledCourseIds, courseId]));
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    }
    setLoadingEnroll(null);
  };

  if (!isLoaded) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Please sign in</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">📚 Available Courses</h1>

        {loadingCourses ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-12 text-center border border-gray-700">
            <p className="text-2xl text-gray-400 mb-4">No courses available yet</p>
            <p className="text-gray-500">Check back soon for new courses!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              return (
                <div key={course.id} className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden hover:border-purple-500/50 transition-all flex flex-col">
                  <div className="p-6 flex-1">
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs uppercase font-bold">
                      {course.language}
                    </span>
                    <h3 className="text-xl font-bold mt-4 mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">{course.description}</p>
                    
                    {/* 🎯 FIX 3: Clean JSX for module/lesson counts (no stray comments) */}
                    <div className="flex gap-4 text-sm text-gray-400 mb-4">
                      <span>📚 {course.module_count || 0} modules</span>
                      <span>📖 {course.lesson_count || 0} lessons</span>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    {isEnrolled ? (
                      <Link 
                        href={`/courses/${course.id}`} 
                        className="block w-full py-3 text-center bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg font-bold hover:bg-green-600/30 transition"
                      >
                        ✅ Continue Learning
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        disabled={loadingEnroll === course.id}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-bold transition"
                      >
                        {loadingEnroll === course.id ? 'Enrolling...' : 'Register for Course'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}