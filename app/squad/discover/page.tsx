'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/Toast'; // Assuming you have this

interface PublicSquad {
  id: string;
  name: string;
  description: string;
  member_count: number;
  is_private: boolean;
}

export default function DiscoverSquadsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { showToast } = useToast();
  const [squads, setSquads] = useState<PublicSquad[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/squads/discover')
        .then(res => res.json())
        .then(data => {
          setSquads(data.squads || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isSignedIn, isLoaded]);

  const handleJoin = async (squadId: string) => {
    setJoiningId(squadId);
    try {
      const res = await fetch(`/api/squads/${squadId}/join`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        showToast('success', '🎉 Request sent! The leader will review it.', 4000);
        // Remove from list so they don't click again
        setSquads(prev => prev.filter(s => s.id !== squadId));
      } else {
        showToast('error', data.error || 'Failed to join', 3000);
      }
    } catch {
      showToast('error', 'Network error', 3000);
    } finally {
      setJoiningId(null);
    }
  };

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-400 animate-pulse">Loading squads...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Sign in to discover squads</h2>
        <Link href="/sign-in" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">Sign In</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Discover Squads</h1>
            <p className="text-gray-400">Find public communities and request to join.</p>
          </div>
          <Link href="/squad" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition text-sm">
            ← My Squads
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {squads.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No public squads found</h3>
            <p className="text-gray-400 mb-6">Be the first to create a public squad and invite others!</p>
            <Link href="/squad/create" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">
              Create a Squad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {squads.map((squad) => (
              <div key={squad.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-green-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white line-clamp-1">{squad.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
                    {squad.member_count} members
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                  {squad.description || 'No description provided.'}
                </p>

                <button
                  onClick={() => handleJoin(squad.id)}
                  disabled={joiningId === squad.id}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  {joiningId === squad.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Request to Join'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}