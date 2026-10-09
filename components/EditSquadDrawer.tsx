'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UploadButton } from "@/lib/uploadthing"; // ✅ This has the generics already bound!
interface EditSquadDrawerProps {
  squadId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedSquad: any) => void;
  currentName: string;
  currentDescription: string;
  currentImageUrl: string;
}

export default function EditSquadDrawer({
  squadId,
  isOpen,
  onClose,
  onSaved,
  currentName,
  currentDescription,
  currentImageUrl,
}: EditSquadDrawerProps) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync state when drawer opens with new data
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setDescription(currentDescription);
      setImageUrl(currentImageUrl);
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentName, currentDescription, currentImageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setSuccess('Saved!');
      
      // 🎯 WhatsApp-style: Update parent state silently and close after a brief moment
      setTimeout(() => {
        onSaved({
          ...data.squad,
          name,
          description,
          image_url: imageUrl,
        });
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
            <h2 className="text-lg font-bold text-white">Edit Squad</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
         <form id="edit-squad-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-white mb-3">Squad Image</label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-800 border-2 border-gray-700 flex-shrink-0">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                     if (res && res[0]) setImageUrl(res[0].ufsUrl);
                    }}
                    onUploadError={(error: Error) => setError(`Upload failed: ${error.message}`)}
                    className="ut-button:bg-green-600 ut-button:hover:bg-green-500 ut-button:text-white ut-button:text-sm ut-button:py-2 ut-button:px-3 ut-button:rounded-lg"
                  />
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Squad Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                placeholder="Enter squad name"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition resize-none"
                placeholder="What is this squad about?"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-900/20 border border-green-500/50 rounded-xl text-green-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
            )}
          </form>

          {/* Footer Buttons */}
                    {/* Footer Buttons */}
          <div className="flex gap-3 px-5 py-4 border-t border-gray-800 flex-shrink-0 bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition"
            >
              Cancel
            </button>
            {/* 🎯 FIXED: type="submit" triggers the form's onSubmit, which has e.preventDefault() */}
           <button
  type="submit"
  form="edit-squad-form"
  disabled={saving}
  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white rounded-xl font-bold transition"
>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}