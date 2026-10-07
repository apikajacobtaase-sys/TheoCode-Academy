'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { UploadButton } from "@uploadthing/react";

export default function EditSquadPage() {
  const router = useRouter();
  const params = useParams();
  
  // 🎯 BULLETPROOF: Grabs the ID whether the folder is named [id] or [squadId]
  const rawId = params?.squadId || params?.id;
  const squadId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current squad data
  useEffect(() => {
    if (!squadId) {
      setError('Invalid Squad ID');
      setLoading(false);
      return;
    }

    fetch(`/api/squads/${squadId}`)
      .then(res => res.json())
      .then(data => {
        if (data.squad) {
          setName(data.squad.name || '');
          setDescription(data.squad.description || '');
          setImageUrl(data.squad.image_url || '');
        } else {
          setError('Squad not found');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch squad:', err);
        setError('Failed to load squad data');
        setLoading(false);
      });
  }, [squadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!squadId) {
      setError('Cannot save: Missing Squad ID');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/squads/${squadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, image_url: imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update squad');
      }

      setSuccess('Squad updated successfully!');
      setTimeout(() => router.push(`/squad/${squadId}`), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading squad...</div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
        <button onClick={() => router.back()} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent">
            Edit Squad
          </h1>
          <p className="text-gray-400 mt-2">Update your squad's profile and image</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-bold text-white mb-3">Squad Image</label>
            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-800 border-2 border-gray-700 flex-shrink-0">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Squad preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setImageUrl(res[0].url);
                      setSuccess('Image uploaded! Click Save to apply.');
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setError(`Upload failed: ${error.message}`);
                  }}
                  className="ut-button:bg-green-600 ut-button:hover:bg-green-500 ut-button:text-white ut-button:font-bold ut-button:py-2 ut-button:px-4 ut-button:rounded-lg"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 transition"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-white mb-2">
              Squad Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
              placeholder="Enter squad name"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition resize-none"
              placeholder="What is this squad about?"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-xl text-green-400">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}