'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UploadButton } from '@/lib/uploadthing';
import { useToast } from '@/components/Toast';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // Load current profile data
      fetch('/api/profiles/me')
        .then(r => r.json())
        .then(data => {
          setDisplayName(data.display_name || user.fullName || '');
          setAvatarUrl(data.avatar_url || user.imageUrl || '');
          setBio(data.bio || '');
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isLoaded, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, avatar_url: avatarUrl, bio })
      });

      if (res.ok) {
        showToast('success', '✅ Profile updated!', 3000);
        router.refresh();
      } else {
        showToast('error', 'Failed to update profile', 3000);
      }
    } catch {
      showToast('error', 'Network error', 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold">Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-black border-b border-gray-800 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-400 mt-2">Customize your public profile</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Avatar Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🖼️</span>
            Profile Picture
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Current Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-800 border-4 border-purple-500/30 ring-4 ring-purple-500/10">
                <Image
                  src={avatarUrl || '/default-avatar.png'}
                  alt="Profile"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              {avatarUrl && avatarUrl !== user.imageUrl && (
                <button
                  onClick={() => setAvatarUrl(user.imageUrl || '')}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transition"
                  title="Remove custom avatar"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Upload Section */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Upload Custom Avatar</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Upload a square image (recommended: 400x400px). Max size: 4MB.
                </p>
                <UploadButton
                  endpoint="courseMedia"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setAvatarUrl(res[0].url);
                      showToast('success', '✅ Avatar uploaded!', 3000);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    showToast('error', `Upload failed: ${error.message}`, 4000);
                  }}
                  className="ut-button:bg-purple-600 ut-button:hover:bg-purple-500 ut-button:text-white ut-button:font-bold ut-button:py-3 ut-button:px-6 ut-button:rounded-lg ut-allowed-content:text-gray-400"
                />
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-400 mb-2">Or use your Clerk avatar:</p>
                <button
                  onClick={() => setAvatarUrl(user.imageUrl || '')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Use Default Avatar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">👤</span>
            Profile Details
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your public name"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">This is how your name appears on the leaderboard and discussions.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={user.username || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed. Set it in Clerk settings.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Share a short bio with the community.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 rounded-lg font-bold transition shadow-lg shadow-purple-600/20"
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
}