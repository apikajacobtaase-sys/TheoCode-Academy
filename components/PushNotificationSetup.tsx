'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePushNotifications } from '@/lib/usePushNotifications';

export default function PushNotificationSetup() {
  const { user, isLoaded } = useUser();
  const { isSupported, permission } = usePushNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show banner if:
    // - User is logged in
    // - Notifications are supported
    // - Permission not yet decided
    // - User hasn't dismissed the banner
    if (isLoaded && user && isSupported && permission === 'default' && !dismissed) {
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, user, isSupported, permission, dismissed]);

  const handleEnable = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setShowBanner(false);
      if (result === 'granted') {
        // Show a test notification
        new Notification('🔔 Notifications Enabled!', {
          body: 'You\'ll now receive alerts for new messages, challenges, and achievements.',
          icon: '/logo-icon.png'
        });
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('notif_banner_dismissed', Date.now().toString());
  };

  if (!showBanner || !isLoaded || !user) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[90] animate-slide-up">
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500/50 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">🔔</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white mb-1">
              Enable Notifications
            </p>
            <p className="text-xs text-purple-200 mb-3">
              Get instant alerts for new messages, challenges, and achievements — even when you're not on the app.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                className="flex-1 py-2 bg-white text-purple-900 hover:bg-purple-100 rounded-lg text-xs font-bold transition"
              >
                ✅ Enable
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 bg-purple-800/50 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}