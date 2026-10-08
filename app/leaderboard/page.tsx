'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface User {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  challenges_solved: number;
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        setTopUsers(data.topUsers || []);
        setCurrentUserRank(data.currentUserRank);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 🎨 Never-ending Animation Styles
  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.2); }
      50% { box-shadow: 0 0 40px rgba(74, 222, 128, 0.4); }
    }
    @keyframes pulse-glow-gold {
      0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.2); }
      50% { box-shadow: 0 0 40px rgba(250, 204, 21, 0.5); }
    }
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
    .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
    .animate-pulse-glow-gold { animation: pulse-glow-gold 3s ease-in-out infinite; }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    .animate-shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      background-size: 200% 100%;
      animation: shimmer 3s infinite;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }
  `;

  if (loading) {
    return (
      <>
        <style>{animationStyles}</style>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
            <div className="text-yellow-400 font-mono text-sm animate-pulse">Calculating global ranks...</div>
          </div>
        </div>
      </>
    );
  }

  const top3 = topUsers.slice(0, 3);
  const rest = topUsers.slice(3);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/50 shadow-yellow-500/20';
    if (rank === 2) return 'from-gray-300/20 to-gray-500/20 border-gray-300/50 shadow-gray-400/20';
    if (rank === 3) return 'from-orange-400/20 to-orange-600/20 border-orange-400/50 shadow-orange-500/20';
    return 'from-gray-700/20 to-gray-800/20 border-gray-700/50';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <>
      <style>{animationStyles}</style>
      <main className="min-h-screen bg-black text-white pb-20 relative overflow-hidden">
        {/* 🌌 Animated Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          
          {/* 🖼️ Hero Section with Leaderboard Image */}
          <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in-up group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('/images/leaderboard.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold mb-4 backdrop-blur-md animate-pulse-glow-gold">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                LIVE RANKINGS
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold mb-3 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500">
                  Global Leaderboard
                </span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base max-w-lg">
                Compete with the best developers in the world. Solve challenges, earn points, and claim your spot at the top.
              </p>
            </div>
          </div>
        
          {/* 🎯 Current User Rank (Sticky if scrolled) */}
          {user && currentUserRank && (
            <div className="sticky top-20 z-40 bg-gray-900/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 shadow-2xl shadow-green-900/20 animate-fade-in-up delay-100 group hover:border-green-400/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600/20 border border-green-500 flex items-center justify-center font-bold text-green-400 text-lg group-hover:scale-110 transition-transform duration-300">
                    #{currentUserRank.rank}
                  </div>
                  <div>
                    <p className="font-bold text-white">Your Rank</p>
                    <p className="text-sm text-gray-400">{user.fullName || user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{currentUserRank.total_points.toLocaleString()} pts</p>
                  <p className="text-xs text-gray-500">Keep coding to climb higher!</p>
                </div>
              </div>
            </div>
          )}

          {/* 🎯 Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end animate-fade-in-up delay-200">
              {/* 2nd Place */}
              {top3[1] && (
                <div className={`relative bg-gradient-to-br ${getRankStyle(2)} border rounded-2xl p-6 text-center order-2 md:order-1 transform md:translate-y-4 hover:-translate-y-6 transition-all duration-500 group`}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl animate-float-delayed">{getRankIcon(2)}</div>
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full border-4 border-gray-400 overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-gray-400/30 transition-shadow duration-500">
                    <Image 
                      src={top3[1].avatar_url || '/default-avatar.png'} 
                      alt={String(top3[1].display_name || top3[1].username || 'User avatar')} 
                      width={96} 
                      height={96} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl text-white truncate">{top3[1].display_name || top3[1].username}</h3>
                  <p className="text-gray-300 text-sm mb-2">@{top3[1].username}</p>
                  <p className="text-2xl font-extrabold text-gray-200">{top3[1].total_points.toLocaleString()} pts</p>
                  <p className="text-xs text-gray-400 mt-1">{top3[1].challenges_solved} solved</p>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className={`relative bg-gradient-to-br ${getRankStyle(1)} border rounded-2xl p-8 text-center order-1 md:order-2 transform md:-translate-y-4 shadow-2xl hover:-translate-y-6 transition-all duration-500 group animate-pulse-glow-gold`}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl animate-bounce">{getRankIcon(1)}</div>
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full border-4 border-yellow-400 overflow-hidden bg-gray-800 ring-4 ring-yellow-400/20 shadow-xl group-hover:shadow-yellow-400/40 transition-shadow duration-500">
                    <Image 
                      src={top3[0].avatar_url || '/default-avatar.png'} 
                      alt={String(top3[0].display_name || top3[0].username || 'User avatar')} 
                      width={128} 
                      height={128} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-2xl text-white truncate">{top3[0].display_name || top3[0].username}</h3>
                  <p className="text-yellow-400 text-sm mb-2">@{top3[0].username}</p>
                  <p className="text-3xl font-extrabold text-yellow-300">{top3[0].total_points.toLocaleString()} pts</p>
                  <p className="text-sm text-yellow-200/70 mt-1">{top3[0].challenges_solved} solved</p>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className={`relative bg-gradient-to-br ${getRankStyle(3)} border rounded-2xl p-6 text-center order-3 md:translate-y-8 hover:translate-y-6 transition-all duration-500 group`}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl animate-float">{getRankIcon(3)}</div>
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full border-4 border-orange-400 overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-orange-400/30 transition-shadow duration-500">
                    <Image 
                      src={top3[2].avatar_url || '/default-avatar.png'} 
                      alt={String(top3[2].display_name || top3[2].username || 'User avatar')} 
                      width={96} 
                      height={96} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl text-white truncate">{top3[2].display_name || top3[2].username}</h3>
                  <p className="text-gray-300 text-sm mb-2">@{top3[2].username}</p>
                  <p className="text-2xl font-extrabold text-orange-300">{top3[2].total_points.toLocaleString()} pts</p>
                  <p className="text-xs text-gray-400 mt-1">{top3[2].challenges_solved} solved</p>
                </div>
              )}
            </div>
          )}

          {/* 🎯 Rest of the Leaderboard */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden animate-fade-in-up delay-300">
            <div className="grid grid-cols-12 gap-4 p-5 bg-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-700">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-6 md:col-span-7">Developer</div>
              <div className="col-span-2 text-center">Solved</div>
              <div className="col-span-3 text-right">Points</div>
            </div>

            <div className="divide-y divide-gray-800">
              {rest.length === 0 && top3.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-4xl mb-4 animate-float">🏜️</p>
                  <p>No rankings yet. Be the first to solve a challenge!</p>
                </div>
              ) : (
                rest.map((u, index) => {
                  const rank = index + 4;
                  const isCurrentUser = user?.id === u.user_id;
                  
                  return (
                    <div 
                      key={u.user_id} 
                      className={`grid grid-cols-12 gap-4 p-4 items-center transition-all duration-300 group ${
                        isCurrentUser 
                          ? 'bg-green-900/10 border-l-4 border-green-500 hover:bg-green-900/20' 
                          : 'hover:bg-gray-800/40 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="col-span-1 text-center font-bold text-gray-400 group-hover:text-white transition-colors">
                        {rank}
                      </div>
                      <div className="col-span-6 md:col-span-7 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 group-hover:border-gray-500 transition-colors">
                          <Image 
                            src={u.avatar_url || '/default-avatar.png'} 
                            alt={String(u.display_name || u.username || 'User avatar')} 
                            width={40} 
                            height={40} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold truncate transition-colors ${isCurrentUser ? 'text-green-400' : 'text-white group-hover:text-green-300'}`}>
                            {u.display_name || u.username} {isCurrentUser && '(You)'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-center text-gray-300 font-medium">
                        {u.challenges_solved}
                      </div>
                      <div className="col-span-3 text-right font-bold text-green-400 group-hover:text-green-300 transition-colors">
                        {u.total_points.toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}