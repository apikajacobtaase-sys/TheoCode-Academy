'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

type Difficulty = 'easy' | 'medium' | 'hard';
type Status = 'not_started' | 'in_progress' | 'solved';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  points: number;
  language: string;
  user_status: Status;
  solved_at: string | null;
}

export default function ChallengesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState({ totalChallenges: 0, solved: 0, inProgress: 0, totalPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Difficulty>('all');

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/challenges')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setChallenges(data.challenges);
            setStats(data.stats);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch challenges:', err);
          setLoading(false);
        });
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl font-bold">Loading challenges...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Sign in to tackle challenges</h2>
        <Link href="/sign-in" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">
          Sign In
        </Link>
      </div>
    );
  }

  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.difficulty === filter);

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'solved': return '🟢';
      case 'in_progress': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* 🎯 1. HERO & STATS */}
      <div className="relative overflow-hidden border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Coding Challenges
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-8">
            Sharpen your skills, earn points, and climb the squad leaderboard.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Total Points</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">{stats.totalPoints}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Solved</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats.solved}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">In Progress</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Available</p>
              <p className="text-3xl font-bold text-gray-300 mt-1">{stats.totalChallenges}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* 🎯 2. FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(['all', 'easy', 'medium', 'hard'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                filter === f 
                  ? 'bg-white text-black shadow-lg shadow-white/10' 
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'
              }`}
            >
              {f === 'all' ? 'All Challenges' : f}
            </button>
          ))}
        </div>

        {/* 🎯 3. CHALLENGES GRID */}
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
            <p className="text-gray-400 text-lg">No challenges found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded-md text-xs font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty.toUpperCase()}
                  </div>
                  <div className="text-2xl" title={challenge.user_status}>
                    {getStatusIcon(challenge.user_status)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                  {challenge.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-800 rounded">{challenge.language}</span>
                    <span className="px-2 py-1 bg-gray-800 rounded">{challenge.category}</span>
                  </div>
                  <div className="text-purple-400 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {challenge.points} pts
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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