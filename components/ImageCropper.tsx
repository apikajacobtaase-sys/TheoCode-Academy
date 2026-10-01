'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop';
interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  const onCropCompleteCallback = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels!);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Crop error:', error);
    }
  };

  const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        const size = 400;
        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          size,
          size
        );

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      image.onerror = reject;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">Crop Your Profile Picture</h2>
        
        {/* 🎯 FIXED: Cropper Area with max-height */}
        <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden mb-4 flex-shrink-0" style={{ height: '400px', maxHeight: '60vh' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={true}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Zoom Slider */}
        <div className="mb-4 flex-shrink-0">
          <label className="text-sm text-gray-400 mb-2 block">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* 🎯 FIXED: Action Buttons always visible */}
        <div className="flex gap-3 flex-shrink-0 mt-auto">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-white transition"
          >
            ✅ Save Photo
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}