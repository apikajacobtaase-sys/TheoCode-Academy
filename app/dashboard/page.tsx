'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useIsAdmin } from '@/lib/useIsAdmin';

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser(); // 🎯 Added isSignedIn here
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  
  // 🎯 Single source of truth for stats
  const [stats, setStats] = useState({
    challenges_solved: 0,
    courses_completed: 0,
    total_points: 0,
    current_rank: '🌱 Novice',
    next_rank: '🛡️ Engineer',
    progress_to_next: 0
  });
  
  const [statsLoading, setStatsLoading] = useState(true);

  // 🎯 Fetch real stats from the database
  // 🎯 Fetch real stats from the database safely
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetch('/api/dashboard/stats')
        .then(r => r.json())
        .then(data => {
          // 🎯 Only update state if the API returned valid stats (not an error)
          if (data.current_rank) {
            setStats(data);
          }
          setStatsLoading(false);
        })
        .catch(() => {
          console.error('Failed to fetch dashboard stats');
          setStatsLoading(false);
        });
    } else if (isLoaded && !isSignedIn) {
      setStatsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // 🎨 Never-ending Animation Styles
  // ... (keep your animation styles exactly as they were) ...

  // 🎯 Safe Helper to extract text and emoji (prevents undefined crashes)
  const safeRank = stats.current_rank || '🌱 Novice';
  // 🎨 Never-ending Animation Styles
  const animationStyles = `
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    @keyframes gradient-xy { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.15); } 50% { box-shadow: 0 0 35px rgba(74, 222, 128, 0.3); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
    .animate-gradient-xy { background-size: 200% 200%; animation: gradient-xy 8s ease infinite; }
    .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
    .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); background-size: 200% 100%; animation: shimmer 3s infinite; }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }
  `;

  if (!isLoaded || statsLoading) {
    return (
      <>
        <style>{animationStyles}</style>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
            <div className="text-green-400 font-mono text-sm animate-pulse">
              {isAdmin ? 'Redirecting to Admin Panel...' : 'Initializing your workspace...'}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Helper to extract just the text from the rank (e.g., "🌱 Novice" -> "Novice")
  const rankText = stats.current_rank.split(' ').slice(1).join(' ');
  const rankEmoji = stats.current_rank.split(' ')[0];

  return (
    <>
      <style>{animationStyles}</style>
      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* 🌌 Never-ending Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-green-900/15 via-black to-black" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 relative z-10">
          
          {/* 🖼️ Hero Section */}
          <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl animate-fade-in-up group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('/images/dashboard.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold mb-4 backdrop-blur-md animate-pulse-glow">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                SYSTEM ONLINE
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-3 leading-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">{user?.firstName || 'Developer'}</span> 👋
              </h1>
              <p className="text-gray-300 text-sm sm:text-base max-w-lg">
                Track your progress, collaborate with your squad, and continue your journey to mastery.
              </p>
            </div>
          </div>

          {/* 📊 Stats Grid - NOW USING REAL 'stats' DATA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Rank Card */}
            <div className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-500 animate-fade-in-up delay-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-gray-400 text-sm mb-1 font-medium">Current Rank</div>
                <div className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  {rankEmoji} {rankText}
                </div>
                <div className="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000 ease-out animate-shimmer" 
                    style={{ width: `${stats.progress_to_next}%` }} 
                  />
                </div>
                <div className="text-xs text-green-400 mt-2 font-mono">{stats.progress_to_next}% to {stats.next_rank}</div>
              </div>
            </div>

            {/* Courses Card */}
            <div className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-500 animate-fade-in-up delay-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-gray-400 text-sm mb-1 font-medium">Courses Completed</div>
                <div className="text-4xl font-bold text-white mb-1 animate-float">{stats.courses_completed}</div>
                <div className="text-xs text-blue-400 font-mono">Lifetime achievement</div>
              </div>
            </div>

            {/* Challenges Card */}
            <div className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-500 animate-fade-in-up delay-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-gray-400 text-sm mb-1 font-medium">Challenges Solved</div>
                <div className="text-4xl font-bold text-white mb-1 animate-float-delayed">{stats.challenges_solved}</div>
                <div className="text-xs text-purple-400 font-mono">Problems conquered</div>
              </div>
            </div>

            {/* Certificates Card */}
            <div className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-500 animate-fade-in-up delay-400 overflow-hidden flex flex-col justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <Link href="/my-certificates" className="flex flex-col items-start gap-3 group/link">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl group-hover/link:scale-110 transition-transform duration-300">
                    🎓
                  </div>
                  <div>
                    <div className="text-white font-bold group-hover/link:text-orange-400 transition-colors">View Certificates</div>
                    <div className="text-xs text-gray-400">Showcase your mastery</div>
                  </div>
                  <span className="text-orange-400 text-sm font-bold flex items-center gap-1 mt-2 group-hover/link:translate-x-1 transition-transform">
                    Explore <span className="text-lg">→</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* 🚀 Action Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Squads Section */}
            <div className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-green-500/40 transition-all duration-500 animate-fade-in-up delay-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform duration-500">
                    🛡️
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">My Squads</h2>
                    <p className="text-sm text-gray-400 mt-1">Collaborate, build, and compete with your team.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href="/squad" className="flex-1 text-center py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-green-900/30 hover:shadow-green-500/20 hover:-translate-y-1">
                    Manage Squads
                  </Link>
                  <Link href="/squad/create" className="flex-1 text-center py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1">
                    Create New Squad
                  </Link>
                </div>
              </div>
            </div>

            {/* Compete Section */}
            <div className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-purple-500/40 transition-all duration-500 animate-fade-in-up delay-400 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-900/20 group-hover:scale-110 transition-transform duration-500">
                    🏆
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Compete & Learn</h2>
                    <p className="text-sm text-gray-400 mt-1">Test your skills against the global leaderboard.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href="/leaderboard" className="flex-1 text-center py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-900/30 hover:shadow-purple-500/20 hover:-translate-y-1">
                    View Leaderboard
                  </Link>
                  <Link href="/explore" className="flex-1 text-center py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1">
                    Explore Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}