'use client';

interface ImagePreviewProps {
  src: string;
  onClose: () => void;
}

export default function ImagePreview({ src, onClose }: ImagePreviewProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'image.jpg';
    link.click();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-xl z-10"
      >
        ✕
      </button>
      
      <button
        onClick={handleDownload}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white text-sm font-bold z-10"
      >
        ⬇️ Download
      </button>

      <img 
        src={src} 
        alt="Preview"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}