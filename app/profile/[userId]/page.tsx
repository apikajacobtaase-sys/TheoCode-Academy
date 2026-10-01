'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function UserProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [squadList, setSquadList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${userId}`);
      if (!res.ok) {
        setError('User not found');
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
      setStats(data.stats);
      setSquadList(data.squadList || []);
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-gray-400 mb-6">{error || 'This user does not exist.'}</p>
        <Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar */}
            <img
              src={profile.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=16a34a&color=fff&size=200`}
              alt={profile.full_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-xl"
            />

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {profile.full_name || 'Unnamed User'}
                </h1>
                {profile.is_name_verified && (
                  <span className="text-green-400 text-2xl" title="Verified Name">✓</span>
                )}
              </div>
              
              {profile.username && (
                <p className="text-gray-400 text-lg mb-3">@{profile.username}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  📅 Joined {joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {stats?.coursesCompleted || 0}
            </div>
            <div className="text-gray-400">Courses Completed</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {stats?.challengesSolved || 0}
            </div>
            <div className="text-gray-400">Challenges Solved</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {stats?.squads || 0}
            </div>
            <div className="text-gray-400">Squads</div>
          </div>
        </div>

        {/* Squads */}
        {squadList.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🛡️ Squads
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {squadList.map((squad: any) => (
                <Link
                  key={squad.id}
                  href={`/squad/${squad.id}`}
                  className="p-4 bg-black rounded-lg border border-gray-800 hover:border-green-500/50 transition group"
                >
                  <p className="text-white font-medium group-hover:text-green-400 transition">
                    {squad.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}