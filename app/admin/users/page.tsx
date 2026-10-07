'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function AdminUsersPage() {
  const { isLoaded, user } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAdmin = user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/users')
        .then(r => r.json())
        .then(data => {
          setUsers(data.users || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isAdmin]);

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading users...</div>
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
          <h1 className="text-3xl font-bold">👥 User Management</h1>
          <p className="text-gray-400 mt-1">{users.length} total users • {users.filter(u => u.is_admin).length} admins</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-xs text-blue-300 uppercase font-bold">Total Users</p>
            <p className="text-3xl font-extrabold text-white mt-1">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-xs text-purple-300 uppercase font-bold">Admins</p>
            <p className="text-3xl font-extrabold text-white mt-1">{users.filter(u => u.is_admin).length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-900/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-xs text-green-300 uppercase font-bold">Lessons</p>
            <p className="text-3xl font-extrabold text-white mt-1">0</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-xs text-orange-300 uppercase font-bold">Avg Score</p>
            <p className="text-3xl font-extrabold text-white mt-1">0%</p>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-xl text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">User</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Lessons</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Modules</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Avg Score</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Role</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white">
                          {(u.display_name || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.display_name || u.username}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{u.lessons_completed || 0}</td>
                    <td className="px-6 py-4 text-gray-400">{u.modules_completed || 0}</td>
                    <td className="px-6 py-4 text-gray-400">{u.avg_score || 0}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {u.is_admin ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}