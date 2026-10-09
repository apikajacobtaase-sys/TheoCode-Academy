'use client';
import Link from 'next/link';
import Image from 'next/image'; // 🎯 ADD THIS LINE!
import { useParams } from 'next/navigation';
import { useSquadChat } from '@/lib/useSquadChat';
import MessageBubble from '@/components/chat/MessageBubble';
import ImagePreview from '@/components/chat/ImagePreview';
import EmojiPicker from '@/components/chat/EmojiPicker';
import AttachmentMenu from '@/components/chat/AttachmentMenu';
import EditSquadDrawer from '@/components/EditSquadDrawer';
import { compressImage, fileToBase64, needsDateSeparator, formatDateSeparator } from '@/lib/chatUtils';
import { useTypingIndicator } from '@/lib/useTypingIndicator';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/Toast'; // 🎯 ADD THIS LINE
import { useState, useEffect, useRef } from 'react';
export default function SquadChatPage() {
  const { id: squadId } = useParams();
  const { user, isLoaded } = useUser();
  const { showToast } = useToast(); 
  
   const { messages, initialLoading, error, sendMessage, refetch } = useSquadChat(
     squadId as string, 
     user?.id || null // 🎯 Pass user ID for optimistic UI
   );
    // 🎯 Typing indicator
  const { typingMessage, markTyping, clearTyping } = useTypingIndicator(
    squadId as string, 
    user?.id || null
  );
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [squad, setSquad] = useState<any>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false); // 🎯 Added for drawer
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [pendingMedia, setPendingMedia] = useState<any>(null); // 🎯 Holds the image/video before sending
     // 🎯 Initialize UploadThing for chat media
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🎯 CONSOLIDATED: Fetch squad details once
  useEffect(() => {
    if (squadId) {
      fetch(`/api/squads/${squadId}`)
        .then(res => res.json())
        .then(data => {
          setSquad(data.squad);
          console.log('🔍 DEBUG SQUAD:', { 
            dbCreatorId: data.squad?.creator_id, 
            currentUserId: user?.id,
            userRole: data.squad?.role
          });
        })
        .catch(err => console.error('Failed to fetch squad:', err));
    }
  }, [squadId, user?.id]);

   // Mark messages as read
   useEffect(() => {
   if (squadId && messages.length > 0) {
       fetch(`/api/squads/${squadId}/messages`, { method: 'PUT' }).catch(() => {});
     }
   }, [squadId, messages.length]);

  // Listen for auto-refresh events
  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('refresh-squad-chat', handleRefresh);
    return () => window.removeEventListener('refresh-squad-chat', handleRefresh);
  }, [refetch]);

    const handleCopyInvite = () => {
    // Copies the discover page link (or you can use a specific invite code if you have one)
    const inviteLink = `${window.location.origin}/squad/discover`;
    navigator.clipboard.writeText(inviteLink);
    showToast('success', '🔗 Discover link copied to clipboard!', 3000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const textContent = newMessage.trim();
    if ((!textContent && !replyTo && !pendingMedia) || sending) return;

    setSending(true);
    clearTyping(); // 🎯 Clear typing indicator immediately

    try {
      // 🎯 Call the hook's optimized, optimistic sendMessage
      await sendMessage(textContent, pendingMedia || undefined, replyTo?.id);
      
      // Clear UI state after successful send
      setNewMessage('');
      setReplyTo(null);
      setPendingMedia(null);
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setSending(false);
    }
  };

    const handleMediaUpload = async (file: File, type: 'image' | 'video' | 'file') => {
    if (file.size > 8 * 1024 * 1024) {
      alert('File must be smaller than 8MB');
      return;
    }

    setUploadProgress(`Processing ${type}...`);

    try {
      let mediaSource = '';

      if (type === 'image') {
        mediaSource = await compressImage(file);
      } else {
        mediaSource = await fileToBase64(file);
      }

      // 🎯 MAGIC FIX: Save to state instead of sending immediately!
      setPendingMedia({
        url: mediaSource,
        type: file.type,
        name: file.name,
        messageType: type
      });
      
      // Focus the input so the user can type a caption
      const input = document.getElementById('chat-input');
      if (input) input.focus();

    } catch (error) {
      console.error(`${type} processing failed:`, error);
      alert(`Failed to process ${type}.`);
    } finally {
      setUploadProgress(null);
    }
  };
  if (!isLoaded || initialLoading) {
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
        
               {/* 🎯 FIXED: Show image if it exists, otherwise show initials */}
        {squad?.image_url ? (
          <Image 
            src={squad.image_url} 
            alt={squad.name || 'Squad'} 
            width={40} 
            height={40} 
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {(squad?.name || 'S')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{squad?.name || 'Squad Chat'}</h1>
          {/* 🎯 FIXED: Using members.length instead of member_count */}
          <p className="text-xs text-green-400 truncate">
            {squad?.members?.length || 0} members • {squad?.description || 'Team collaboration'}
          </p>
        </div>

                {/* 🎯 WHATSAPP-STYLE ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {(squad?.role === 'owner' || squad?.role === 'leader') && (
            <button
              onClick={() => setShowEditDrawer(true)}
              className="p-2 text-gray-400 hover:text-green-400 transition"
              title="Edit Squad"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {/* 🎯 NEW: Invite Button */}
          <button
            onClick={handleCopyInvite}
            className="p-2 text-gray-400 hover:text-purple-400 transition"
            title="Invite Friends"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button className="p-2 text-gray-400 hover:text-green-400 transition">🔍</button>
        </div>
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
                {/* 🎯 Pending Media Preview */}
      {pendingMedia && (
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {pendingMedia.messageType === 'image' ? (
              <img src={pendingMedia.url} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-gray-700" />
            ) : pendingMedia.messageType === 'video' ? (
              <video src={pendingMedia.url} className="h-16 w-16 rounded-lg object-cover border border-gray-700" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl">
                📄
              </div>
            )}
            <button
              onClick={() => setPendingMedia(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md"
              title="Remove media"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-green-400">Ready to send</p>
            <p className="text-xs text-gray-400 truncate">{pendingMedia.name}</p>
          </div>
        </div>
      )}
             {/* 🎯 Typing Indicator */}
      {typingMessage && (
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-1.5 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-gray-400 italic">{typingMessage}</span>
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
            {showAttach && (
     <AttachmentMenu 
       onImageSelect={(file) => handleMediaUpload(file, 'image')} 
       onVideoSelect={(file) => handleMediaUpload(file, 'video')} 
       onFileSelect={(file) => handleMediaUpload(file, 'file')} 
       onClose={() => setShowAttach(false)} 
     />
   )}
        </div>

                
<div className="flex-1 bg-black rounded-lg flex items-center border border-gray-800 focus-within:border-green-500 transition">
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              // 🎯 Trigger typing indicator when user types
              if (e.target.value.trim() && user) {
                markTyping(user.firstName || user.fullName || 'User');
              }
            }}
              onKeyDown={(e) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       clearTyping(); 
       handleSend(e as any); // 🎯 CHANGED HERE
     }
   }}
            placeholder={pendingMedia ? "Add a caption..." : "Type a message"}
            className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none text-sm"
            disabled={sending}
          />
        </div>
               <button
     onClick={handleSend} // 🎯 CHANGED HERE
     disabled={sending || (!newMessage.trim() && !replyTo && !pendingMedia)}
     className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition flex-shrink-0"
   >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-white text-lg">➤</span>
          )}
        </button>
      </div>
         {/* 🎯 PENDING REQUESTS (For Owners/Leaders Only) */}
{(squad?.role === 'owner' || squad?.role === 'leader') && squad?.pending_requests?.length > 0 && (
  <div className="mt-8 pt-8 border-t border-gray-800">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      📬 Pending Join Requests ({squad.pending_requests.length})
    </h3>
    <div className="space-y-3">
      {squad.pending_requests.map((req: any) => (
        <div key={req.user_id} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">
              {req.user_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-white">{req.user_name || 'Unknown User'}</p>
              <p className="text-xs text-gray-500">Requested {new Date(req.joined_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                await fetch(`/api/squads/${squad.id}/members/${req.user_id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'reject' })
                });
                window.location.reload(); // Simple reload to update list
              }}
              className="px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-900/50 transition"
            >
              Reject
            </button>
            <button 
              onClick={async () => {
                await fetch(`/api/squads/${squad.id}/members/${req.user_id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'approve' })
                });
                window.location.reload();
              }}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-500 transition"
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      {previewImage && <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />}

      {/* 🎯 WHATSAPP-STYLE EDIT DRAWER */}
      {squad && (
        <EditSquadDrawer
          squadId={squadId as string}
          isOpen={showEditDrawer}
          onClose={() => setShowEditDrawer(false)}
          onSaved={(updatedSquad) => {
            // Silently update the header state without refreshing the page!
            setSquad((prev: any) => ({ ...prev, ...updatedSquad }));
          }}
          currentName={squad.name || ''}
          currentDescription={squad.description || ''}
          currentImageUrl={squad.image_url || ''}
        />
      )}
    </main>
  );
}