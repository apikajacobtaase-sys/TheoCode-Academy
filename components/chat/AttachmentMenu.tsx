'use client';

interface AttachmentMenuProps {
  onImageSelect: (file: File) => void;
  onVideoSelect: (file: File) => void;
  onFileSelect: (file: File) => void;
  onClose: () => void;
}

export default function AttachmentMenu({ onImageSelect, onVideoSelect, onFileSelect, onClose }: AttachmentMenuProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') onImageSelect(file);
    else if (type === 'video') onVideoSelect(file);
    else onFileSelect(file);
    
    onClose();
  };

  const options = [
    { type: 'image' as const, icon: '🖼️', label: 'Photo', accept: 'image/*', color: 'from-purple-500 to-pink-500' },
    { type: 'video' as const, icon: '🎬', label: 'Video', accept: 'video/*', color: 'from-red-500 to-orange-500' },
    { type: 'file' as const, icon: '📄', label: 'Document', accept: '*/*', color: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-20" onClick={onClose} />
      
      {/* Menu */}
      <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-2 z-30 w-56">
        {options.map((opt) => (
          <label
            key={opt.type}
            className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${opt.color} flex items-center justify-center text-xl`}>
              {opt.icon}
            </div>
            <span className="text-sm font-medium text-white">{opt.label}</span>
            <input
              type="file"
              accept={opt.accept}
              onChange={(e) => handleFileInput(e, opt.type)}
              className="hidden"
            />
          </label>
        ))}
      </div>
    </>
  );
}