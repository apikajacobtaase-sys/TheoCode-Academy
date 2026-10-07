'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/Toast';

export default function AdminCoursesPage() {
  const { isLoaded, user } = useUser();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/courses')
        .then(r => r.json())
        .then(data => {
          setCourses(data.courses || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also delete all its lessons.`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses(courses.filter(c => c.id !== id));
        showToast('success', '🗑️ Course deleted', 3000);
      } else {
        showToast('error', 'Failed to delete course', 3000);
      }
    } catch {
      showToast('error', 'Network error', 3000);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading courses...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📚 Manage Courses</h1>
            <p className="text-gray-400 mt-1">{courses.length} total courses</p>
          </div>
          <Link href="/admin/courses/new" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition">
            ➕ Create Course
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-400">No courses yet</p>
            <Link href="/admin/courses/new" className="text-green-400 hover:underline mt-2 inline-block">
              Create your first course →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div key={c.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition">
                <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600 relative">
                  {c.image_url && <img src={c.image_url} alt={c.title} className="w-full h-full object-cover opacity-80" />}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      c.is_published ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {c.is_published ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span>📖 {c.total_lessons} lessons</span>
                    <span>⏱️ {c.duration_hours}h</span>
                    <span className={`px-2 py-0.5 rounded ${
                      c.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      c.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {c.difficulty}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/${c.id}/edit`} className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(c.id, c.title)} className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold transition">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}