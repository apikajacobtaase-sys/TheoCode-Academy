'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isLoaded && user) {
      fetchNotifications();
    }
  }, [isLoaded, user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
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

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId })
      });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;
    
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center text-white">
        <div className="text-xl animate-pulse">Loading notifications...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view notifications</h1>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition">Sign In</button>
        </SignInButton>
      </div>
    );
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">🔔 Notifications</h1>
              <p className="text-gray-400">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'You\'re all caught up!'}
              </p>
            </div>
            
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-sm transition"
                >
                  ✓ Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={deleteAllNotifications}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-sm transition"
                >
                  🗑️ Delete all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              filter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              filter === 'unread' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-gray-800/50 rounded-2xl p-16 text-center border border-gray-700 border-dashed">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h2>
            <p className="text-gray-400">
              {filter === 'unread' 
                ? 'All your notifications are read!'
                : 'When you receive notifications, they\'ll appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 hover:border-purple-500/50 transition-all group ${
                  !notification.is_read ? 'ring-2 ring-purple-500/30' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="text-3xl sm:text-4xl flex-shrink-0">
                    {notification.type === 'course_complete' && '🎓'}
                    {notification.type === 'squad_invite' && '👥'}
                    {notification.type === 'squad_message' && '💬'}
                    {notification.type === 'challenge_complete' && '🏆'}
                    {notification.type === 'rank_up' && '⭐'}
                    {notification.type === 'system' && '🔔'}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className={`text-base sm:text-lg font-bold ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                        {notification.title}
                      </h3>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-400 flex-shrink-0"
                        title="Delete notification"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-400 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-purple-400 hover:text-purple-300 transition font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        {notification.link && (
                          <button
                            onClick={() => handleNotificationClick(notification)}
                            className="text-xs text-purple-400 hover:text-purple-300 transition font-medium"
                          >
                            View details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}