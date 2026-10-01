'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSquadChat } from '@/lib/useSquadChat';
import MessageBubble from '@/components/chat/MessageBubble';
import ImagePreview from '@/components/chat/ImagePreview';
import EmojiPicker from '@/components/chat/EmojiPicker';
import AttachmentMenu from '@/components/chat/AttachmentMenu';
import { compressImage, fileToBase64, needsDateSeparator, formatDateSeparator } from '@/lib/chatUtils';

export default function SquadChatPage() {
  const { id: squadId } = useParams();
  const { user, isLoaded } = useUser();
  const { messages, loading, error, refetch } = useSquadChat(squadId as string);
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [squad, setSquad] = useState<any>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (squadId) {
      fetch(`/api/squads/${squadId}`)
        .then(res => res.json())
        .then(data => setSquad(data.squad))
        .catch(err => console.error('Failed to fetch squad:', err));
    }
  }, [squadId]);

  useEffect(() => {
    if (squadId && messages.length > 0) {
      fetch(`/api/squads/${squadId}/messages`, { method: 'PUT' }).catch(() => {});
    }
  }, [squadId, messages.length]);

  // 🎯 Listen for auto-refresh events
  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('refresh-squad-chat', handleRefresh);
    return () => window.removeEventListener('refresh-squad-chat', handleRefresh);
  }, [refetch]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !replyTo) || sending) return;

    setSending(true);
    try {
      await fetch(`/api/squads/${squadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'text',
          reply_to_id: replyTo?.id || null
        })
      });
      setNewMessage('');
      setReplyTo(null);
      refetch();
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadProgress('Compressing image...');
      const compressed = await compressImage(file);
      setUploadProgress('Sending...');
      await fetch(`/api/squads/${squadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_type: 'image',
          file_data: compressed,
          file_name: file.name,
          file_size: file.size,
          file_mime: file.type,
          reply_to_id: replyTo?.id || null
        })
      });
      setReplyTo(null);
      refetch();
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert('Video must be smaller than 20MB');
      return;
    }
    try {
      setUploadProgress('Uploading video...');
      const base64 = await fileToBase64(file);
      await fetch(`/api/squads/${squadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_type: 'video',
          file_data: base64,
          file_name: file.name,
          file_size: file.size,
          file_mime: file.type,
          reply_to_id: replyTo?.id || null
        })
      });
      setReplyTo(null);
      refetch();
    } catch (error) {
      console.error('Video upload failed:', error);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be smaller than 10MB');
      return;
    }
    try {
      setUploadProgress('Uploading file...');
      const base64 = await fileToBase64(file);
      await fetch(`/api/squads/${squadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_type: 'file',
          file_data: base64,
          file_name: file.name,
          file_size: file.size,
          file_mime: file.type,
          reply_to_id: replyTo?.id || null
        })
      });
      setReplyTo(null);
      refetch();
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadProgress(null);
    }
  };

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-400 animate-pulse">Loading chat...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Please sign in</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Failed to Load Chat</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/squad" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
          ← Back to Squads
        </Link>
      </div>
    );
  }

  return (
    <main className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
      
      {/* WhatsApp-style header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <Link href="/squad" className="text-green-400 hover:text-green-300 transition p-2">
          ←
        </Link>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
          {(squad?.name || 'S')[0].toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{squad?.name || 'Squad Chat'}</h1>
          <p className="text-xs text-green-400 truncate">
            {squad?.member_count || 0} members • {squad?.description || 'Team collaboration'}
          </p>
        </div>

        <button className="p-2 text-gray-400 hover:text-green-400 transition">🔍</button>
        <button className="p-2 text-gray-400 hover:text-green-400 transition">⋮</button>
      </div>

      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#000000'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-900 text-green-400 text-xs px-3 py-1 rounded-lg shadow border border-gray-800">
              🔒 Messages are end-to-end encrypted within this squad
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl text-gray-400 mb-2">No messages yet</p>
              <p className="text-sm text-green-400">Say hello to your squad!</p>
            </div>
          ) : (
            <div>
              {messages.map((msg: any, idx: number) => {
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showDate = needsDateSeparator(msg.created_at, prevMsg?.created_at);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <div className="bg-gray-900 text-green-400 text-xs px-3 py-1 rounded-lg shadow border border-gray-800">
                          {formatDateSeparator(msg.created_at)}
                        </div>
                      </div>
                    )}
                    <MessageBubble
                      message={msg}
                      isOwn={msg.sender_id === user.id}
                      currentUserId={user.id}
                      onReply={(m) => {
                        setReplyTo(m);
                        inputRef.current?.focus();
                      }}
                      onImageClick={(src) => setPreviewImage(src)}
                    />
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {uploadProgress && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">{uploadProgress}</p>
          </div>
        </div>
      )}

      {replyTo && (
        <div className="bg-gray-900 border-l-4 border-green-500 px-4 py-2 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-green-400">
              Replying to {replyTo.sender_name || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {replyTo.message_type === 'text' ? replyTo.content : `📎 ${replyTo.message_type}`}
            </p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
      )}

      {/* Input area */}
      <div className="bg-gray-900 px-3 py-2 flex items-end gap-2 flex-shrink-0 relative border-t border-gray-800">
        <div className="relative">
          <button onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-green-400 transition text-xl">😊</button>
          {showEmoji && <EmojiPicker onSelect={(emoji) => setNewMessage(newMessage + emoji)} onClose={() => setShowEmoji(false)} />}
        </div>

        <div className="relative">
          <button onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-green-400 transition text-xl rotate-45">📎</button>
          {showAttach && <AttachmentMenu onImageSelect={handleImageUpload} onVideoSelect={handleVideoUpload} onFileSelect={handleFileUpload} onClose={() => setShowAttach(false)} />}
        </div>

        <div className="flex-1 bg-black rounded-lg flex items-center border border-gray-800 focus-within:border-green-500 transition">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(e as any); } }}
            placeholder="Type a message"
            className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none text-sm"
            disabled={sending}
          />
        </div>

        <button
          onClick={handleSendText}
          disabled={sending || (!newMessage.trim() && !replyTo)}
          className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition flex-shrink-0"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-white text-lg">➤</span>
          )}
        </button>
      </div>

      {previewImage && <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />}
    </main>
  );
}