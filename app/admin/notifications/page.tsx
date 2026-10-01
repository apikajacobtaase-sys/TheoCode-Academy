'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };
const handleDelete = async (title: string) => {
  if (!confirm('Delete this broadcast notification for all users?')) return;
  
  try {
    const res = await fetch(`/api/admin/notifications?title=${encodeURIComponent(title)}`, { method: 'DELETE' });
    if (res.ok) {
      setNotifications(notifications.filter(n => n.title !== title));
    }
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
};

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-green-400 animate-pulse text-xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            🔔 Notification History
          </h1>
          <p className="text-gray-400">View all broadcast notifications sent to users.</p>
        </div>
        <Link
          href="/admin/broadcast"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center gap-2"
        >
          ➕ Send New Broadcast
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'system', 'course_complete', 'squad_message', 'challenge_complete'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
              filter === type
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
            }`}
          >
            {type === 'all' && '🌍 All'}
            {type === 'system' && '🔔 System'}
            {type === 'course_complete' && '🎓 Course'}
            {type === 'squad_message' && '🛡️ Squad'}
            {type === 'challenge_complete' && '🏆 Challenge'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800 border-dashed">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-2xl font-bold mb-2 text-white">No notifications found</h2>
          <p className="text-gray-400 mb-6">
            {filter === 'all' 
              ? 'No broadcasts have been sent yet.'
              : `No ${filter} notifications found.`}
          </p>
          <Link
            href="/admin/broadcast"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
          >
            Send Your First Broadcast
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => (
            <div key={notif.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-green-500/50 transition-all group">
              
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {notif.type === 'course_complete' && '🎓'}
                  {notif.type === 'squad_message' && '🛡️'}
                  {notif.type === 'challenge_complete' && '🏆'}
                  {notif.type === 'system' && '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{notif.title}</h3>
                   <button
  onClick={() => handleDelete(notif.title)}
  className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-400 flex-shrink-0"
  title="Delete notification"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>
                  </div>

                  <p className="text-gray-300 mb-3">{notif.message}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-green-400 font-medium">
                      👥 Sent to {notif.recipient_count || 0} user{(notif.recipient_count || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-400">
                      📅 {new Date(notif.created_at).toLocaleString()}
                    </span>
                    {notif.link && (
                      <span className="text-green-400">
                        🔗 {notif.link}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}