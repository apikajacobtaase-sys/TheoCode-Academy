'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export function NotificationBell() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch notifications on mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchNotifications();
    }
  }, [isLoaded, user]);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 3. 🎯 Listen for auto-refresh events from background
  useEffect(() => {
    const handleNotificationsUpdated = (event: CustomEvent) => {
      const data = event.detail;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    };

    window.addEventListener('notifications-updated', handleNotificationsUpdated as EventListener);
    return () => {
      window.removeEventListener('notifications-updated', handleNotificationsUpdated as EventListener);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, { method: 'DELETE' });
      if (res.ok) {
        const deletedNotif = notifications.find(n => n.id === notificationId);
        setNotifications(notifications.filter(n => n.id !== notificationId));
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(unreadCount - 1);
        }
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
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      try {
        await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_id: notification.id })
        });
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    setIsOpen(false);
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-purple-400 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-black rounded-lg shadow-2xl border border-gray-800 z-50 max-h-[500px] flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
            <h3 className="font-bold text-white">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-purple-400 hover:text-purple-300 transition">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={deleteAllNotifications} className="text-xs text-red-400 hover:text-red-300 transition">
                  Delete all
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => notification.link && handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-900/50 transition cursor-pointer relative group ${
                      !notification.is_read ? 'bg-purple-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {notification.type === 'course_complete' && '🎓'}
                        {notification.type === 'squad_invite' && '👥'}
                        {notification.type === 'squad_message' && '💬'}
                        {notification.type === 'challenge_complete' && '🏆'}
                        {notification.type === 'rank_up' && '⭐'}
                        {notification.type === 'system' && '🔔'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 ${!notification.is_read ? 'font-semibold text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={(e) => deleteNotification(notification.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-400 flex-shrink-0"
                        title="Delete notification"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {!notification.is_read && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 text-center flex-shrink-0">
              <Link 
                href="/notifications" 
                className="text-sm text-purple-400 hover:text-purple-300 transition font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}