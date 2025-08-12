import React, { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';

const images = [
  '/assets/Images/registry-logo.png',
  '/assets/Images/couple-picture.png',
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

// Helper functions for localStorage
const getStoredImages = () => {
  try {
    const stored = localStorage.getItem('editImagePopup_uploadedImages');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveImageToStorage = (imageData) => {
  try {
    const existingImages = getStoredImages();
    const newImage = {
      id: Date.now(),
      data: imageData,
      timestamp: new Date().toISOString()
    };
    const updatedImages = [...existingImages, newImage];
    localStorage.setItem('editImagePopup_uploadedImages', JSON.stringify(updatedImages));
    return newImage;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return null;
  }
};

const removeImageFromStorage = (imageId) => {
  try {
    const existingImages = getStoredImages();
    const updatedImages = existingImages.filter(img => img.id !== imageId);
    localStorage.setItem('editImagePopup_uploadedImages', JSON.stringify(updatedImages));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export default function EditImagePopup({ isOpen, onClose, onSave }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef();

  // Load stored images when component mounts
  useEffect(() => {
    if (isOpen) {
      const storedImages = getStoredImages();
      setUploadedImages(storedImages);
    }
  }, [isOpen]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const imageData = reader.result;
        setImageSrc(imageData);
        
        // Save the uploaded image to storage
        const savedImage = saveImageToStorage(imageData);
        if (savedImage) {
          setUploadedImages(prev => [...prev, savedImage]);
        }
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

  const handleImageSelect = (imageData) => {
    setImageSrc(imageData);
  };

  const handleRemoveImage = (imageId) => {
    removeImageFromStorage(imageId);
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    // If the removed image was currently selected, clear the selection
    if (imageSrc && uploadedImages.find(img => img.id === imageId)?.data === imageSrc) {
      setImageSrc(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50">
      <div className="bg-[#F5F2ED] w-[90%] max-w-5xl p-8 relative flex flex-col gap-6 shadow-2xl">
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
                  <div className="relative w-[360px] h-[360px] mx-auto">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      cropShape="round"
                      showGrid={false}
                      cropSize={{ width: 300, height: 300 }}
                    />
                  </div>
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
          </div>

          {/* Image Picker */}
          <div className="w-1/2 flex flex-wrap h-[220px] gap-x-4 gap-y-2 justify-start items-start overflow-y-auto">
            {/* Predefined images */}
            {images.map((img, index) => (
              <div key={`predefined-${index}`} className="cursor-pointer relative">
                <img
                  src={img}
                  alt={`thumb-${index}`}
                  className="object-cover w-[100px] h-[100px]"
                  onClick={() => setImageSrc(img)}
                />
              </div>
            ))}
            
            {/* Uploaded images */}
            {uploadedImages.map((uploadedImg) => (
              <div key={uploadedImg.id} className="cursor-pointer relative group">
                <img
                  src={uploadedImg.data}
                  alt="Uploaded"
                  className="object-cover w-[100px] h-[100px]"
                  onClick={() => handleImageSelect(uploadedImg.data)}
                />
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(uploadedImg.id);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* Add Your Own Button */}
            <div 
              className="cursor-pointer border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center w-[100px] h-[100px] hover:border-blue-400"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <div className="text-3xl text-gray-400 mb-1">+</div>
              <p className="text-xs text-gray-600 text-center">ADD YOUR OWN</p>
            </div>
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
