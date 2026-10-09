'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // 🎯 Fetch profile data
  const fetchProfile = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/profiles/${username}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      const d = await res.json();
      
      console.log('🔍 FRONTEND RECEIVED:', d);
      
      if (d.success) {
        setData(d);
        setForm(d.profile);
      } else {
        setError(d.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
        fetchProfile(); // Refresh data
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
        <div className="text-green-400 animate-pulse text-xl font-bold">Loading profile...</div>
      </div>
    );
  }

  if (error || !data || !data.profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold mb-2">{error || 'User not found'}</h2>
        <Link href="/challenges" className="text-green-400 hover:underline font-medium">← Back to challenges</Link>
      </div>
    );
  }

  const { profile, stats, squads, recentActivity, isOwner } = data;

  const avatarUrl = profile.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || profile.username)}&background=10b981&color=fff&size=200&bold=true`;

  return (
    <main className="min-h-screen bg-black text-white pb-12">
      
      {/* COVER */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-purple-900 via-gray-900 to-black">
        {profile.cover_url ? (
          <Image src={profile.cover_url} alt="Cover" fill className="object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {isOwner && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-sm font-bold transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Profile
          </button>
        )}
      </div>
               {isOwner && !editing && (
          <div className="absolute top-4 right-4 flex gap-2">
            {/* 🎯 NEW: Refresh Button */}
            <button
              onClick={fetchProfile}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-sm font-bold transition flex items-center gap-2"
              title="Refresh Stats"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            {/* Existing Edit Button */}
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-sm font-bold transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit Profile
            </button>
          </div>
        )}
      {/* AVATAR + INFO */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8">
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <Image 
              src={avatarUrl} 
              alt={profile.display_name || profile.username}
              width={128}
              height={128}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-black shadow-2xl object-cover bg-gray-800"
            />
          </div>

          <div className="flex-1 text-center sm:text-left pb-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white break-words">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-green-400 font-mono text-sm mt-1">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-gray-300 mt-3 max-w-2xl mx-auto sm:mx-0 text-sm sm:text-base leading-relaxed">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mt-4 text-sm text-gray-400">
              {profile.location && <span className="flex items-center gap-1">📍 {profile.location}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-green-400 transition truncate max-w-[200px]">
                  🔗 {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-green-400 transition">
                  💻 GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 🎯 STATS - REAL DATA FROM API */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-purple-500/20 rounded-2xl p-5 text-center sm:text-left">
            <p className="text-xs text-purple-400 uppercase tracking-wider font-bold">Global Rank</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">#{stats.globalRank}</p>
            <p className="text-xs text-gray-500 mt-1">Among all coders</p>
          </div>
          <div className="bg-gray-900/50 border border-green-500/20 rounded-2xl p-5 text-center sm:text-left">
            <p className="text-xs text-green-400 uppercase tracking-wider font-bold">Total Points</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">{stats.totalPoints}</p>
            <p className="text-xs text-gray-500 mt-1">Earned from challenges</p>
          </div>
          <div className="bg-gray-900/50 border border-orange-500/20 rounded-2xl p-5 text-center sm:text-left">
            <p className="text-xs text-orange-400 uppercase tracking-wider font-bold">Challenges Solved</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">{stats.challengesSolved}</p>
            <p className="text-xs text-gray-500 mt-1">Problems conquered</p>
          </div>
        </div>

        {/* SQUADS + ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-5 sm:p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <span className="text-xl">🏰</span> Squads ({squads.length})
            </h3>
            {squads.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Not in any squads yet.</p>
            ) : (
              <div className="space-y-3">
                {squads.map((s: any) => (
                  <Link 
                    key={s.id} 
                    href={`/squad/${s.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition group"
                  >
                    {s.image_url ? (
                      <Image src={s.image_url} alt={s.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-white group-hover:text-green-400 transition block truncate">{s.name}</span>
                      <span className="text-xs text-gray-500">View squad →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-5 sm:p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <span className="text-xl">⚡</span> Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No challenges solved yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      a.difficulty === 'easy' ? 'bg-green-400' : 
                      a.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(a.solved_at).toLocaleDateString()} • +{a.points} pts
                      </p>
                    </div>
                    <span className="text-green-400 flex-shrink-0">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-900 pb-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                <input type="text" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full mt-1 px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                <input type="text" value={form.display_name || ''} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full mt-1 px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                <textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={200} className="w-full mt-1 px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-8 sticky bottom-0 bg-gray-900 pt-4 border-t border-gray-800">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition text-white">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-xl font-bold transition text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}