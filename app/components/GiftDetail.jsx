import React, {useState} from 'react';
import {Money} from '@shopify/hydrogen';

const GiftDetail = ({
  productTitle,
  productDescription,
  productPrice,
  productImages,
  onRegistryPress,
  productBrand = 'HOPSON GRACE', // Default brand, can be passed as prop
}) => {
  // Defensive: ensure productImages is an array and has at least one image
  const safeProductImages =
    Array.isArray(productImages) && productImages.length > 0
      ? productImages
      : [{node: {src: '/fallback-image.jpg'}}];
  const [selectedImage, setSelectedImage] = useState(safeProductImages[0]); // Default to the first image
  const [quantity, setQuantity] = useState(1);
  const [isGroupGift, setIsGroupGift] = useState(false);

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleRegistryPress = () => {
    onRegistryPress({
      quantity,
      isGroupGift,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Section: Product Images */}
        <div className="lg:w-1/2">
          {/* Main Product Image */}
          <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden mb-6">
            <img
              src={selectedImage?.node?.src || '/fallback-image.jpg'}
              alt={productTitle || 'Product image'}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Thumbnail Images */}
          {safeProductImages.length > 1 && (
            <div className="flex gap-3">
              {safeProductImages.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage?.node?.src === image?.node?.src
                      ? 'border-gray-800'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image?.node?.src || '/fallback-image.jpg'}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Product Information */}
        <div className="lg:w-1/2 lg:pl-8">
          {/* Brand */}
          <div className="text-sm font-medium text-gray-600 mb-2">
            {productBrand}
          </div>

          {/* Product Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {productTitle}
          </h1>

          {/* Price */}
          <div className="text-2xl font-semibold text-gray-900 mb-6">
            <Money data={productPrice} />
          </div>

          {/* Quantity Selector */}

          <div className="flex items-center w-full mb-4">
            <p className="text-xs font-bold uppercase text-left mb-1">QTY</p>
            {/* Quantity Selector */}
            <div className="flex flex-col items-center">
              <button
                onClick={incrementQuantity}
                className=" flex items-center justify-center bg-white transition-colors"
              >
                <img
                  src="/assets/Images/arrowDown.png"
                  className="w-3 h-3 rotate-180"
                  alt=""
                />
              </button>

              <input
                value={quantity}
                className="w-16 h-8 text-center border-none outline-none text-sm"
                readOnly
              />

              <button
                onClick={decrementQuantity}
                className="flex items-center justify-center bg-white transition-colors"
              >
                <img
                  src="/assets/Images/arrowDown.png"
                  className="w-3 h-3"
                  alt=""
                />
              </button>
            </div>

            {/* Add to Registry Button */}
            <button
              onClick={handleRegistryPress}
              className="bg-[#446184] text-white text-xs font-bold py-4 px-6"
            >
              ADD TO REGISTRY
            </button>

            <div className="flex items-center gap-3 pl-6">
              <input
                type="checkbox"
                id="groupGift"
                checked={isGroupGift}
                onChange={() => setIsGroupGift(!isGroupGift)}
                className="w-7 h-7 border-2 border-black appearance-none rounded-full checked:bg-[#446184]"
              />
              <label
                htmlFor="groupGift"
                className="text-sm font-medium text-black cursor-pointer"
              >
                TAG AS GROUP GIFT ?
              </label>
            </div>
          </div>

          {/* Product Description */}
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed space-y-4">
              {productDescription ? (
                <p>{productDescription}</p>
              ) : (
                <>
                  <p>
                    Crafted in France Opinel's No. 116 Bread Knife is a kitchen
                    essential designed for daily use. Its gently curved
                    stainless steel blade slides through crusty baguettes,
                    sourdough boules, or your rustic home-baked loaf. The
                    beechwood handle offers comfort, balance, and a touch of
                    understated charm — a nod to the brand's heritage of
                    blending functional design with everyday utility.
                  </p>
                  <p>
                    An Opinel knife has become emblematic of French culture —
                    Pablo Picasso famously used one as a sculpture tool. Today,
                    Opinel is recognized in the Victoria & Albert Museum's
                    collection of the 100 most iconic designs, alongside the
                    Porsche 911 and the Rolex watch.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftDetail;
