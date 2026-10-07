'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/Toast';

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.publicMetadata?.role === 'admin';

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor: 'TheCode Academy',
    image_url: '',
    difficulty: 'beginner',
    category: 'Programming',
    language: 'C++',
    duration_hours: 0,
    is_published: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('error', 'Title is required', 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', '✅ Course created! Now add lessons.', 4000);
        router.push(`/admin/courses/${data.id}/edit`);
      } else {
        showToast('error', '❌ ' + (data.error || 'Failed to create'), 4000);
      }
    } catch {
      showToast('error', 'Network error', 4000);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="text-gray-400 hover:text-white">←</Link>
            <h1 className="text-2xl font-bold">📚 Create New Course</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">📝 Course Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="e.g., Mastering C++ Data Structures"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none resize-none"
                  placeholder="What will students learn in this course?"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Instructor</label>
                  <input
                    type="text"
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option>C++</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>JavaScript</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Duration (hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.duration_hours}
                    onChange={(e) => setForm({ ...form, duration_hours: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Cover Image URL</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-5 h-5 accent-green-500"
                />
                <label htmlFor="published" className="text-white font-bold cursor-pointer">
                  🚀 Publish immediately (students can see this course)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/admin/courses" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-bold transition shadow-lg shadow-green-600/20"
            >
              {loading ? 'Creating...' : '✓ Create Course'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}