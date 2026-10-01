'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

export default function AutoRefresh() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // 🎯 Refresh data every 10 seconds
    const refreshData = async () => {
      try {
        // 1. Refresh notifications (updates the bell badge)
        const notifRes = await fetch('/api/notifications');
        if (notifRes.ok) {
          // Dispatch a custom event that NotificationBell listens to
          const data = await notifRes.json();
          window.dispatchEvent(new CustomEvent('notifications-updated', {
            detail: data
          }));
        }

        // 2. If on squad chat page, refresh messages
        if (pathname.startsWith('/squad/')) {
          window.dispatchEvent(new CustomEvent('refresh-squad-chat'));
        }

        // 3. If on dashboard, refresh dashboard data
        if (pathname === '/dashboard') {
          window.dispatchEvent(new CustomEvent('refresh-dashboard'));
        }

      } catch (error) {
        // Silent fail - don't spam console
      }
    };

    // Initial refresh after 2 seconds
    const initialTimer = setTimeout(refreshData, 2000);

    // Then every 10 seconds
    intervalRef.current = setInterval(refreshData, 10000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoaded, user, pathname]);

  // This component renders nothing - it just runs in the background
  return null;
}