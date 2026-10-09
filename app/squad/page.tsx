'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

interface Squad {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  user_role: string;
  member_status: string;
  created_at: string;
  image_url?: string; // 🎯 Added to match your database
}

export default function SquadsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/squads')
        .then((res) => res.json())
        .then((data) => {
          setSquads(data.squads || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch squads:', err);
          setLoading(false);
        });
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl font-bold">Loading your squads...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Sign in to view your squads</h2>
        <Link href="/sign-in" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* 🎯 1. HERO SECTION (Cleaned up) */}
                <div className="flex flex-col sm:flex-row gap-4">
            {/* 🎯 NEW: Discover Squads Button */}
            <Link
              href="/squad/discover"
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              <svg className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Discover Squads
            </Link>

            {/* Existing: Create New Squad Button */}
            <Link
              href="/squad/create"
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] whitespace-nowrap"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Squad
            </Link>
          </div>

      {/* 🎯 2. SQUADS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {squads.length === 0 ? (
          /* 🎯 EMPTY STATE */
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No squads yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't joined or created any squads yet. Start by creating your own or exploring public squads!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/squad/create" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">
                Create a Squad
              </Link>
              <Link href="/explore" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold transition">
                Explore Public Squads
              </Link>
            </div>
          </div>
        ) : (
          /* 🎯 SQUADS GRID WITH FALLBACK IMAGE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {squads.map((squad) => (
              <Link
                key={squad.id}
                href={`/squad/${squad.id}`}
                className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 hover:bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 flex flex-col"
              >
                {/* Card Header Image */}
                <div className="relative h-32 w-full bg-gray-800 overflow-hidden">
                  <Image
                    // 🎯 MAGIC FALLBACK: Use squad image if it exists, otherwise use your local file
                    src={squad.image_url || '/images/squadCard.jpg'}
                    alt={squad.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {squad.is_private && (
                      <span className="px-2 py-1 bg-gray-900/80 backdrop-blur-sm text-gray-300 text-xs font-bold rounded-md border border-gray-700 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Private
                      </span>
                    )}
                    <span className={`px-2 py-1 backdrop-blur-sm text-xs font-bold rounded-md border flex items-center gap-1 ${
                      squad.user_role === 'owner' 
                        ? 'bg-purple-900/80 text-purple-300 border-purple-500/50' 
                        : 'bg-blue-900/80 text-blue-300 border-blue-500/50'
                    }`}>
                      {squad.user_role === 'owner' ? '👑 Owner' : '👤 Member'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors line-clamp-1">
                    {squad.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                    {squad.description || 'No description provided for this squad.'}
                  </p>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <span className="text-xs text-gray-500">
                      Joined {new Date(squad.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-green-400 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Enter Squad
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}