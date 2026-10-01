'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function ChallengesPage() {
  const { user, isLoaded } = useUser();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchChallenges();
}, []);

const fetchChallenges = async () => {
  try {
    const res = await fetch('/api/challenges');
    if (res.ok) {
      const data = await res.json();
      setChallenges(data.challenges || []);
    } else {
      console.error('Failed to fetch challenges');
      setChallenges([]);
    }
  } catch (error) {
    console.error('Failed to fetch challenges:', error);
    setChallenges([]);
  } finally {
    setLoading(false);
  }
};

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-600/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.difficulty.toLowerCase() === filter);
   if (loading) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-green-400 animate-pulse text-xl">Loading challenges...</div>
    </div>
  );
}

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header & Stats */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            💻 Coding Challenges
          </h1>
          <p className="text-gray-400 mb-6">
            Sharpen your problem-solving skills and climb the global leaderboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center text-2xl">✅</div>
              <div>
                <p className="text-gray-400 text-sm">Total Solved</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-2xl">🔥</div>
              <div>
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-white">5 Days</p>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center text-2xl">🏆</div>
              <div>
                <p className="text-gray-400 text-sm">Global Rank</p>
                <p className="text-2xl font-bold text-white">#142</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'easy', 'medium', 'hard'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-lg font-bold text-sm capitalize transition ${
                filter === f
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Challenges List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2 text-center">Difficulty</div>
            <div className="col-span-2 text-center">Category</div>
            <div className="col-span-2 text-center">Success Rate</div>
          </div>

          {/* Rows */}
                {/* Rows */}
          <div className="divide-y divide-gray-800">
            {filteredChallenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:p-5 hover:bg-gray-800/50 transition group items-center"
              >
                {/* Status */}
                <div className="col-span-1 flex sm:justify-center">
                  {challenge.completed ? (
                    <span className="text-green-400 text-xl" title="Completed">✅</span>
                  ) : (
                    <span className="text-gray-600 text-xl" title="Not Started">⬜</span>
                  )}
                </div>

                {/* Title */}
                <div className="col-span-5">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-green-400 transition mb-1 sm:mb-0">
                    {challenge.title}
                  </h3>
                  <span className="sm:hidden text-xs text-gray-500">
                    {challenge.category} • {challenge.solves?.toLocaleString() || 0} solves
                  </span>
                </div>

                {/* Difficulty */}
                <div className="col-span-2 flex sm:justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>

                {/* Category */}
                <div className="col-span-2 hidden sm:flex justify-center">
                  <span className="px-3 py-1 bg-black text-gray-300 rounded-full text-xs font-medium border border-gray-700">
                    {challenge.category || 'General'}
                  </span>
                </div>

                {/* Success Rate / Action */}
                <div className="col-span-2 flex sm:justify-center items-center gap-3">
                  <span className="hidden sm:block text-sm text-gray-400 font-medium">
                    {challenge.successRate || '—'}
                  </span>
                  <span className="sm:hidden text-green-400 font-bold text-sm">Start →</span>
                </div>
              </Link>
            ))}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p>No challenges found for this difficulty.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}