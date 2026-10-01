'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function AdminCoursesPage() {
  const { user, isLoaded } = useUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      fetchCourses();
    }
  }, [isLoaded]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading courses...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">📚 Manage Courses</h1>
            <p className="text-gray-400">Create, edit, and organize your course content.</p>
          </div>
          <Link 
            href="/admin/courses/new" 
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center gap-2"
          >
            ➕ Create New Course
          </Link>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800 border-dashed">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No courses yet</h2>
            <p className="text-gray-400 mb-6">Create your first course to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all group flex flex-col">
                
                {/* Course Info */}
                <div className="flex-1 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {course.category && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded text-xs font-medium">
                        {course.category}
                      </span>
                    )}
                    {course.difficulty && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-medium">
                        {course.difficulty}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                    {course.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👥 {course.enrollment_count || 0} enrolled</span>
                    <span>⭐ {course.average_rating || '0.0'} ({course.review_count || 0} reviews)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <Link 
                    href={`/courses/${course.id}`} 
                    target="_blank"
                    className="flex-1 text-center py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold text-sm transition"
                  >
                    👁️ View
                  </Link>
                  
                  {/* 🎯 THIS IS THE CORRECT EDIT LINK 🎯 */}
                  <Link 
                    href={`/admin/courses/${course.id}/edit`} 
                    className="flex-1 text-center py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    ✏️ Edit Content
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}