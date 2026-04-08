import React, {useState, useMemo} from 'react';
import {Money} from '@shopify/hydrogen';

const GiftDetail = ({
  productTitle,
  productDescription,
  productPrice,
  productImages,
  variants: variantsProp,
  onRegistryPress,
  productBrand = 'HOPSON GRACE', // Default brand, can be passed as prop
  isLoggedIn = false, // Show quantity counter only when logged in
  isAdding = false, // Loading state for Add to Registry button
}) => {
  const variantList = useMemo(
    () => (Array.isArray(variantsProp) ? variantsProp : []),
    [variantsProp],
  );
  const showVariantPicker = variantList.length > 1;

  const [variantIndex, setVariantIndex] = useState(() => {
    const idx = variantList.findIndex((v) => v.availableForSale !== false);
    return idx >= 0 ? idx : 0;
  });

  const selectedVariant =
    variantList.length > 0
      ? variantList[Math.min(variantIndex, variantList.length - 1)]
      : null;

  const displayPrice = selectedVariant?.priceV2 || productPrice;
  // Defensive: ensure productImages is an array and has at least one image
  const allProductImages =
    Array.isArray(productImages) && productImages.length > 0
      ? productImages
      : [{node: {url: '/fallback-image.jpg', altText: 'Fallback image'}}];
  
  // If there are more than 4 images, show only the most recent 4
  const safeProductImages = allProductImages.length > 4 
    ? allProductImages.slice(-4) 
    : allProductImages;
  
  const hasExactlyFourImages = safeProductImages.length === 4;
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
      variant: selectedVariant,
    });
  };

  const heroImageUrl =
    selectedImage?.node?.url ||
    selectedVariant?.image?.url ||
    '/fallback-image.jpg';
  const heroImageAlt =
    selectedImage?.node?.altText ||
    selectedVariant?.image?.altText ||
    productTitle ||
    'Product image';

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-[3.438vw] w-full">
        {/* Left Section: Product Images */}
        <div className="lg:min-w-[42%] xl:min-w-[42%] 2xl:min-w-[42%] lg:w-[42%] xl:w-[42%] 2xl:w-[42%] w-1/2">
          {hasExactlyFourImages ? (
            /* 2x2 Grid Layout for 4 Images */
            <div className="grid grid-cols-2 gap-3 w-full">
              {safeProductImages.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer w-full aspect-square overflow-hidden border-2 transition-all bg-gray-50 ${
                    selectedImage?.node?.url === image?.node?.url
                      ? 'border-gray-800'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image?.node?.url || '/fallback-image.jpg'}
                    alt={image?.node?.altText || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Current Layout for Less Than 4 Images */
            <>
              {/* Main Product Image */}
              <div className="w-full bg-gray-50 rounded-none overflow-hidden mb-6">
                <img
                  src={heroImageUrl}
                  alt={heroImageAlt}
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
            </>
          )}
        </div>

        {/* Right Section: Product Information */}
        <div className="lg:w-[39.063vw] xl:w-[39.063vw] 2xl:w-[39.063vw] w-1/2">
          {/* Brand */}
          <div className="text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] font-medium mb-[1.198vw]">
            {productBrand}
          </div>

          {/* Product Title */}
          <h1 className="prata lowercase text-2xl lg:text-[2.292vw] xl:text-[2.292vw] 2xl:text-[2.292vw] lg:leading-[48px] font-bold mt-0 mb-[1.146vw]">
            {productTitle}
          </h1>

          {showVariantPicker && (
            <div className="mb-[1.25vw] max-w-md">
              <label
                htmlFor="gift-detail-variant"
                className="block text-[18px] lg:text-[0.938vw] font-semibold uppercase mb-2 tracking-wide"
              >
                Options
              </label>
              <select
                id="gift-detail-variant"
                value={variantIndex}
                onChange={(e) => setVariantIndex(Number(e.target.value))}
                className="w-full border border-[#1F1D1B] bg-white py-3 px-4 text-[18px] lg:text-[0.938vw] rounded-none focus:outline-none focus:ring-2 focus:ring-[#446184]"
              >
                {variantList.map((v, i) => (
                  <option
                    key={v.id || i}
                    value={i}
                    disabled={v.availableForSale === false}
                  >
                    {v.title}
                    {v.availableForSale === false ? ' — Sold out' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price */}
          <div className="text-[28px] lg:text-[1.458vw] xl:text-[1.458vw] 2xl:text-[1.458vw] font-semibold mb-[2.76vw]">
            <Money data={displayPrice} />
          </div>

          {/* Quantity Selector - Only show when logged in */}
          {isLoggedIn && (
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
                disabled={
                  isAdding || selectedVariant?.availableForSale === false
                }
                className={`text-white text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] tracking-[0.8px] font-bold w-[320px] h-[80px] lg:w-[16.667vw] xl:w-[16.667vw] 2xl:w-[16.667vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] px-6 ${
                  isAdding || selectedVariant?.availableForSale === false
                    ? 'bg-[#1F1D1B]'
                    : 'bg-[#446184]'
                }`}
              >
                {isAdding
                  ? 'ADDED!'
                  : selectedVariant?.availableForSale === false
                    ? 'SOLD OUT'
                    : 'ADD TO REGISTRY'}
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
          )}

          {/* Add to Registry Button - Show when not logged in (without quantity counter) */}
          {!isLoggedIn && (
            <div className="flex items-center w-full gap-6 lg:gap-[1.927vw] xl:gap-[1.927vw] 2xl:gap-[1.927vw]">
              <button
                onClick={handleRegistryPress}
                disabled={
                  isAdding || selectedVariant?.availableForSale === false
                }
                className={`text-white text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] tracking-[0.8px] font-bold w-[320px] h-[80px] lg:w-[16.667vw] xl:w-[16.667vw] 2xl:w-[16.667vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] px-6 ${
                  isAdding || selectedVariant?.availableForSale === false
                    ? 'bg-[#1F1D1B]'
                    : 'bg-[#446184]'
                }`}
              >
                {isAdding
                  ? 'ADDED!'
                  : selectedVariant?.availableForSale === false
                    ? 'SOLD OUT'
                    : 'ADD TO REGISTRY'}
              </button>
            </div>
          )}

          {/* Product Description */}
          <div className="prose prose-gray max-w-none">
            <div className="text-[22px] leading-8 pt-[2.917vw] product-detail-list ">
              {productDescription ? (
                <div
                  className="whitespace-normal [&_p]:block [&_p]:mb-4 [&_p]:last:mb-0 [&_ul]:block [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_li]:list-item [&_li]:mb-1 [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{__html: productDescription}}
                />
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
                  <ul>
                    <li>Made in France by Opinel, a family-owned company since 1890</li>
                    <li>Culturally iconic: used by Picasso; featured in the V&A Museum’s top 100 designs</li>
                    <li>Stainless steel serrated blade slices effortlessly through all types of bread</li>
                    <li>Sustainably sourced beechwood handle for comfort and classic style</li>
                    <li>Blade length: 21 cm (8.25")</li>
                  </ul>
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
