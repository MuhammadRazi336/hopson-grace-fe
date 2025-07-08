import React, { useState, useCallback, useRef, lazy, Suspense } from 'react';

const images = [
  '/assets/Images/registry-logo.png',
  '/assets/Images/product2.png',
  '/assets/Images/tea.png',
  '/assets/Images/couple-picture.png',
  '/assets/Images/product-image.png',
  '/assets/Images/product-image.png',
  // '/assets/Images/placeholder-add-your-own.png',
];

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

export default function EditImagePopup({ isOpen, onClose, onSave }) {
  const [imageSrc, setImageSrc] = useState(null);
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
    const croppedBlob = await getCroppedImg(imageSrc, crop, zoom, 1, croppedAreaPixels);
    if (onSave) onSave(croppedBlob);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-5xl p-8 relative flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        <div className="flex gap-6">
          {/* Left: Cropper or Preview */}
          <div className="w-1/2 relative flex flex-col items-center">
            {imageSrc ? (
              <div className="relative w-full h-[360px] bg-gray-100">
                <Suspense fallback={<div>Loading cropper...</div>}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </Suspense>
              </div>
            ) : (
              <img
                src="/assets/Images/product-image.png"
                alt="Selected"
                className="w-full h-[360px] object-cover"
              />
            )}
            <p className="text-center text-sm mt-2 text-gray-600">
              DRAG TO REPOSITION
            </p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="mt-2 px-4 py-2 bg-[#446184] text-white rounded"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              type="button"
            >
              Upload Image
            </button>
          </div>

          {/* Image Picker */}
          <div className="w-1/2 flex flex-wrap h-[220px] gap-x-4 gap-y-2 justify-start items-start">
            {images.map((img, index) => (
              <div key={index} className="cursor-pointer">
                <img
                  src={img}
                  alt={`thumb-${index}`}
                  className="object-cover w-[100px] h-[100px]"
                  onClick={() => setImageSrc(img)}
                />
                {index === images.length - 1 && (
                  <p className="text-center text-sm mt-2 text-gray-600">
                    Add Your Own
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#446184] text-white rounded"
            onClick={handleSave}
            type="button"
            disabled={!imageSrc || !croppedAreaPixels}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
