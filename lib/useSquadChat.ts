import { useState, useEffect, useCallback } from 'react';

export function useSquadChat(squadId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    // 🎯 1. If no squadId, stop loading immediately
    if (!squadId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true); // Start loading
      
      const res = await fetch(`/api/squads/${squadId}/messages`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Squad Messages API Failed:', res.status, errorText);
        throw new Error(`Failed to fetch messages (Status: ${res.status})`);
      }
      
      const data = await res.json();
      setMessages(data.messages || []);
      setError(null); // Clear any previous errors
      
    } catch (err: any) {
      console.error('❌ fetchMessages error:', err.message);
      setError(err.message);
    } finally {
      // 🎯 2. CRITICAL: This guarantees loading stops, NO MATTER WHAT!
      setLoading(false);
    }
  }, [squadId]);

  // Fetch messages when squadId changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, refetch: fetchMessages };
}