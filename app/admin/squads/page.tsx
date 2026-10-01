'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminSquadsPage() {
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (squadId: string) => {
    if (!confirm('Are you sure you want to delete this squad? This will delete all messages and members.')) return;
    
    setDeletingId(squadId);
    try {
      const res = await fetch(`/api/squads/${squadId}`, { method: 'DELETE' });
      if (res.ok) {
        setSquads(squads.filter(s => s.id !== squadId));
      }
    } catch (error) {
      console.error('Failed to delete squad:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-green-400 animate-pulse text-xl">Loading squads...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            🛡️ Manage Squads
          </h1>
          <p className="text-gray-400">View and manage all squads on the platform.</p>
        </div>
        <div className="text-green-400 font-bold text-lg">
          {squads.length} Squad{squads.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Squads Grid */}
      {squads.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800 border-dashed">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold mb-2 text-white">No squads yet</h2>
          <p className="text-gray-400">Squads will appear here once users create them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads.map((squad) => (
            <div key={squad.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-green-500/50 transition-all group">
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-1 truncate text-white group-hover:text-green-400 transition">
                      {squad.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {squad.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

               {/* Creator Info */}
<div className="mb-4 p-3 bg-black rounded-lg border border-gray-800">
  <p className="text-xs text-gray-400 mb-2">Created by</p>
  <div className="flex items-center gap-3">
    <img
      src={squad.creator_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(squad.creator_name || 'U')}&background=16a34a&color=fff&size=200`}
      alt={squad.creator_name || 'Creator'}
      className="w-10 h-10 rounded-full object-cover border-2 border-green-500 flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white font-bold truncate flex items-center gap-1">
        {squad.creator_name || 'Unnamed User'}
        {squad.creator_name && (
          <span className="text-green-400 text-xs" title="Verified Creator">✓</span>
        )}
      </p>
      <p className="text-xs text-green-400">
        📅 {new Date(squad.created_at).toLocaleDateString()}
      </p>
    </div>
  </div>
</div>

                {/* Stats */}
                <div className="flex gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1 text-green-400">
                    👥 <span className="font-bold">{squad.member_count || 0}</span> members
                  </span>
                  <span className="flex items-center gap-1 text-green-400">
                    💬 <span className="font-bold">{squad.message_count || 0}</span> messages
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/squad/${squad.id}`}
                    className="flex-1 text-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition"
                  >
                    View Chat
                  </Link>
                  <button
                    onClick={() => handleDelete(squad.id)}
                    disabled={deletingId === squad.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition"
                  >
                    {deletingId === squad.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}