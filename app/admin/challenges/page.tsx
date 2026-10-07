'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function AdminChallengesPage() {
  const { isLoaded, user } = useUser();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/challenges')
        .then(r => r.json())
        .then(data => {
          setChallenges(data.challenges || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/challenges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChallenges(challenges.filter(c => c.id !== id));
        alert('Challenge deleted successfully');
      } else {
        alert('Failed to delete challenge');
      }
    } catch {
      alert('Network error');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading challenges...</div>
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
            <h1 className="text-3xl font-bold">📝 Manage Challenges</h1>
            <p className="text-gray-400 mt-1">Edit, delete, or toggle challenges</p>
          </div>
          <Link
            href="/admin/challenges/new"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition"
          >
            ➕ Create New
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {challenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-400">No challenges yet</p>
            <Link href="/admin/challenges/new" className="text-green-400 hover:underline mt-2 inline-block">
              Create your first challenge →
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Difficulty</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Points</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {challenges.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.language}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        c.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {c.difficulty.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-purple-400 font-bold">{c.points}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/challenges/${c.id}/edit`}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm font-bold transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}