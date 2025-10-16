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
      : [{node: {url: '/fallback-image.jpg', altText: 'Fallback image'}}];
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
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-[3.438vw] w-full">
        {/* Left Section: Product Images */}
        <div className="lg:min-w-[42%] xl:min-w-[42%] 2xl:min-w-[42%] lg:w-[42%] xl:w-[42%] 2xl:w-[42%] w-1/2">
          {/* Main Product Image */}
          <div className="w-full bg-gray-50 rounded-none overflow-hidden mb-6">
            <img
              src={selectedImage?.node?.url || '/fallback-image.jpg'}
              alt={selectedImage?.node?.altText || productTitle || 'Product image'}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Thumbnail Images */}
          {safeProductImages.length > 1 && (
            <div className="flex w-[36.08vw] gap-3">
              {safeProductImages.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer w-[125px] h-[125px] overflow-hidden border-b-2 transition-all ${
                    selectedImage?.node?.url === image?.node?.url
                      ? 'border-b-gray-800'
                      : 'border-b-gray-200 hover:border-b-gray-400'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image?.node?.url || '/fallback-image.jpg'}
                    alt={image?.node?.altText || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Product Information */}
        <div className="lg:w-[39.063vw] xl:w-[39.063vw] 2xl:w-[39.063vw] w-1/2">
          {/* Brand */}
          <div className="text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] font-medium mb-[1.198vw]">
            {productBrand}
          </div>

          {/* Product Title */}
          <h1 className="prata lowercase text-2xl lg:text-[2.292vw] xl:text-[2.292vw] 2xl:text-[2.292vw] lg:leading-[1.875vw] font-bold mt-0 mb-[1.146vw]">
            {productTitle}
          </h1>

          {/* Price */}
          <div className="text-[28px] lg:text-[1.458vw] xl:text-[1.458vw] 2xl:text-[1.458vw] font-semibold text-gray-900 mb-[2.76vw]">
            <Money data={productPrice} />
          </div>

          {/* Quantity Selector */}

          <div className="flex items-center w-full gap-6 lg:gap-[1.927vw] xl:gap-[1.927vw] 2xl:gap-[1.927vw]">
            <p className="text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] font-bold uppercase text-left mb-1">QTY</p>
            {/* Quantity Selector */}
            <div className="flex flex-col items-center">
              <button
                onClick={incrementQuantity}
                className=" flex items-center justify-center bg-white transition-colors"
              >
                <img
                  src="/assets/Images/arrowDown.png"
                  className="w-[20px] lg:w-[1.042vw] xl:w-[1.042vw] 2xl:w-[1.042vw] h-[20px] lg:h-[1.042vw] xl:h-[1.042vw] 2xl:h-[1.042vw] rotate-180"
                  alt=""
                />
              </button>

              <input
                value={quantity}
                className="w-16 h-16 text-center border-none outline-none text-[40px] lg:text-[2.083vw] xl:text-[2.083vw] 2xl:text-[2.083vw] lg:leading-[1.25vw]"
                readOnly
              />

              <button
                onClick={decrementQuantity}
                className="flex items-center justify-center bg-white transition-colors"
              >
                <img
                  src="/assets/Images/arrowDown.png"
                  className="w-[20px] lg:w-[1.042vw] xl:w-[1.042vw] 2xl:w-[1.042vw] h-[20px] lg:h-[1.042vw] xl:h-[1.042vw] 2xl:h-[1.042vw]"
                  alt=""
                />
              </button>
            </div>

            {/* Add to Registry Button */}
            <button
              onClick={handleRegistryPress}
              className="bg-[#446184] text-white text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] tracking-[0.8px] font-bold w-[320px] h-[80px] lg:w-[16.667vw] xl:w-[16.667vw] 2xl:w-[16.667vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] px-6"
            >
              ADD TO REGISTRY
            </button>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="groupGift"
                checked={isGroupGift}
                onChange={() => setIsGroupGift(!isGroupGift)}
                className="w-[45px] h-[45px] border-2 border-black appearance-none rounded-full checked:bg-[#446184] checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:flex checked:after:items-center checked:after:justify-center checked:after:w-full checked:after:h-full"
              />
              <label
                htmlFor="groupGift"
                className="text-[12px] lg:text-[0.625vw] xl:text-[0.625vw] 2xl:text-[0.625vw] font-medium text-black cursor-pointer text-center"
              >
                TAG AS <br /> GROUP GIFT
              </label>
            </div>
          </div>

          {/* Product Description */}
          <div className="prose prose-gray max-w-none">
            <div className="text-[22px] leading-relaxed lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] pt-[2.917vw]">
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
