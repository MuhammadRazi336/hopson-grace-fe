import React, { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import ModalPortal from './ModalPortal';

const images = [
  '/assets/Images/profilePicDefault.png',
  '/assets/Images/product-image-new.png',
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

export default function EditImagePopup({ isOpen, onClose, onSave, initialFile = null, onInitialFileConsumed }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();

  // Load stored images when component mounts
  useEffect(() => {
    if (isOpen) {
      const storedImages = getStoredImages();
      setUploadedImages(storedImages);
    }
  }, [isOpen]);

  // When opened with a dropped/initial file, load it into the cropper
  useEffect(() => {
    if (isOpen && initialFile && initialFile.type?.startsWith('image/')) {
      processImageFile(initialFile);
      onInitialFileConsumed?.();
    }
  }, [isOpen, initialFile]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const processImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
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

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
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
    <ModalPortal>
      <div className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50">
        <div className="bg-[#fff] w-[68.25vw] h-[38vw] max-h-[80vh] max-w-[90vw] px-[6.12vw] py-[2.75vw] relative">
          <h2 className="text-2xl lg:text-[1vw] xl:text-[1vw] 2xl:text-[1vw] lg:leading-[1.5v] xl:leading-[1.5v] 2xl:leading-[1.5v] font-[500] bastardogrotesk m-0 max-[1024px]:text-[20px] max-[1024px]:leading-[20px]">UPLOAD YOUR PROFILE IMAGE</h2>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-[29px] leading-[29px] font-bold text-[#000000] absolute top-[10px] right-[20px] cursor-pointer"
          >
            &times;
          </button>

          <div className="flex gap-[5vw] lg:h-[27.12vw] xl:h-[27.12vw] 2xl:h-[27.12vw] max-[1024px]:flex-col max-[1024px]:gap-[40px]">
            {/* Left: Cropper or Preview */}
            <div className="w-2/3 lg:w-[32.33vw] xl:w-[32.33vw] 2xl:w-[32.33vw] h-full max-[1024px]:h-[300px] max-[1024px]:w-full">
              {imageSrc ? (
                <div 
                  className={`relative w-full h-full bg-gray-100 ${isDragging ? 'border-4 border-blue-400 border-dashed bg-blue-50' : ''} transition-all`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Suspense fallback={<div>Loading cropper...</div>}>
                    <div className="relative w-full h-full mx-auto">
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
                <div 
                  className={`relative w-full h-full ${isDragging ? 'border-4 border-blue-400 border-dashed bg-blue-50' : ''} transition-all`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragging ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">Drop image here</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src="/assets/Images/product-image-new.png"
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              <p className="text-right bastardogrotesk text-sm lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw] mt-2 text-[#000000]">
                DRAG TO REPOSITION / SCROLL TO ZOOM IN OR OUT
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
            <div className="w-1/3 lg:w-[32vw] xl:w-[32vw] 2xl:w-[32vw] max-[1024px]:w-full grid grid-cols-4 gap-[1.354vw] max-h-full items-start max-[1024px]:flex max-[1024px]:flex-wrap">
              {/* Predefined images */}
              {images.map((img, index) => (
                <div key={`predefined-${index}`} className="cursor-pointer w-[5.885vw] h-[5.885vw] max-[1024px]:w-[60px] max-[1024px]:h-[60px]">
                  <img
                    src={img}
                    alt={`thumb-${index}`}
                    className="w-full h-full object-cover rounded-none"
                    onClick={() => setImageSrc(img)}
                  />
                </div>
              ))}
              
              {/* Uploaded images */}
              {uploadedImages.map((uploadedImg) => (
                <div key={uploadedImg.id} className="cursor-pointer w-[5.885vw] h-[5.885vw] max-[1024px]:w-[60px] max-[1024px]:h-[60px]">
                  <img
                    src={uploadedImg.data}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded-none"
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
                className="cursor-pointer border-2 border-dashed border-[#999898] relative w-[5.885vw] h-[5.885vw] max-[1024px]:w-[60px] max-[1024px]:h-[60px] flex flex-col items-center justify-center bg-[#F1F1F1] hover:border-blue-400"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <div className="text-3xl text-gray-400 mb-1">
                  <svg width="2.085vw" height="2.085vw" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20.5" cy="20.5" r="20.5" fill="#D9D9D9"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M21.1474 11.7148C22.0161 11.7148 22.7202 12.419 22.7202 13.2876L22.7202 19.5786L29.0112 19.5786C29.8798 19.5786 30.584 20.2827 30.584 21.1514C30.584 22.02 29.8798 22.7241 29.0112 22.7241H22.7202L22.7202 29.0151C22.7202 29.8837 22.0161 30.5879 21.1474 30.5879C20.2788 30.5879 19.5747 29.8837 19.5747 29.0151L19.5747 22.7241H13.2837C12.4151 22.7241 11.7109 22.02 11.7109 21.1514C11.7109 20.2827 12.4151 19.5786 13.2837 19.5786H19.5747L19.5747 13.2876C19.5747 12.419 20.2788 11.7148 21.1474 11.7148Z" fill="white"></path></svg>
                </div>
                <p className="text-xs bastardogrotesk text-[#000000] text-center absolute lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw] bottom-[-40px] max-[1024px]:bottom-[0px] max-[1024px]:relative max-[1024px]:text-[8px] max-[1024px]:leading-[10px]">ADD YOUR OWN</p>
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
    </ModalPortal>
  );
}
