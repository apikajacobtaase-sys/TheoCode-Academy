'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (username) {
      fetch(`/api/profiles/${username}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setData(d);
            setForm(d.profile);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setEditing(false);
        window.location.href = `/profile/${d.username}`;
      } else {
        alert(d.error || 'Failed to save');
      }
    } catch {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <Link href="/challenges" className="text-green-400 hover:underline">← Back to challenges</Link>
      </div>
    );
  }

  const { profile, stats, squads, recentActivity, isOwner } = data;

  const avatarUrl = profile.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || profile.username)}&background=10b981&color=fff&size=200&bold=true`;

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* 🎯 COVER + HEADER */}
      <div className="relative h-64 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {isOwner && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-bold transition"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* 🎯 AVATAR + BASIC INFO */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
          <img 
            src={avatarUrl} 
            alt={profile.display_name}
            className="w-32 h-32 rounded-2xl border-4 border-black shadow-2xl object-cover bg-gray-800"
          />
          <div className="flex-1 pb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-green-400 font-mono text-sm mt-1">@{profile.username}</p>
            {profile.bio && <p className="text-gray-300 mt-3 max-w-2xl">{profile.bio}</p>}
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener" className="hover:text-green-400 transition">
                  🔗 {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener" className="hover:text-green-400 transition">
                  💻 GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 🎯 STATS CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/30 rounded-2xl p-6">
            <p className="text-xs text-purple-300 uppercase tracking-wider font-bold">Global Rank</p>
            <p className="text-4xl font-extrabold text-white mt-2">#{stats.globalRank}</p>
            <p className="text-xs text-gray-400 mt-1">Among all coders</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-900/10 border border-green-500/30 rounded-2xl p-6">
            <p className="text-xs text-green-300 uppercase tracking-wider font-bold">Total Points</p>
            <p className="text-4xl font-extrabold text-white mt-2">{stats.totalPoints}</p>
            <p className="text-xs text-gray-400 mt-1">Earned from challenges</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/10 border border-orange-500/30 rounded-2xl p-6">
            <p className="text-xs text-orange-300 uppercase tracking-wider font-bold">Challenges Solved</p>
            <p className="text-4xl font-extrabold text-white mt-2">{stats.challengesSolved}</p>
            <p className="text-xs text-gray-400 mt-1">Problems conquered</p>
          </div>
        </div>

        {/* 🎯 SQUADS + ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Squads */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🏰</span> Squads ({squads.length})
            </h3>
            {squads.length === 0 ? (
              <p className="text-gray-500 text-sm">Not in any squads yet.</p>
            ) : (
              <div className="space-y-3">
                {squads.map((s: any) => (
                  <Link 
                    key={s.id} 
                    href={`/squad/${s.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{s.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>⚡</span> Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No challenges solved yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      a.difficulty === 'easy' ? 'bg-green-400' : 
                      a.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.solved_at).toLocaleDateString()} • +{a.points} pts
                      </p>
                    </div>
                    <span className="text-green-400">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={form.username || ''}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="your_username"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  value={form.display_name || ''}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                <textarea
                  value={form.bio || ''}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  maxLength={200}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={form.location || ''}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avatar URL</label>
                  <input
                    type="url"
                    value={form.avatar_url || ''}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Website</label>
                <input
                  type="url"
                  value={form.website || ''}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="https://your-site.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">GitHub URL</label>
                <input
                  type="url"
                  value={form.github_url || ''}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-bold transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}