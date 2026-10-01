'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAdmin) fetchUsers();
    else router.push('/');
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    setLoading(false);
  };

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    if (!confirm(`${currentIsAdmin ? 'Remove admin' : 'Make admin'} this user?`)) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, makeAdmin: !currentIsAdmin })
      });
      if (res.ok) {
        setMessage(`✅ User ${currentIsAdmin ? 'demoted' : 'promoted'}!`);
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Failed to update user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <Link href="/admin" className="text-purple-400 hover:text-purple-300 text-sm mb-2 block">← Back to Admin</Link>
            <h1 className="text-3xl sm:text-4xl font-bold">👥 User Management</h1>
            <p className="text-gray-400 mt-2">{users.length} total users • {users.filter(u => u.is_admin).length} admins</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-bold ${
            message.includes('✅') ? 'bg-green-900/30 text-green-400 border border-green-500' : 'bg-red-900/30 text-red-400 border border-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by name or email..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Admins</p>
            <p className="text-3xl font-bold text-purple-400">{users.filter(u => u.is_admin).length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Total Lessons</p>
            <p className="text-3xl font-bold text-green-400">{users.reduce((sum, u) => sum + (u.lessons_completed || 0), 0)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Avg Score</p>
            <p className="text-3xl font-bold text-yellow-400">
              {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.average_score || 0), 0) / users.length) : 0}%
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left p-4 text-sm font-bold text-gray-400">User</th>
                  <th className="text-center p-4 text-sm font-bold text-gray-400 hidden sm:table-cell">Lessons</th>
                  <th className="text-center p-4 text-sm font-bold text-gray-400 hidden md:table-cell">Modules</th>
                  <th className="text-center p-4 text-sm font-bold text-gray-400">Avg Score</th>
                  <th className="text-center p-4 text-sm font-bold text-gray-400">Role</th>
                  <th className="text-center p-4 text-sm font-bold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-700/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-900/50 rounded-full flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.full_name?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell">
                      <span className="text-sm font-bold">{user.lessons_completed || 0}</span>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span className="text-sm font-bold">{user.modules_completed || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm font-bold ${
                        user.average_score >= 80 ? 'text-green-400' :
                        user.average_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {user.average_score || 0}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {user.is_admin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs font-bold">
                          👑 Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-400 rounded-full text-xs">
                          🎓 Student
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleAdmin(user.user_id, user.is_admin)}
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          user.is_admin 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {user.is_admin ? 'Demote' : 'Promote'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              {search ? 'No users match your search' : 'No users yet'}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}