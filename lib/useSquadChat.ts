import { useState, useEffect, useCallback, useRef } from 'react';

export function useSquadChat(squadId: string | null, currentUserId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const hasLoadedRef = useRef(false);

  const fetchMessages = useCallback(async () => {
    if (!squadId) return;

    // Only show loading screen on the VERY FIRST load
    if (!hasLoadedRef.current) {
      setInitialLoading(true);
    }

    try {
      const res = await fetch(`/api/squads/${squadId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      
      const data = await res.json();
      setMessages(data.messages || []);
      setError(null);
      
      // Mark as loaded so future fetches are completely silent
      hasLoadedRef.current = true;
    } catch (err: any) {
      console.error('❌ Fetch messages error:', err);
      if (!hasLoadedRef.current) setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  }, [squadId]);

  // 1. Initial fetch
  useEffect(() => {
    if (squadId) fetchMessages();
  }, [squadId, fetchMessages]);

  // 2. 🎯 SILENT BACKGROUND POLLING: Checks for new messages every 3 seconds
  useEffect(() => {
    if (!squadId || !hasLoadedRef.current) return;
    
    const interval = setInterval(() => {
      fetchMessages(); // This is 100% silent because hasLoadedRef is true
    }, 3000);

    return () => clearInterval(interval);
  }, [squadId, fetchMessages]);

  // 3. 🎯 OPTIMISTIC SEND: Updates UI instantly, then syncs with DB
  const sendMessage = useCallback(async (textContent: string, mediaData?: any, replyToId?: string) => {
    if (!squadId || !currentUserId) return;
    if (!textContent.trim() && !mediaData) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      sender_id: currentUserId,
      sender_name: 'You',
      content: textContent.trim(),
      media_url: mediaData?.url || null,
      media_type: mediaData?.type || null,
      media_name: mediaData?.name || null,
      message_type: mediaData ? mediaData.messageType : 'text',
      status: 'sending',
      created_at: new Date().toISOString(),
      reply_to_id: replyToId || null
    };

    // 🚀 INSTANTLY add to screen
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/squads/${squadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textContent.trim(),
          message_type: mediaData ? mediaData.messageType : 'text',
          media_url: mediaData?.url || null,
          media_type: mediaData?.type || null,
          media_name: mediaData?.name || null,
          reply_to_id: replyToId || null
        })
      });

      if (!res.ok) throw new Error('Failed to send');

      // Sync with database to replace temp message with real message
      await fetchMessages();
    } catch (err) {
      console.error('❌ Send error:', err);
      // Remove temp message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert('Failed to send message. Please try again.');
    }
  }, [squadId, currentUserId, fetchMessages]);

  return {
    messages,
    initialLoading,
    error,
    sendMessage, // 🎯 Exposed for the page to use
    refetch: fetchMessages
  };
}