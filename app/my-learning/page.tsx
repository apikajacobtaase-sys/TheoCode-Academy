'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function MyLearningPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/my-learning').then(r => r.json()).then(data => {
        setEnrollments(data.enrollments || []);
        setLoading(false);
      });
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-400 animate-pulse">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">📚 My Learning</h1>
          <p className="text-gray-400 mt-1">Track your course progress</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {enrollments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-400 mb-4">You haven't enrolled in any courses yet</p>
            <Link href="/courses" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((e) => (
              <Link key={e.course_id} href={`/courses/${e.course_id}`} className="group">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition">
                  <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600"></div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-green-400 transition">{e.title}</h3>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{e.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${e.progress_percentage}%` }}></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}