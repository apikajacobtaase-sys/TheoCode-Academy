'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface SquadRank {
  squad_id: string;
  squad_name: string;
  description: string;
  image_url: string | null;
  member_count: number;
  total_points: number;
}

export default function LeaderboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [leaderboard, setLeaderboard] = useState<SquadRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/squads/leaderboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLeaderboard(data.leaderboard);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch leaderboard:', err);
          setLoading(false);
        });
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl font-bold">Loading leaderboard...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Sign in to view the leaderboard</h2>
        <Link href="/sign-in" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">
          Sign In
        </Link>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    if (rank === 2) return 'text-gray-300 border-gray-300/30 bg-gray-300/10';
    if (rank === 3) return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
    return 'text-gray-400 border-gray-800 bg-gray-900/50';
  };

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* 🎯 HERO */}
      <div className="relative overflow-hidden border-b border-gray-800 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Squad Leaderboard
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The ultimate ranking of coding squads. Earn points by solving challenges to climb the ranks!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* 🎯 TOP 3 PODIUM (Optional visual flair, keeping it simple as a list for now) */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6">Squad</div>
            <div className="col-span-2 text-center">Members</div>
            <div className="col-span-3 text-right">Total Points</div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No squads have earned points yet. Be the first!
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {leaderboard.map((squad, index) => {
                const rank = index + 1;
                return (
                  <Link 
                    key={squad.squad_id} 
                    href={`/squad/${squad.squad_id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="col-span-1 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold border ${getRankColor(rank)}`}>
                        {getRankIcon(rank)}
                      </span>
                    </div>
                    
                    <div className="col-span-6 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {squad.squad_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate group-hover:text-green-400 transition-colors">
                          {squad.squad_name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{squad.description || 'No description'}</p>
                      </div>
                    </div>

                    <div className="col-span-2 text-center text-sm text-gray-400">
                      {squad.member_count}
                    </div>

                    <div className="col-span-3 text-right">
                      <span className="text-lg font-bold text-purple-400">
                        {squad.total_points.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}