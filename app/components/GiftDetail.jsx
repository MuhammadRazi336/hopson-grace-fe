import React, {useState} from 'react';
import {Money} from '@shopify/hydrogen';

const GiftDetail = ({
  productTitle,
  productDescription,
  productPrice,
  productImages,
  onRegistryPress,
}) => {
  const [selectedImage, setSelectedImage] = useState(productImages[0]); // Default to the first image
  const [quantity, setQuantity] = useState(1);
  const [isGroupGift, setIsGroupGift] = useState(false);

  const handleRegistryPress = () => {
    onRegistryPress({
      quantity,
      isGroupGift,
    });
  };

  return (
    <div className="max-w-8xl mx-auto m-2 p-4 bg-white rounded-lg flex flex-col lg:flex-row">
      {/* Left Section: Image */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full flex items-center justify-center rounded-md h-96">
          <img
            src={selectedImage.node.src}
            alt="Selected product"
            className="w-full h-96 object-contain rounded-md"
          />
        </div>
        <div className="flex gap-2 mt-4">
          {/* Thumbnails */}
          {productImages.map((image, index) => (
            <div
              key={index}
              className={`cursor-pointer w-28 h-28 rounded-md flex items-center justify-center ${
                selectedImage.node.src === image.node.src
                  ? 'border-2 border-black'
                  : ''
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.node.src}
                alt={`Thumbnail ${index + 1}`}
                className="w-12 h-12 object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Product Details */}
      <div className="flex-1 ml-0 lg:ml-6 mt-6 lg:mt-0">
        <h1 className="text-2xl font-bold">{productTitle}</h1>
        <p className="text-gray-600 mt-2">{productDescription}</p>
        <Money className="text-xl font-semibold mt-4" data={productPrice} />
        <div className="mt-4">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={isGroupGift}
              onChange={() => setIsGroupGift(!isGroupGift)}
              className="w-5 h-5"
            />
            Tag as group gift?
          </label>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            className="w-16 p-2 border rounded-md text-center"
          />
          <button
            onClick={handleRegistryPress}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Add to Registry
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftDetail;
