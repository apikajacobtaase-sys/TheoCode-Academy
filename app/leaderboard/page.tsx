'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-gray-400 font-bold text-lg">#{rank}</span>;
  };

  const getRankRowClass = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-900/20 to-transparent border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-700/20 to-transparent border-gray-500/30';
    if (rank === 3) return 'bg-gradient-to-r from-orange-900/20 to-transparent border-orange-500/30';
    return 'border-gray-800 hover:bg-gray-800/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            🏆 Global Leaderboard
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The top developers on TheoCode Academy, ranked by courses completed and challenges solved.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider bg-gray-950/50">
            <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
            <div className="col-span-6 sm:col-span-5">User</div>
            <div className="col-span-2 text-center hidden sm:block">Courses</div>
            <div className="col-span-2 text-center hidden sm:block">Challenges</div>
            <div className="col-span-4 sm:col-span-3 text-center">Total XP</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-800">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">🏆</div>
                <p>No rankings available yet. Be the first to earn XP!</p>
              </div>
            ) : (
              leaderboard.map((user, index) => {
                const rank = index + 1;
                return (
                  <div 
                    key={user.id} 
                    className={`grid grid-cols-12 gap-4 p-4 sm:p-5 items-center transition border-l-4 ${getRankRowClass(rank)}`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      {getRankBadge(rank)}
                    </div>

                    {/* User */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
                        {/* Replace the Next.js Image component with a standard img tag */}
<div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
  <img 
    src={user.image} 
    alt={user.name} 
    className="w-full h-full object-cover"
  />
</div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 sm:hidden">
                          {user.courses} Courses • {user.challenges} Challenges
                        </p>
                      </div>
                    </div>

                    {/* Courses (Desktop) */}
                    <div className="col-span-2 text-center hidden sm:block">
                      <span className="px-3 py-1 bg-green-900/20 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                        {user.courses}
                      </span>
                    </div>

                    {/* Challenges (Desktop) */}
                    <div className="col-span-2 text-center hidden sm:block">
                      <span className="px-3 py-1 bg-purple-900/20 text-purple-400 rounded-full text-sm font-medium border border-purple-500/20">
                        {user.challenges}
                      </span>
                    </div>

                    {/* Total XP */}
                    <div className="col-span-4 sm:col-span-3 text-center">
                      <span className="text-lg font-bold text-yellow-400">
                        {user.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </main>
  );
}