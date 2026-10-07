'use client';

import { useState } from 'react';
import { formatMessageTime, getFileIcon, formatFileSize, getFileExtension } from '@/lib/chatUtils';
import { parseMessage } from '@/lib/messageParser';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  currentUserId: string;
  onReply: (msg: any) => void;
  onImageClick: (src: string) => void;
}

export default function MessageBubble({ message, isOwn, currentUserId, onReply, onImageClick }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const isVerified = message.is_name_verified;
  const displayName = isVerified 
    ? (message.sender_name || 'User') 
    : `${message.sender_name || 'User'} ⚠️`;

  const avatarUrl = message.sender_image || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender_name || 'U')}&background=00a884&color=fff&size=200`;

  const renderContent = () => {
    // 🎯 FIX: Use media_url first, fallback to file_data for backward compatibility
    const mediaSource = message.media_url || message.file_data;
    const mediaName = message.media_name || message.file_name || 'Media';
    const mediaType = message.media_type || message.file_mime || '';

    switch (message.message_type) {
      case 'image':
        return (
          <div 
            className="cursor-pointer rounded-lg overflow-hidden"
            onClick={() => onImageClick(mediaSource)}
          >
            <img 
              src={mediaSource} 
              alt={mediaName}
              className="max-w-full max-h-80 object-cover hover:opacity-90 transition"
            />
            {message.content && (
              <div className="p-2 text-sm">
                {renderParsedText(message.content)}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="rounded-lg overflow-hidden bg-black">
            <video 
              src={mediaSource} 
              controls
              className="max-w-full max-h-80"
              preload="metadata"
            />
            {message.content && (
              <div className="p-2 text-sm">
                {renderParsedText(message.content)}
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <a
            href={mediaSource}
            download={mediaName}
            className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition min-w-[240px]"
          >
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {getFileIcon(mediaType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mediaName}</p>
              <p className="text-xs opacity-70">
                {getFileExtension(mediaName)} • {formatFileSize(message.file_size || 0)}
              </p>
            </div>
            <div className="text-xl">⬇️</div>
          </a>
        );

      default:
        return message.content && (
          <div className="text-sm whitespace-pre-wrap break-words">
            {renderParsedText(message.content)}
          </div>
        );
    }
  };

  const renderParsedText = (text: string) => {
    const segments = parseMessage(text);
    
    return segments.map((segment, idx) => {
      if (segment.type === 'text') {
        return <span key={idx}>{segment.content}</span>;
      }
      
      if (segment.type === 'link') {
        return (
          <a
            key={idx}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            {segment.content}
          </a>
        );
      }
      
      if (segment.type === 'email') {
        return (
          <a
            key={idx}
            href={segment.href}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {segment.content}
          </a>
        );
      }
      
      if (segment.type === 'phone') {
        return (
          <a
            key={idx}
            href={segment.href}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {segment.content}
          </a>
        );
      }
      
      return <span key={idx}>{segment.content}</span>;
    });
  };

  return (
    <div 
      className={`flex gap-2 group mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 2000)}
    >
      {!isOwn && (
        <img 
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
        />
      )}

      <div className={`relative max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
        {message.reply_content && (
          <div className="mb-1 p-2 bg-black/20 rounded-t-lg border-l-4 border-emerald-500 text-xs">
            <p className="font-bold text-emerald-400 truncate">
              {message.reply_sender_name || 'User'}
            </p>
            <p className="truncate opacity-80">
              {message.reply_type === 'text' ? message.reply_content : `📎 ${message.reply_type}`}
            </p>
          </div>
        )}

        <div 
          className={`rounded-lg shadow-md overflow-hidden ${
            isOwn 
              ? 'bg-green-700 text-white rounded-tr-none' 
              : 'bg-gray-800 text-white rounded-tl-none border border-gray-700'
          } ${message.reply_content ? 'rounded-t-none' : ''}`}
        >
          {!isOwn && (
            <p className={`px-3 pt-2 pb-1 text-xs font-bold ${isVerified ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {displayName}
            </p>
          )}

          <div className="px-3 pb-1">
            {renderContent()}
          </div>

          <div className={`flex items-center gap-1 px-3 pb-1 justify-end text-[10px] ${isOwn ? 'text-emerald-200/70' : 'text-gray-400'}`}>
            <span>{formatMessageTime(message.created_at)}</span>
            {isOwn && (
              <span className={message.is_read ? 'text-blue-400' : ''}>
                {message.is_read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 z-10 
            ${isOwn ? 'right-full mr-1 sm:-left-16 sm:right-auto sm:mr-0' : 'left-full ml-1 sm:-right-16 sm:left-auto sm:ml-0'}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReply(message);
              }}
              className="w-9 h-9 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-full flex items-center justify-center text-sm shadow-lg transition border border-gray-700"
              title="Reply"
            >
              ↩️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}