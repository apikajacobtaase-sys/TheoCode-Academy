'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SquadsPage() {
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {
      const res = await fetch('/api/squads');
      if (res.ok) {
        const data = await res.json();
        setSquads(data.squads || []);
      }
    } catch (error) {
      console.error('Failed to fetch squads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-green-400 animate-pulse text-xl">Loading squads...</div></div>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">🛡️ Squads</h1>
            <p className="text-gray-400">Join a team or create your own to collaborate and compete.</p>
          </div>
          <Link href="/squad/create" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center gap-2">
            ➕ Create Squad
          </Link>
        </div>

        {squads.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800 border-dashed">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No squads yet</h2>
            <p className="text-gray-400 mb-6">Be the first to create a squad and start collaborating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {squads.map((squad) => (
              <Link 
                key={squad.id} 
                href={`/squad/${squad.id}`} 
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">{squad.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{squad.description || 'No description provided.'}</p>
                <div className="text-xs text-gray-500">
                  Created {new Date(squad.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}