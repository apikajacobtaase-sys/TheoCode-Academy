'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useIsAdmin } from '@/lib/useIsAdmin';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { isAdmin } = useIsAdmin();
  
  // Learner Stats State
  const [learnerStats, setLearnerStats] = useState({
    coursesCompleted: 0,
    challengesSolved: 0,
    currentRank: 'Novice',
    nextRankProgress: 0
  });
  
  // Platform Stats State (for Admins)
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalSquads: 0,
    totalMessages: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          // Fetch platform stats for admins
          const [usersRes, coursesRes, squadsRes] = await Promise.all([
            fetch('/api/admin/stats/users'),
            fetch('/api/admin/stats/courses'),
            fetch('/api/admin/stats/squads')
          ]);
          
          const usersData = usersRes.ok ? await usersRes.json() : { count: 0 };
          const coursesData = coursesRes.ok ? await coursesRes.json() : { count: 0 };
          const squadsData = squadsRes.ok ? await squadsRes.json() : { count: 0, messages: 0 };

          setPlatformStats({
            totalUsers: usersData.count || 0,
            totalCourses: coursesData.count || 0,
            totalSquads: squadsData.count || 0,
            totalMessages: squadsData.messages || 0
          });
        } else {
          // Fetch learner stats (simulated for now, replace with real API later)
          setLearnerStats({
            coursesCompleted: 2,
            challengesSolved: 15,
            currentRank: 'Engineer',
            nextRankProgress: 35
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded, isAdmin]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // ==========================================
  // 🛡️ ADMIN DASHBOARD VIEW
  // ==========================================
  if (isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-6xl">
          
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
              👑 Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Welcome back, {user?.firstName || 'Administrator'}. Manage and monitor TheCode Academy platform.
            </p>
          </div>

          {/* Platform Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-1">Total Users</div>
              <div className="text-3xl font-bold text-green-400">{platformStats.totalUsers.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-1">Active Courses</div>
              <div className="text-3xl font-bold text-blue-400">{platformStats.totalCourses.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-1">Total Squads</div>
              <div className="text-3xl font-bold text-purple-400">{platformStats.totalSquads.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-1">Squad Messages</div>
              <div className="text-3xl font-bold text-orange-400">{platformStats.totalMessages.toLocaleString()}</div>
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              ⚡ Administrative Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users" className="p-4 bg-black border border-gray-800 hover:border-green-500/50 rounded-xl transition group">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-bold text-white group-hover:text-green-400 transition">Manage Users</div>
                <div className="text-xs text-gray-400 mt-1">View, edit, or ban accounts</div>
              </Link>
              
              <Link href="/admin/courses" className="p-4 bg-black border border-gray-800 hover:border-green-500/50 rounded-xl transition group">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-bold text-white group-hover:text-green-400 transition">Manage Courses</div>
                <div className="text-xs text-gray-400 mt-1">Add or update curriculum</div>
              </Link>
              
              <Link href="/admin/broadcast" className="p-4 bg-black border border-gray-800 hover:border-green-500/50 rounded-xl transition group">
                <div className="text-2xl mb-2">📢</div>
                <div className="font-bold text-white group-hover:text-green-400 transition">Broadcast</div>
                <div className="text-xs text-gray-400 mt-1">Send announcements to users</div>
              </Link>
              
              <Link href="/admin/squads" className="p-4 bg-black border border-gray-800 hover:border-green-500/50 rounded-xl transition group">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="font-bold text-white group-hover:text-green-400 transition">Moderate Squads</div>
                <div className="text-xs text-gray-400 mt-1">View or delete community squads</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 🎓 LEARNER DASHBOARD VIEW
  // ==========================================
  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Developer'} 👋
          </h1>
          <p className="text-gray-400">
            Track your progress, manage your squads, and climb the ranks.
          </p>
        </div>

        {/* Learner Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-1">Current Rank</div>
            <div className="text-2xl font-bold text-white mb-2">{learnerStats.currentRank}</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${learnerStats.nextRankProgress}%` }}
              />
            </div>
            <div className="text-xs text-green-400 mt-2">{learnerStats.nextRankProgress}% to next rank</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-1">Courses Completed</div>
            <div className="text-3xl font-bold text-white">{learnerStats.coursesCompleted}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-1">Challenges Solved</div>
            <div className="text-3xl font-bold text-white">{learnerStats.challengesSolved}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-center">
            <Link 
              href="/my-certificates" 
              className="text-green-400 hover:text-green-300 font-bold flex items-center gap-2 transition"
            >
              🎓 View My Certificates →
            </Link>
          </div>
        </div>

        {/* Learner Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center text-2xl">
                🛡️
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">My Squads</h2>
                <p className="text-sm text-gray-400">Collaborate and compete with your team.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link href="/squad" className="flex-1 text-center py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
                Manage Squads
              </Link>
              <Link href="/squad/create" className="flex-1 text-center py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg font-bold transition">
                Create New Squad
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Compete & Learn</h2>
                <p className="text-sm text-gray-400">Test your skills and see where you stand.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link href="/challenges" className="flex-1 text-center py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition">
                View Leaderboard
              </Link>
              <Link href="/explore" className="flex-1 text-center py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg font-bold transition">
                Explore Courses
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}