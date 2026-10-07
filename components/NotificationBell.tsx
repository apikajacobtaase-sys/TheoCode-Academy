'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/lib/useNotifications';

export default function NotificationBell() {
  const { unreadCount, hasNew, refetch } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = async () => {
    setIsOpen(!isOpen);
    // Optional: Mark as read when clicked (you can add an API call here later)
    // For now, just toggling the dropdown
  };

  return (
    <div className="relative">
      <button 
        onClick={handleClick}
        className={`relative p-2 rounded-full transition-all duration-300 ${
          hasNew ? 'bg-green-500/20 scale-110' : 'hover:bg-gray-800'
        }`}
        title="Notifications"
      >
        <svg className={`w-6 h-6 text-gray-300 ${hasNew ? 'animate-wiggle' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* 🎯 The Red Badge */}
        {unreadCount > 0 && (
          <span className={`absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 border-2 border-black rounded-full shadow-lg ${hasNew ? 'animate-ping-slow' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 🎯 Dropdown Menu (Placeholder for now) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            <span className="text-xs text-green-400 cursor-pointer hover:underline">Mark all as read</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <div className="text-3xl mb-2">🔔</div>
                You're all caught up!
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">
                {/* You can map through your notifications here later */}
                You have {unreadCount} unread notification(s).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}