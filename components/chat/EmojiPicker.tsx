'use client';

import { QUICK_EMOJIS } from '@/lib/chatUtils';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-3 z-30 w-72">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
        <span className="text-xs font-bold text-gray-400">Quick Emojis</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">✕</button>
      </div>
      <div className="grid grid-cols-8 gap-1">
        {QUICK_EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center text-xl transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}