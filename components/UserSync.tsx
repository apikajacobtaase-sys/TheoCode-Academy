'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export function UserSync() {
  const { user, isLoaded } = useUser();
  
  // Keep track of the last synced state to avoid infinite loops
  const lastSyncedRef = useRef<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
      const email = user.emailAddresses[0]?.emailAddress || null;
      const avatarUrl = user.imageUrl || null;
      
      // Create a unique string of the current user state
      const currentState = `${user.id}-${fullName}-${avatarUrl}`;

      // Only sync if something changed or it's the first load
      if (lastSyncedRef.current !== currentState) {
        lastSyncedRef.current = currentState;
        
        // Trigger the sync API
        fetch('/api/user/sync', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.warn('User sync failed:', err));
      }
    }
  }, [
    isLoaded, 
    user?.id, 
    user?.firstName, 
    user?.lastName, 
    user?.username, 
    user?.imageUrl, 
    user?.emailAddresses
  ]);

  return null;
}