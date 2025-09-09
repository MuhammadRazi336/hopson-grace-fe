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
    <div className="max-w-[1500px] mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row">
        {/* Left Section: Product Images */}
        <div className="lg:w-1/2">
          {/* Main Product Image */}
          <div className="w-[690px] h-[690px] aspect-square bg-gray-50 rounded-lg overflow-hidden mb-6">
            <img
              src={selectedImage?.node?.src || '/fallback-image.jpg'}
              alt={productTitle || 'Product image'}
              className="w-[690px] h-[690px] object-contain"
            />
          </div>

          {/* Thumbnail Images */}
          {safeProductImages.length > 1 && (
            <div className="flex w-[690px] gap-3">
              {safeProductImages.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer w-[125px] h-[125px] overflow-hidden border-b-2 transition-all ${
                    selectedImage?.node?.src === image?.node?.src
                      ? 'border-b-gray-800'
                      : 'border-b-gray-200 hover:border-b-gray-400'
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
        <div className="lg:w-1/2">
          {/* Brand */}
          <div className="text-[22px] font-medium text-gray-600 mb-2">
            {productBrand}
          </div>

          {/* Product Title */}
          <h1 className="prata text-3xl lg:text-[44px] font-bold text-gray-900 mb-4 leading-tight">
            {productTitle}
          </h1>

          {/* Price */}
          <div className="text-[28px] font-semibold text-gray-900 mb-6">
            <Money data={productPrice} />
          </div>

          {/* Quantity Selector */}

          <div className="flex items-center w-full mb-4 gap-6">
            <p className="text-[22px] font-bold uppercase text-left mb-1">QTY</p>
            {/* Quantity Selector */}
            <div className="flex flex-col items-center">
              <button
                onClick={incrementQuantity}
                className=" flex items-center justify-center bg-white transition-colors"
              >
                <img
                  src="/assets/Images/arrowDown.png"
                  className="w-[20px] h-[20px] rotate-180"
                  alt=""
                />
              </button>

              <input
                value={quantity}
                className="w-16 h-16 text-center border-none outline-none text-[40px]"
                readOnly
              />

              <button
                onClick={decrementQuantity}
                className="flex items-center justify-center bg-white transition-colors"
              >
                <img
                  src="/assets/Images/arrowDown.png"
                  className="w-[20px] h-[20px]"
                  alt=""
                />
              </button>
            </div>

            {/* Add to Registry Button */}
            <button
              onClick={handleRegistryPress}
              className="bg-[#446184] text-white text-[18px] font-bold w-[320px] h-[80px] px-6"
            >
              ADD TO REGISTRY
            </button>

            <div className="flex items-center gap-3 pl-6">
              <input
                type="checkbox"
                id="groupGift"
                checked={isGroupGift}
                onChange={() => setIsGroupGift(!isGroupGift)}
                className="w-[45px] h-[45px] border-2 border-black appearance-none rounded-full checked:bg-[#446184] checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:flex checked:after:items-center checked:after:justify-center checked:after:w-full checked:after:h-full"
              />
              <label
                htmlFor="groupGift"
                className="text-[12px] font-medium text-black cursor-pointer text-center"
              >
                TAG AS <br /> GROUP GIFT
              </label>
            </div>
          </div>

          {/* Product Description */}
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 text-[22px] leading-relaxed py-3">
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
