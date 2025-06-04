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
          src={previewUrl || (typeof image === 'string' ? image : image?.fileUrl)}
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
        id="image-upload"
        style={{display: 'none'}}
        accept="image/*"
        onChange={handleImageChange}
      />
    </div>
  );
};

export default ImageUpload;
