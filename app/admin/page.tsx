'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalSquads: 0,
    totalMessages: 0,
    totalNotifications: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, coursesRes, squadsRes] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/courses'),
        fetch('/api/admin/stats/squads')
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : { count: 0, recent: [] };
      const coursesData = coursesRes.ok ? await coursesRes.json() : { count: 0 };
      const squadsData = squadsRes.ok ? await squadsRes.json() : { count: 0, messages: 0 };

      setStats({
        totalUsers: usersData.count || 0,
        totalCourses: coursesData.count || 0,
        totalSquads: squadsData.count || 0,
        totalMessages: squadsData.messages || 0,
        totalNotifications: 0,
        recentUsers: usersData.recent || []
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-green-400 animate-pulse text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-green-600 to-emerald-700', link: '/admin/users' },
    { label: 'Courses', value: stats.totalCourses, icon: '📚', color: 'from-blue-600 to-cyan-700', link: '/admin/courses' },
    { label: 'Squads', value: stats.totalSquads, icon: '🛡️', color: 'from-purple-600 to-pink-700', link: '/admin/squads' },
    { label: 'Messages', value: stats.totalMessages, icon: '💬', color: 'from-orange-600 to-red-700', link: '/admin/squads' },
  ];

  const quickActions = [
    { label: 'Create Course', icon: '➕', href: '/admin/courses/new', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Broadcast Message', icon: '📢', href: '/admin/broadcast', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Manage Users', icon: '👥', href: '/admin/users', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'View Squads', icon: '🛡️', href: '/admin/squads', color: 'bg-orange-600 hover:bg-orange-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Welcome back, {user?.firstName || 'Admin'} 👋
        </h1>
        <p className="text-gray-400">Here's what's happening on TheCode Academy today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all hover:shadow-xl hover:shadow-green-900/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
              <span className="text-green-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                View →
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} text-white rounded-xl p-4 text-center font-bold transition transform hover:scale-105 shadow-lg`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="text-sm">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              👥 Recent Users
            </h2>
            <Link href="/admin/users" className="text-green-400 hover:text-green-300 text-sm font-medium transition">
              View all →
            </Link>
          </div>
          
          {stats.recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👤</div>
              <p>No users yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-800">
                  <img
                    src={user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=16a34a&color=fff&size=200`}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.full_name || 'Unnamed User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.username || 'No username'}</p>
                  </div>
                  <div className="text-xs text-green-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Health */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🎯 Platform Health
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-xl">✅</div>
                <div>
                  <p className="text-white font-medium">Database</p>
                  <p className="text-xs text-gray-400">Neon PostgreSQL</p>
                </div>
              </div>
              <span className="text-green-400 font-bold text-sm">Online</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-xl">🔐</div>
                <div>
                  <p className="text-white font-medium">Authentication</p>
                  <p className="text-xs text-gray-400">Clerk</p>
                </div>
              </div>
              <span className="text-green-400 font-bold text-sm">Online</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-xl">🚀</div>
                <div>
                  <p className="text-white font-medium">Deployment</p>
                  <p className="text-xs text-gray-400">Vercel</p>
                </div>
              </div>
              <span className="text-green-400 font-bold text-sm">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-xl">🤖</div>
                <div>
                  <p className="text-white font-medium">AI Services</p>
                  <p className="text-xs text-gray-400">OpenAI</p>
                </div>
              </div>
              <span className="text-green-400 font-bold text-sm">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>TheCode Academy Admin Panel • Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}