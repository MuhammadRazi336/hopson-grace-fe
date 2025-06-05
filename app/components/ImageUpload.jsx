import React, {useState, useEffect} from 'react';

const ImageUpload = ({onImageChange, initialImage}) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Update state if initialImage prop changes
  useEffect(() => {
    setImage(initialImage);
    setPreviewUrl(null); // Reset preview when initialImage changes (e.g., after upload)
  }, [initialImage]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl); // Show preview
      onImageChange(file); // Notify the parent component with the file
    }
  };
  return (
    <div
      style={{
        backgroundColor: '#e0e0e0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {!image && !previewUrl ? (
        <label
          htmlFor="image-upload"
          style={{
            cursor: 'pointer',
            padding: '10px 20px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          Upload New Photo
        </label>
      ) : (
        <img
          src={
            previewUrl || (typeof image === 'string' ? image : image?.fileUrl)
          }
          alt="Uploaded"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('image-upload').click()}
        />
      )}
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
            className="max-w-full max-h-full object-cover"
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
