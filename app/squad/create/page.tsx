'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function CreateSquadPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Please sign in to create a squad</h1>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/squad/${data.squad.id}`);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create squad');
      }
    } catch (error) {
      setError('Failed to create squad');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-2xl">
        
        <Link href="/squad" className="text-green-400 hover:text-green-300 text-sm mb-6 inline-block">
          ← Back to Squads
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            🛡️ Create New Squad
          </h1>
          <p className="text-gray-400 mb-8">
            Build a team and collaborate with other developers.
          </p>

          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Squad Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., React Masters, Backend Warriors"
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's your squad about? What are your goals?"
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                ❌ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  '🚀 Create Squad'
                )}
              </button>
              <Link
                href="/squad"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}