import React, {useState, useEffect} from 'react';

const ImageUpload = ({onImageChange, initialImage}) => {
  const [image, setImage] = useState(null);

  // Update state if initialImage prop changes
  useEffect(() => {
    setImage(initialImage);
  }, [initialImage]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    console.log(file, 'File');
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl); // Update the displayed image
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
      {!image ? (
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
          src={image}
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
