import React from 'react';

const ImageUpload = ({initialImage, onImageChange}) => {
  const handleImageChange = (event) => {
    console.log('Image selected');
    const file = event.target.files[0];
    if (file) {
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      onImageChange({
        file,
        originalName: file.name,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    }
  };
  return (
    <div className="w-full h-full flex items-center justify-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
      >
        {initialImage ? (
          <img
            src={initialImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-500 text-center">
            <span className="block">Click to upload an image</span>
            <span className="text-sm block">or drag and drop</span>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;
