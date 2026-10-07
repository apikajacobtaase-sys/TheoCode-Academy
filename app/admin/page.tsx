'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function AdminDashboard() {
  const { isLoaded, user } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/analytics').then(r => r.json())
      ]).then(([statsData, analyticsData]) => {
        setStats(statsData);
        setAnalytics(analyticsData);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isAdmin]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading admin dashboard...</div>
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">⚙️ Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform overview and analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/30 rounded-2xl p-6">
            <p className="text-xs text-blue-300 uppercase tracking-wider font-bold">Total Users</p>
            <p className="text-4xl font-extrabold text-white mt-2">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/30 rounded-2xl p-6">
            <p className="text-xs text-purple-300 uppercase tracking-wider font-bold">Admins</p>
            <p className="text-4xl font-extrabold text-white mt-2">{stats?.totalAdmins || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-900/10 border border-green-500/30 rounded-2xl p-6">
            <p className="text-xs text-green-300 uppercase tracking-wider font-bold">Total Challenges</p>
            <p className="text-4xl font-extrabold text-white mt-2">{stats?.totalChallenges || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/10 border border-orange-500/30 rounded-2xl p-6">
            <p className="text-xs text-orange-300 uppercase tracking-wider font-bold">Challenges Solved</p>
            <p className="text-4xl font-extrabold text-white mt-2">{stats?.totalSolved || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/courses" className="flex items-center gap-3 p-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition">
              <span className="text-2xl">📚</span>
              <div>
                <p className="font-bold">Manage Courses</p>
                <p className="text-sm text-indigo-100">Create courses & add modules</p>
              </div>
            </Link>
            <Link href="/admin/challenges/new" className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-500 rounded-xl transition">
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-bold">Create Challenge</p>
                <p className="text-sm text-green-100">Add a new coding challenge</p>
              </div>
            </Link>
            <Link href="/admin/challenges" className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-bold">Manage Challenges</p>
                <p className="text-sm text-blue-100">Edit or delete challenges</p>
              </div>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-500 rounded-xl transition">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-bold">Manage Users</p>
                <p className="text-sm text-purple-100">View and manage accounts</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <>
            {/* Completion Stats */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">📊 Course Completion Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{analytics.completionStats?.completed || 0}</p>
                  <p className="text-sm text-gray-400">Courses Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">{analytics.completionStats?.total_enrollments || 0}</p>
                  <p className="text-sm text-gray-400">Total Enrollments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">{analytics.completionStats?.avg_progress || 0}%</p>
                  <p className="text-sm text-gray-400">Average Progress</p>
                </div>
              </div>
            </div>

            {/* Popular Courses */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">🔥 Popular Courses</h2>
              <div className="space-y-3">
                {analytics.popularCourses?.slice(0, 5).map((c: any, i: number) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="font-medium text-white">{c.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{c.enrollments} enrollments</p>
                      <p className="text-xs text-gray-500">{c.avg_progress || 0}% avg progress</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Stats */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">📝 Quiz Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">{analytics.quizStats?.total_attempts || 0}</p>
                  <p className="text-sm text-gray-400">Total Quiz Attempts</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">{analytics.quizStats?.avg_score || 0}%</p>
                  <p className="text-sm text-gray-400">Average Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{analytics.quizStats?.highest_score || 0}%</p>
                  <p className="text-sm text-gray-400">Highest Score</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}