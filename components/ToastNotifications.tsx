'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  created_at: string;
}

export default function ToastNotifications() {
  const { user, isLoaded } = useUser();
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // 🎯 Use a ref to track seen IDs. This prevents the callback from 
  // recreating and causing race conditions with the interval.
  const seenIdsRef = useRef<Set<string>>(new Set());

  const checkNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const unread = (data.notifications || []).filter((n: any) => !n.is_read);

        // Find NEW unread notifications we haven't shown yet
        const newToasts = unread.filter((n: any) => !seenIdsRef.current.has(n.id));

        if (newToasts.length > 0) {
          setToasts(prev => {
            // Double-check against current toasts to be 100% safe
            const currentIds = new Set(prev.map(t => t.id));
            const trulyNew = newToasts.filter((n: any) => !currentIds.has(n.id));
            return [...prev, ...trulyNew];
          });
          
          // Mark them as seen in the ref
          newToasts.forEach((n: any) => seenIdsRef.current.add(n.id));
        }
      }
    } catch (error) {
      // Silent fail - don't spam console
    }
  }, [user]);

  // Check on mount and every 30 seconds
  useEffect(() => {
    if (!isLoaded || !user) return;

    // Initial check after 2 seconds (don't bombard on page load)
    const initialTimer = setTimeout(checkNotifications, 2000);

    // 🎯 FIXED: Changed from 1000 (1 second) to 30000 (30 seconds)
    const interval = setInterval(checkNotifications, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isLoaded, user, checkNotifications]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1)); // Remove oldest toast
    }, 6000);

    return () => clearTimeout(timer);
  }, [toasts]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course_complete': return '🎓';
      case 'squad_invite': return '👥';
      case 'squad_message': return '💬';
      case 'challenge_complete': return '🏆';
      case 'rank_up': return '⭐';
      case 'content_update': return '📚';
      case 'new_lesson': return '🎥';
      default: return '🔔';
    }
  };

  if (!isLoaded || !user || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          // 🎯 FIXED: Combine ID and timestamp to guarantee absolute uniqueness for React
          key={`${toast.id}-${toast.created_at}`}
          className="pointer-events-auto bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-slide-in"
        >
          {/* Progress bar (auto-dismiss timer) */}
          <div className="h-1 bg-purple-500 animate-shrink" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0 mt-0.5">
                {getIcon(toast.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white mb-1 truncate">
                  {toast.title}
                </p>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {toast.message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-gray-400 hover:text-white transition flex-shrink-0 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              {toast.link && (
                <Link
                  href={toast.link}
                  onClick={() => dismissToast(toast.id)}
                  className="flex-1 text-center py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold text-white transition"
                >
                  View
                </Link>
              )}
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-300 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Animations */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }

        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-shrink {
          animation: shrink 6s linear forwards;
        }
      `}</style>
    </div>
  );
}