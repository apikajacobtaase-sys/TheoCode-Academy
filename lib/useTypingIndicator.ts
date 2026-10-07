import { useState, useEffect, useRef, useCallback } from 'react';

interface Typer {
  user_id: string;
  user_name: string;
}

export function useTypingIndicator(squadId: string | null, currentUserId: string | null) {
  const [typers, setTypers] = useState<Typer[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<number>(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 Poll for typers every 1.5 seconds
  useEffect(() => {
    if (!squadId) return;

    const fetchTypers = async () => {
      try {
        const res = await fetch(`/api/squads/${squadId}/typing`);
        if (res.ok) {
          const data = await res.json();
          setTypers(data.typers || []);
        }
      } catch (err) {
        console.error('Failed to fetch typers:', err);
      }
    };

    fetchTypers(); // Initial fetch
    pollIntervalRef.current = setInterval(fetchTypers, 1500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [squadId]);

  // 🎯 Mark self as typing (debounced - only once per 2 seconds)
  const markTyping = useCallback((userName: string) => {
    if (!squadId || !currentUserId) return;

    const now = Date.now();
    if (now - lastSentRef.current < 2000) return; // Don't spam

    lastSentRef.current = now;

    fetch(`/api/squads/${squadId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: userName })
    }).catch(() => {});

    // Clear typing status after 3 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      fetch(`/api/squads/${squadId}/typing`, { method: 'DELETE' }).catch(() => {});
    }, 3000);
  }, [squadId, currentUserId]);

  // 🎯 Clear typing status immediately (when message is sent)
  const clearTyping = useCallback(() => {
    if (!squadId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    fetch(`/api/squads/${squadId}/typing`, { method: 'DELETE' }).catch(() => {});
  }, [squadId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // 🎯 Format the typing message
  const typingMessage = typers.length === 0 
    ? null 
    : typers.length === 1 
      ? `${typers[0].user_name} is typing...`
      : typers.length === 2
        ? `${typers[0].user_name} and ${typers[1].user_name} are typing...`
        : `${typers[0].user_name} and ${typers.length - 1} others are typing...`;

  return { typers, typingMessage, markTyping, clearTyping };
}