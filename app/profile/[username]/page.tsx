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

  const fetchProfile = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/${username}?t=${Date.now()}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.success) {
        setData(d);
        setForm(d.profile);
      } else {
        setError(d.error || 'Failed to load profile');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [username]);

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
        fetchProfile();
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          <p className="text-green-400 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-4xl mb-4 border border-gray-800">👤</div>
        <h2 className="text-2xl font-bold mb-2">{error || 'User not found'}</h2>
        <Link href="/challenges" className="text-green-400 hover:text-green-300 font-medium transition">← Back to challenges</Link>
      </div>
    );
  }

  const { profile, stats, squads, recentActivity, isOwner } = data;
  const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || profile.username)}&background=10b981&color=fff&size=200&bold=true`;

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      
      {/* 🎯 1. IMMERSIVE HERO SECTION */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        {profile.cover_url ? (
          <Image src={profile.cover_url} alt="Cover" fill className="object-cover animate-in fade-in duration-1000" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {isOwner && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        
        {/* 🎯 2. AVATAR & INFO (Staggered Animation) */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="relative flex-shrink-0 mx-auto sm:mx-0 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-purple-600 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
            <Image 
              src={avatarUrl} 
              alt={profile.display_name || profile.username}
              width={144} height={144}
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-black shadow-2xl object-cover bg-gray-800 transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {isOwner && (
              <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-green-500 rounded-full border-4 border-black flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left pb-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-700 delay-100 fill-mode-forwards">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-green-400 font-mono text-base mt-2 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-200 fill-mode-forwards">
              @{profile.username}
            </p>
            
            {profile.bio && (
              <p className="text-gray-300 mt-4 max-w-2xl mx-auto sm:mx-0 text-base leading-relaxed animate-in slide-in-from-bottom-2 fade-in duration-700 delay-300 fill-mode-forwards">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-6 text-sm text-gray-400 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500 fill-mode-forwards">
              {profile.location && <span className="flex items-center gap-1.5 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">📍 {profile.location}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener" className="flex items-center gap-1.5 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800 hover:border-green-500/50 hover:text-green-400 transition">
                  🔗 {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener" className="flex items-center gap-1.5 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800 hover:border-green-500/50 hover:text-green-400 transition">
                  💻 GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 🎯 3. BENTO GRID STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-forwards">
          {[
            { label: 'Global Rank', value: `#${stats.globalRank}`, sub: 'Among all coders', color: 'purple', icon: '👑' },
            { label: 'Total Points', value: stats.totalPoints, sub: 'Earned from challenges', color: 'green', icon: '⚡' },
            { label: 'Challenges Solved', value: stats.challengesSolved, sub: 'Problems conquered', color: 'orange', icon: '🏆' },
          ].map((stat, i) => (
            <div key={i} className={`group relative bg-gray-900/40 backdrop-blur-sm border border-gray-800 hover:border-${stat.color}-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-${stat.color}-500/10 overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-${stat.color}-500/20 transition-all duration-500`} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className={`text-xs font-bold uppercase tracking-wider text-${stat.color}-400`}>{stat.label}</p>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2 font-medium">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🎯 4. CONTENT GRID (Squads & Activity) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500 fill-mode-forwards">
          
          {/* Squads (Takes up 2 columns) */}
          <div className="lg:col-span-2 bg-gray-900/30 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-colors duration-300">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-base">🏰</span> 
              Squads <span className="text-gray-500 font-normal">({squads.length})</span>
            </h3>
            {squads.length === 0 ? (
              <div className="text-center py-10 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500 text-sm">Not in any squads yet.</p>
                <Link href="/squad/discover" className="text-green-400 text-sm font-bold hover:underline mt-2 inline-block">Discover Squads →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {squads.map((s: any) => (
                  <Link key={s.id} href={`/squad/${s.id}`} className="group flex items-center gap-4 p-3 bg-gray-800/30 hover:bg-gray-800 rounded-2xl transition-all duration-300 border border-transparent hover:border-gray-700">
                    {s.image_url ? (
                      <Image src={s.image_url} alt={s.name} width={48} height={48} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-white group-hover:text-green-400 transition block truncate">{s.name}</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400 transition">View squad →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity (Takes up 3 columns) */}
          <div className="lg:col-span-3 bg-gray-900/30 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-colors duration-300">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-base">⚡</span> 
              Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <div className="text-center py-10 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500 text-sm">No challenges solved yet.</p>
                <Link href="/challenges" className="text-green-400 text-sm font-bold hover:underline mt-2 inline-block">Start Coding →</Link>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-green-500/50 via-gray-800 to-transparent" />
                
                <div className="space-y-6">
                  {recentActivity.map((a: any, i: number) => (
                    <div key={i} className="relative flex items-start gap-4 group">
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-6 h-6 rounded-full border-4 border-black flex-shrink-0 mt-1 ${
                        a.difficulty === 'easy' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 
                        a.difficulty === 'medium' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'
                      }`} />
                      
                      <div className="flex-1 bg-gray-800/30 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-bold text-white text-base group-hover:text-green-400 transition-colors truncate">{a.title}</p>
                            <p className="text-xs text-gray-500 mt-1 capitalize">{a.difficulty} Challenge</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                              +{a.points} pts
                            </span>
                            <p className="text-[10px] text-gray-600 mt-1.5 font-mono">
                              {new Date(a.solved_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 5. GLASSMORPHIC EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-900 pb-4 border-b border-gray-800 z-10">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition">×</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Username</label>
                <input type="text" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Display Name</label>
                <input type="text" value={form.display_name || ''} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Bio</label>
                <textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={200} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition resize-none" />
                <p className="text-xs text-gray-600 text-right mt-1">{(form.bio || '').length}/200</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Location</label>
                  <input type="text" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition" placeholder="City, Country" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Avatar URL</label>
                  <input type="url" value={form.avatar_url || ''} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Website</label>
                <input type="url" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition" placeholder="https://your-site.com" />
              </div>
            </div>

            <div className="flex gap-4 mt-8 sticky bottom-0 bg-gray-900 pt-6 border-t border-gray-800">
              <button onClick={() => setEditing(false)} className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition text-white">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-400 rounded-xl font-bold transition text-white flex items-center justify-center gap-2 shadow-lg shadow-green-900/20">
                {saving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}