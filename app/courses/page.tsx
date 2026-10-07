'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? courses : courses.filter(c => c.difficulty === filter);

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-b border-gray-800 px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            📚 Learn to Code
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Structured courses with hands-on lessons to take you from beginner to pro.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'beginner', 'intermediate', 'advanced'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-green-400 animate-pulse">Loading courses...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-400">No courses available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="group">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition h-full">
                  <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600 relative">
                    {c.image_url && <img src={c.image_url} alt={c.title} className="w-full h-full object-cover opacity-80" />}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.difficulty === 'beginner' ? 'bg-green-500 text-white' :
                        c.difficulty === 'intermediate' ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {c.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-green-400 transition">{c.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{c.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>📖 {c.total_lessons} lessons</span>
                      <span>⏱️ {c.duration_hours}h</span>
                      <span>👨‍🏫 {c.instructor}</span>
                    </div>
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