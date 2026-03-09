import React, { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import ModalPortal from './ModalPortal';

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

// // Predefined background images
// const backgroundImages = [
//   '/assets/Images/Cake.png', // Pink plates with floral pattern
//   '/assets/Images/Steps.png', // Pink tulip
//   '/assets/Images/tea.png', // White cake on olive background
//   '/assets/Images/couple-profile-bg.png', // Current dining table setting
// ];
const backgroundImages = [
  '/assets/Images/Background_Hands_Export.png',
  '/assets/Images/Background_Birds_Export.png',
  '/assets/Images/Background_Heart_Export.png',
];
const TempDisplayBackgroundImages = [
  '/assets/Images/hand.png',
  '/assets/Images/birds.png',
  '/assets/Images/hearts.png',
];

// Helper functions for localStorage
const getStoredBackgroundImages = () => {
  try {
    const stored = localStorage.getItem('editBackgroundImagePopup_uploadedImages');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveBackgroundImageToStorage = (imageData) => {
  try {
    const existingImages = getStoredBackgroundImages();
    const newImage = {
      id: Date.now(),
      data: imageData,
      timestamp: new Date().toISOString()
    };
    const updatedImages = [...existingImages, newImage];
    localStorage.setItem('editBackgroundImagePopup_uploadedImages', JSON.stringify(updatedImages));
    return newImage;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return null;
  }
};

const removeBackgroundImageFromStorage = (imageId) => {
  try {
    const existingImages = getStoredBackgroundImages();
    const updatedImages = existingImages.filter(img => img.id !== imageId);
    localStorage.setItem('editBackgroundImagePopup_uploadedImages', JSON.stringify(updatedImages));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export default function EditBackgroundImagePopup({ isOpen, onClose, onSave }) {
  const [imageSrc, setImageSrc] = useState('/assets/Images/back3.png');
  const [crop, setCrop] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();
  const previewRef = useRef(null);
  const [cropperSize, setCropperSize] = useState({ width: 600, height: 230 });
  const [minZoom, setMinZoom] = useState(1);
  const [cropBoundaries, setCropBoundaries] = useState({ top: 0, bottom: 0 });
  const bannerAspectRatio = 3 / 1; // 3:1 aspect ratio for wide banner images

  // Load stored images when component mounts
  useEffect(() => {
    if (isOpen) {
      const storedImages = getStoredBackgroundImages();
      setUploadedImages(storedImages);
    }
  }, [isOpen]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // measure preview area so cropSize matches visible container
  useEffect(() => {
    function updateSize() {
      if (previewRef.current) {
        const rect = previewRef.current.getBoundingClientRect();
        const width = Math.max(10, Math.round(rect.width));
        const height = Math.max(10, Math.round(rect.height));
        setCropperSize({ width, height });

        // Calculate crop area boundaries for banner aspect ratio (3:1)
        const cropHeight = width / bannerAspectRatio; // fit crop to full width, then compute height
        const topMargin = (height - cropHeight) / 2;
        const topPercent = Math.max(0, (topMargin / height) * 100);
        const bottomPercent = topPercent;
        setCropBoundaries({ top: topPercent, bottom: bottomPercent });
      }
    }

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen, imageSrc, bannerAspectRatio]);

  // Ensure the image initially covers the crop area — compute minZoom from media size
  const onMediaLoaded = useCallback((mediaSize) => {
    try {
      if (!cropperSize.width || !cropperSize.height) return;
      
      // Calculate the crop area dimensions based on banner aspect ratio (3:1)
      const cropWidth = cropperSize.width;
      const cropHeight = cropWidth / bannerAspectRatio;
      
      // Calculate minimum zoom to cover the crop area
      const widthRatio = cropWidth / mediaSize.width;
      const heightRatio = cropHeight / mediaSize.height;
      const requiredMinZoom = Math.max(widthRatio, heightRatio, 1);
      
      setMinZoom(requiredMinZoom);
      // Increase zoom slightly to allow image to move toward bottom-right
      const adjustedZoom = requiredMinZoom * 1.3; // 30% more zoom to create room for repositioning
      setZoom(adjustedZoom);
      
      // Position the image to bottom-right using crop coordinates
      // Higher values move viewport toward bottom-right corner
      const offsetX = -50; // Move viewport 90% from left (far right)
      const offsetY = -10; // Move viewport 90% from top (far bottom)
      setCrop({ x: offsetX, y: offsetY });
    } catch (err) {
      console.error('Error computing min zoom:', err);
    }
  }, [cropperSize, bannerAspectRatio]);

  const processImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const imageData = reader.result;
        setImageSrc(imageData);
        
        // Save the uploaded image to storage
        const savedImage = saveBackgroundImageToStorage(imageData);
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
    const croppedBlob = await getCroppedImg(imageSrc, crop, zoom, bannerAspectRatio, croppedAreaPixels);
    if (onSave) onSave(croppedBlob);
    onClose();
  };

  const handleThumbnailClick = (imagePath) => {
    setImageSrc(imagePath);
  };

  const handleRemoveImage = (imageId) => {
    removeBackgroundImageFromStorage(imageId);
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    // If the removed image was currently selected, reset to default
    if (imageSrc && uploadedImages.find(img => img.id === imageId)?.data === imageSrc) {
      setImageSrc('/assets/Images/back3.png');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50">
        <div className="bg-[#ffffff] w-[68.25vw] h-[38vw] max-h-[80vh] max-w-[90vw] px-[6.12vw] py-[2.75vw] relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-[0.833] max-[1024px]:mb-[10px]">
            <h2 className="text-2xl lg:text-[1vw] xl:text-[1vw] 2xl:text-[1vw] lg:leading-[1.5v] xl:leading-[1.5v] 2xl:leading-[1.5v] font-[500] bastardogrotesk m-0 max-[1024px]:text-[20px] max-[1024px]:leading-[20px]">ADD YOUR BACKGROUND IMAGE</h2>
            <button
              onClick={onClose}
              className="text-[29px] leading-[29px] font-bold text-[#000000] absolute top-[10px] right-[20px] cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="flex gap-[5vw] lg:h-[27.12vw] xl:h-[27.12vw] 2xl:h-[27.12vw] max-[1024px]:flex-col max-[1024px]:gap-[40px]">
            {/* Left: Large Preview Area */}
            <div className="w-2/3 lg:w-[32.33vw] xl:w-[32.33vw] 2xl:w-[32.33vw] h-full max-[1024px]:h-[300px] max-[1024px]:w-full">
              <div
                ref={previewRef}
                className={`relative w-full h-full bg-gray-100 ${isDragging ? 'border-4 border-blue-400 border-dashed bg-blue-50' : ''} transition-all`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imageSrc ? (
                  <Suspense fallback={<div>Loading cropper...</div>}>
                    <Cropper
                      key={imageSrc}
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={bannerAspectRatio}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      onMediaLoaded={onMediaLoaded}
                      showGrid={false}
                      cropSize={{
                        width: cropperSize.width,
                        height: Math.round(cropperSize.width / bannerAspectRatio),
                      }}
                      minZoom={minZoom}
                      maxZoom={5}
                      restrictPosition={true}
                    />
                    {/* Dark overlay over top area (outside crop zone) */}
                    <div className="pointer-events-none absolute left-0 right-0 w-full z-10" style={{ top: 0, height: `${cropBoundaries.top}%`, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
                    
                    {/* Persistent horizontal guide lines (top & bottom) to match actual crop area boundaries */}
                    <div className="pointer-events-none absolute inset-0 z-20">
                      <div className="absolute left-0 right-0 w-full h-[1px] bg-white opacity-60" style={{ top: `${cropBoundaries.top}%` }} />
                      <div className="absolute left-0 right-0 w-full h-[1px] bg-white opacity-60" style={{ bottom: `${cropBoundaries.bottom}%` }} />
                    </div>

                    {/* Dark overlay over bottom area (outside crop zone) */}
                    <div className="pointer-events-none absolute left-0 right-0 w-full z-10" style={{ bottom: 0, height: `${cropBoundaries.bottom}%`, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
                  </Suspense>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {isDragging ? (
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">Drop image here</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-lg font-semibold">No image selected</p>
                        <p className="text-sm text-gray-400 mt-2">Drag and drop an image here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-right bastardogrotesk text-sm lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw] mt-2 text-[#000000]">
                DRAG TO REPOSITION / SCROLL TO ZOOM IN OR OUT
              </p>
            </div>

            {/* Right: Thumbnail Options */}
            <div className="w-1/3 lg:w-[32vw] xl:w-[32vw] 2xl:w-[32vw] max-[1024px]:w-full">
              <div className="grid grid-cols-4 gap-[1.354vw] max-h-full items-start max-[1024px]:flex max-[1024px]:flex-wrap">
                {/* Predefined background images */}
                {TempDisplayBackgroundImages.map((img, index) => (
                  <div 
                    key={`predefined-${index}`} 
                    className="cursor-pointer w-[5.885vw] h-[5.885vw] max-[1024px]:w-[60px] max-[1024px]:h-[60px]"
                    onClick={() => handleThumbnailClick(backgroundImages[index])}
                  >
                    <img
                      src={img}
                      alt={`Background option ${index + 1}`}
                      className="w-full h-full object-cover rounded-none"
                    />
                  </div>
                ))}
                
                {/* Uploaded images */}
                {uploadedImages.map((uploadedImg) => (
                  <div 
                    key={uploadedImg.id} 
                    className="cursor-pointer w-[5.885vw] h-[5.885vw] max-[1024px]:w-[60px] max-[1024px]:h-[60px] relative group"
                    onClick={() => handleThumbnailClick(uploadedImg.data)}
                  >
                    <img
                      src={uploadedImg.data}
                      alt="Uploaded background"
                      className="w-full h-full object-cover rounded-none"
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
                  className="cursor-pointer border-2 border-dashed border-[#999898] relative w-[5.885vw] h-[5.885vw] max-[1024px]:w-[60px] max-[1024px]:h-[60px] flex flex-col items-center justify-center hover:border-blue-400"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <div className="text-3xl text-gray-400 mb-1">
                    <svg width="1.563vw" height="1.563vw" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20.5" cy="20.5" r="20.5" fill="#D9D9D9"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1474 11.7148C22.0161 11.7148 22.7202 12.419 22.7202 13.2876L22.7202 19.5786L29.0112 19.5786C29.8798 19.5786 30.584 20.2827 30.584 21.1514C30.584 22.02 29.8798 22.7241 29.0112 22.7241H22.7202L22.7202 29.0151C22.7202 29.8837 22.0161 30.5879 21.1474 30.5879C20.2788 30.5879 19.5747 29.8837 19.5747 29.0151L19.5747 22.7241H13.2837C12.4151 22.7241 11.7109 22.02 11.7109 21.1514C11.7109 20.2827 12.4151 19.5786 13.2837 19.5786H19.5747L19.5747 13.2876C19.5747 12.419 20.2788 11.7148 21.1474 11.7148Z" fill="white"/>
                    </svg>
                  </div>
                  <p className="text-xs bastardogrotesk text-[#000000] text-center absolute lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw] bottom-[-40px] max-[1024px]:bottom-[0px] max-[1024px]:relative max-[1024px]:text-[8px] max-[1024px]:leading-[10px]">ADD YOUR OWN</p>
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
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-[#446184] text-white rounded hover:bg-[#3a5470] cursor-pointer"
              onClick={handleSave}
              type="button"
              disabled={!imageSrc || !croppedAreaPixels}
            >
              Save Background
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
} 