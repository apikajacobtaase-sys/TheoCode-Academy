'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function usePushNotifications() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('[Push] Service workers not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('[Push] Service worker registered:', registration.scope);
      return true;
    } catch (error) {
      console.error('[Push] Service worker registration failed:', error);
      return false;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('[Push] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('[Push] Permission denied by user');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[Push] Permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }, []);

  // Show a native browser notification
  const showNativeNotification = useCallback((notification: any) => {
    if (Notification.permission !== 'granted') return;

    // Don't show if page is visible and user is looking at it
    // (We'll use the in-app toast instead)
    if (document.visibilityState === 'visible') {
      return;
    }

    const iconMap: Record<string, string> = {
      course_complete: '🎓',
      squad_invite: '👥',
      squad_message: '💬',
      challenge_complete: '🏆',
      rank_up: '⭐',
      system: '🔔'
    };

    const icon = iconMap[notification.type] || '🔔';

    try {
      const nativeNotif = new Notification(`${icon} ${notification.title}`, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        data: {
          url: notification.link || '/notifications',
          notificationId: notification.id
        },
      });

      // Handle click - focus window and navigate
      nativeNotif.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to the link
        if (notification.link) {
          router.push(notification.link);
        } else {
          router.push('/notifications');
        }
        
        nativeNotif.close();
      };

      // Auto-close after 8 seconds
      setTimeout(() => nativeNotif.close(), 8000);
    } catch (error) {
      console.error('[Push] Failed to show notification:', error);
    }
  }, [router]);

  // Check for new notifications
  const checkForNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;

      const data = await res.json();
      const unread = (data.notifications || []).filter((n: any) => !n.is_read);

      // Find NEW notifications we haven't shown yet
      const newOnes = unread.filter((n: any) => !seenIdsRef.current.has(n.id));

      if (newOnes.length > 0) {
        // Add to seen set
        newOnes.forEach((n: any) => seenIdsRef.current.add(n.id));

        // Keep seen set from growing too large
        if (seenIdsRef.current.size > 100) {
          const arr = Array.from(seenIdsRef.current);
          seenIdsRef.current = new Set(arr.slice(-50));
        }

        // Show native browser notifications for each new one
        newOnes.forEach((n: any) => {
          showNativeNotification(n);
        });
      }
    } catch (error) {
      // Silent fail
    }
  }, [user, showNativeNotification]);

  // Listen for messages from service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE' && event.data.url) {
        router.push(event.data.url);
        window.focus();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [router]);

  // Main setup effect
  useEffect(() => {
    if (!isLoaded || !user) return;

    const setup = async () => {
      // Register service worker
      await registerServiceWorker();
      
      // Request permission
      const hasPermission = await requestPermission();
      
      if (hasPermission) {
        // Initial check after 3 seconds
        const initialTimer = setTimeout(checkForNotifications, 3000);

        // Check every 30 seconds
        intervalRef.current = setInterval(checkForNotifications, 30000);

        // Also check when tab becomes visible again
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            checkForNotifications();
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          clearTimeout(initialTimer);
          if (intervalRef.current) clearInterval(intervalRef.current);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }
    };

    setup();
  }, [isLoaded, user, registerServiceWorker, requestPermission, checkForNotifications]);

  return {
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    permission: typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default'
  };
}