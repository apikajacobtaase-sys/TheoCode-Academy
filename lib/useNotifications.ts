import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const count = data.unreadCount || 0;
        
        // If the count goes up, trigger a "new" animation
        if (count > unreadCount && unreadCount !== 0) {
          setHasNew(true);
          setTimeout(() => setHasNew(false), 2000); // Reset animation after 2s
        }
        
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [unreadCount]);

  // 🎯 Silent background polling every 5 seconds
  useEffect(() => {
    fetchNotifications(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { unreadCount, hasNew, refetch: fetchNotifications };
}