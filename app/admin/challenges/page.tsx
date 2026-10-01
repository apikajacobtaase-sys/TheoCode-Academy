'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/admin/challenges');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/challenges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChallenges(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Failed to delete challenge.');
      }
    } catch (error) {
      console.error('Failed to delete challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-400 animate-pulse text-xl">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Manage Challenges</h1>
          <p className="text-gray-400">Create, edit, and manage coding challenges and test cases</p>
        </div>
        <Link
          href="/admin/challenges/new"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition text-white"
        >
          + New Challenge
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-gray-400 uppercase">Title</th>
                <th className="text-left p-4 text-xs font-bold text-gray-400 uppercase">Difficulty</th>
                <th className="text-center p-4 text-xs font-bold text-gray-400 uppercase">Sample Tests</th>
                <th className="text-center p-4 text-xs font-bold text-gray-400 uppercase">Hidden Tests</th>
                <th className="text-right p-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{challenge.title}</div>
                    <div className="text-xs text-gray-500">{challenge.category || 'General'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      challenge.difficulty === 'easy' ? 'bg-green-600/20 text-green-400 border-green-500/30' :
                      challenge.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-600/20 text-red-400 border-red-500/30'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-blue-400 font-bold">{challenge.sample_count || 0}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-purple-400 font-bold">{challenge.hidden_count || 0}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/challenges/${challenge.id}/edit`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition text-white"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(challenge.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition text-white"
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

        {challenges.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📝</div>
            <p>No challenges yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}