'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import ImageCropper from '@/components/ImageCropper';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    profile_image_url: '',
    is_name_verified: false
  });

  useEffect(() => {
    if (isLoaded && user) fetchProfile();
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          full_name: data.profile.full_name || user.fullName || '',
          username: data.profile.username || user.username || '',
          profile_image_url: data.profile.profile_image_url || user.imageUrl || '',
          is_name_verified: data.profile.is_name_verified || false
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Please select an image file (JPG, PNG, GIF, WebP)');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Image must be smaller than 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Convert to data URL for cropper
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // 🎯 Handle cropped image result
  const handleCropComplete = (croppedImage: string) => {
    setFormData({ ...formData, profile_image_url: croppedImage });
    setShowCropper(false);
    setRawImageSrc('');
    setMessage('✅ Image cropped! Don\'t forget to save your profile.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('✅ Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const err = await res.json();
        setMessage(`❌ Error: ${err.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition">Sign In</button>
        </SignInButton>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm mb-6 inline-block">← Back to Dashboard</Link>
        
        <h1 className="text-3xl font-bold mb-8">⚙️ Profile Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-bold ${message.includes('✅') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 space-y-6">
          
          {/* 🎯 NEW: Profile Image Upload with Crop */}
          <div>
            <label className="text-sm font-bold mb-3 block">Profile Picture</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview */}
              <div className="relative group">
                <img 
                  src={formData.profile_image_url || 'https://ui-avatars.com/api/?name=User&background=6b21a8&color=fff&size=200'} 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-purple-500 object-cover bg-gray-900"
                />
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Change</span>
                </div>
              </div>

              {/* Upload Buttons */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-sm transition"
                >
                  📤 Upload Photo
                </button>
                <input
                  type="url"
                  value={formData.profile_image_url.startsWith('data:') ? '' : formData.profile_image_url}
                  onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                  className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs"
                  placeholder="Or paste image URL..."
                />
                <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP • Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-sm font-bold mb-2 block">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., John Doe"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-bold mb-2 block">Username</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-700 bg-gray-900 text-gray-400 text-sm">@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-r-lg text-white"
                placeholder="johndoe"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Letters and numbers only, no spaces.</p>
          </div>

          {/* Certificate Verification */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="verify_name"
                checked={formData.is_name_verified}
                onChange={(e) => setFormData({ ...formData, is_name_verified: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-900"
              />
              <div>
                <label htmlFor="verify_name" className="font-bold text-purple-300 cursor-pointer">
                  Verify Name for Certificates
                </label>
                <p className="text-sm text-gray-400 mt-1">
                  By checking this box, you confirm that the name provided above is your official name and you authorize TheCode Academy to use it on your certificates of completion.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </form>
      </div>

      {/* 🎯 Image Cropper Modal */}
      {showCropper && rawImageSrc && (
        <ImageCropper
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropper(false);
            setRawImageSrc('');
          }}
        />
      )}
    </main>
  );
}