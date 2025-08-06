import React, { useState, useCallback, useRef, lazy, Suspense } from 'react';

const Cropper = typeof window !== 'undefined'
  ? lazy(() => import('react-easy-crop'))
  : () => null;

function getCroppedImg(imageSrc, crop, zoom, aspect, croppedAreaPixels) {
  // Utility to crop the image using canvas
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    };
    image.onerror = (e) => reject(e);
  });
}

// Predefined background images
const backgroundImages = [
  '/assets/Images/Cake.png', // Pink plates with floral pattern
  '/assets/Images/Steps.png', // Pink tulip
  '/assets/Images/tea.png', // White cake on olive background
  '/assets/Images/couple-profile-bg.png', // Current dining table setting
];

export default function EditBackgroundImagePopup({ isOpen, onClose, onSave }) {
  const [imageSrc, setImageSrc] = useState('/assets/Images/couple-profile-bg.png');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef();

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, crop, zoom, 16/9, croppedAreaPixels);
    if (onSave) onSave(croppedBlob);
    onClose();
  };

  const handleThumbnailClick = (imagePath) => {
    setImageSrc(imagePath);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50">
      <div className="bg-white w-[95%] max-w-6xl p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">ADD YOUR BACKGROUND IMAGE</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        <div className="flex gap-8">
          {/* Left: Large Preview Area */}
          <div className="w-2/3">
            <div className="relative w-full h-[400px] bg-gray-100">
              <Suspense fallback={<div>Loading cropper...</div>}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16/9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={false}
                  cropSize={{ width: 400, height: 225 }}
                />
              </Suspense>
            </div>
            <p className="text-center text-sm mt-2 text-gray-600">
              DRAG TO REPOSITION
            </p>
          </div>

          {/* Right: Thumbnail Options */}
          <div className="w-1/3">
            <div className="grid grid-cols-2 gap-4">
              {backgroundImages.map((img, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer"
                  onClick={() => handleThumbnailClick(img)}
                >
                  <img
                    src={img}
                    alt={`Background option ${index + 1}`}
                    className="w-full h-24 object-cover rounded border-2 hover:border-blue-400"
                  />
                </div>
              ))}
              
              {/* Add Your Own Button */}
              <div 
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center h-24 hover:border-blue-400"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <div className="text-3xl text-gray-400 mb-1">+</div>
                <p className="text-xs text-gray-600 text-center">ADD YOUR OWN</p>
              </div>
            </div>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-[#446184] text-white rounded hover:bg-[#3a5470]"
            onClick={handleSave}
            type="button"
            disabled={!imageSrc || !croppedAreaPixels}
          >
            Save Background
          </button>
        </div>
      </div>
    </div>
  );
} 