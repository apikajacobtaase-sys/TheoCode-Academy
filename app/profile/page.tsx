'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/Toast';

interface ProfileData {
  display_name: string;
  username: string;
  bio: string;
  email: string;
  avatar_url: string;
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: '',
    username: '',
    bio: '',
    email: '',
    avatar_url: '',
  });
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/profiles/me')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.profile) {
            const profileData = {
              display_name: data.profile.display_name || user.fullName || '',
              username: data.profile.username || user.username || '',
              bio: data.profile.bio || '',
              email: data.profile.email || user.emailAddresses?.[0]?.emailAddress || '',
              avatar_url: data.profile.avatar_url || user.imageUrl || '',
            };
            setProfile(profileData);
            setOriginalProfile(profileData);
            setAvatarPreview(profileData.avatar_url);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (!isLoaded) {
      // Still loading
    } else {
      setLoading(false);
    }
  }, [isSignedIn, isLoaded, user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.');
      return;
    }

    // Validate file size (4 MB)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('error', 'File too large. Maximum size is 4 MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profiles/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
      showToast('success', 'Avatar updated successfully!');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to upload avatar');
      // Revert preview
      setAvatarPreview(originalProfile?.avatar_url || '');
    } finally {
      setUploading(false);
    }
  };

  const handleUseClerkAvatar = async () => {
    if (!user?.imageUrl) return;

    setUploading(true);
    try {
      const response = await fetch('/api/profiles/use-clerk-avatar', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to use Clerk avatar');
      }

      setProfile(prev => ({ ...prev, avatar_url: user.imageUrl }));
      setAvatarPreview(user.imageUrl);
      showToast('success', 'Using your Clerk avatar!');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to use Clerk avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    if (!profile.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }
    if (profile.display_name.length > 50) {
      newErrors.display_name = 'Display name must be 50 characters or less';
    }
    if (profile.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('error', 'Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/profiles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: profile.display_name,
          bio: profile.bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setOriginalProfile(profile);
      showToast('success', 'Profile updated successfully!');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setAvatarPreview(originalProfile.avatar_url);
      setErrors({});
      showToast('info', 'Changes discarded');
    }
  };

  const hasChanges = originalProfile && (
    profile.display_name !== originalProfile.display_name ||
    profile.bio !== originalProfile.bio
  );

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00D26A] animate-pulse font-mono text-sm">Loading profile...</div>
      </div>
    );
  }

  // Auth guard
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Please sign in to view your profile
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-gray-800 px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#00D26A]/10 border border-[#00D26A]/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">My Profile</h1>
              <p className="text-sm text-gray-400">Customize your public profile and manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        {/* Profile Overview Card */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#00D26A] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                {profile.display_name || 'Your Name'}
              </h2>
              <p className="text-sm text-gray-400 mb-2">@{profile.username || 'username'}</p>
              {profile.bio && (
                <p className="text-sm text-gray-300 line-clamp-2">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Profile Picture
          </h3>

          <div className="space-y-4">
            {/* Upload Button */}
            <div>
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="w-full md:w-auto px-5 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 border border-gray-700 rounded-lg text-sm font-bold text-white transition"
              >
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload profile picture"
              />
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, GIF, or WebP. Maximum 4 MB.
              </p>
            </div>

            {/* Use Clerk Avatar */}
            {user?.imageUrl && (
              <div className="pt-3 border-t border-gray-800">
                <button
                  onClick={handleUseClerkAvatar}
                  disabled={uploading}
                  className="text-sm text-[#00D26A] hover:text-[#00b85c] disabled:text-gray-600 font-medium transition"
                >
                  Use my account avatar instead
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Sync with your Clerk account picture
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 md:p-6">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Profile Details
          </h3>

          <div className="space-y-5">
            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                id="display_name"
                type="text"
                value={profile.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                maxLength={50}
                className={`w-full bg-black border ${
                  errors.display_name ? 'border-red-500' : 'border-gray-700'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A] transition`}
                placeholder="Your display name"
              />
              {errors.display_name && (
                <p className="text-xs text-red-400 mt-1">{errors.display_name}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{profile.display_name.length}/50 characters</p>
            </div>

            {/* Username (Read-only) */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={profile.username}
                readOnly
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Username is managed by your account provider and cannot be changed here
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email is managed through your account settings
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                maxLength={500}
                rows={4}
                className={`w-full bg-black border ${
                  errors.bio ? 'border-red-500' : 'border-gray-700'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A] transition resize-none`}
                placeholder="Tell us about yourself..."
              />
              {errors.bio && (
                <p className="text-xs text-red-400 mt-1">{errors.bio}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{profile.bio.length}/500 characters</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex-1 sm:flex-none sm:min-w-[160px] px-6 py-3 bg-[#00D26A] hover:bg-[#00b85c] disabled:bg-gray-800 disabled:text-gray-500 rounded-lg text-sm font-bold text-black transition shadow-lg shadow-[#00D26A]/20"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving || !hasChanges}
            className="flex-1 sm:flex-none sm:min-w-[160px] px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 border border-gray-700 rounded-lg text-sm font-bold text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}