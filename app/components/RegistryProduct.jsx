import { Link } from '@remix-run/react';
import React, {useEffect, useRef, useState} from 'react';
import {formatPrice} from '~/utils/priceFormatter';

const ProductCard = ({
  image,
  productName,
  price,
  description: _description,
  onAddToRegistry,
  productHandle,
  isLoggedIn: _isLoggedIn = false,
  isSubmitting = false,
  brandName = 'BRAND NAME',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [addedHold, setAddedHold] = useState(false);
  const prevSubmittingRef = useRef(false);

  useEffect(() => {
    const wasSubmitting = prevSubmittingRef.current;
    if (isSubmitting) {
      setAddedHold(false);
    }
    if (wasSubmitting && !isSubmitting) {
      setAddedHold(true);
      const t = setTimeout(() => setAddedHold(false), 3000);
      prevSubmittingRef.current = isSubmitting;
      return () => clearTimeout(t);
    }
    prevSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const showAdded = isSubmitting || addedHold;

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToRegistry = () => {
    if (onAddToRegistry && quantity > 0) {
      onAddToRegistry(quantity, isGroupGift);
    }
  };

  const productDetailUrl = productHandle
    ? `/dashboard/addgifts/${productHandle}`
    : null;

  return (
    <div className="pt-0 relative w-[23.43vw] max-[1025px]:w-full max-[1025px]:h-auto max-[1025px]:z-1">
      <div className="relative group mb-[1.844vw] max-[1025px]:mb-0 max-[1025px]:h-full max-[1025px]:w-full">
        {/* Product image and summary — aligned with dashboard.giftcards GiftCard default state */}
        <div className="relative z-0 max-[1025px]:hidden">
          {productDetailUrl ? (
            <Link to={productDetailUrl} className="block cursor-pointer">
              <img
                src={image}
                alt={productName}
                className="w-full object-cover aspect-square"
              />
              <h3 className="text-[18px] font-semibold uppercase mt-3">
                {productName}
              </h3>
            </Link>
          ) : (
            <>
              <img
                src={image}
                alt={productName}
                className="w-full object-cover aspect-square"
              />
              <h3 className="text-[18px] font-semibold uppercase mt-3">
                {productName}
              </h3>
            </>
          )}
          <p className="text-sm mt-1">{formatPrice(price)}</p>
        </div>

        {/* Hover overlay — matches dashboard.giftcards._index GiftCard */}
        <div className="absolute h-[35.313vw] inset-0 z-40 bg-[#FAF9F6] py-[2vw] px-[2.24vw] flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center max-[1025px]:opacity-100 max-[1025px]:h-full max-[1025px]:z-10 max-[1025px]:static max-[1025px]:border-gray-300 max-[768px]:p-5 max-[1025px]:h-auto">
          <div>
            {productDetailUrl ? (
              <Link to={productDetailUrl} className="block cursor-pointer">
                <img
                  src={image}
                  alt={productName}
                  className="w-full mx-auto object-cover aspect-square mb-[20px]"
                />
                <h4 className="text-[16px] lg:text-[0.833vw] leading-[16px] lg:leading-[0.833vw] font-normal uppercase text-left m-0 mb-[10px]">
                  {brandName}
                </h4>
                <h3 className="text-[20px] lg:text-[1.146vw] lg:leading-[1.146vw] font-[500] uppercase text-left leading-[22px] m-0 max-[1025px]:text-lg">
                  {productName}
                </h3>
              </Link>
            ) : (
              <>
                <img
                  src={image}
                  alt={productName}
                  className="w-full mx-auto object-cover mb-[20px] aspect-square"
                />
                <h4 className="text-[16px] lg:text-[0.833vw] leading-[16px] lg:leading-[0.833vw] font-normal uppercase text-left m-0 mb-[10px]">
                  {brandName}
                </h4>
                <h3 className="text-[20px] lg:text-[1.146vw] lg:leading-[1.146vw] font-[500] uppercase text-left leading-[22px] m-0 max-[1025px]:text-lg">
                  {productName}
                </h3>
              </>
            )}
            <p className="text-[20px] lg:text-[1.25vw] leading-[20px] lg:leading-[1.25vw] mt-[22px] text-left max-[1025px]:mt-2.5 max-[768px]:mt-0">
              {formatPrice(price)}
            </p>
          </div>

          <div className="flex flex-col w-full items-center text-xs">
            <div className="flex items-center justify-around w-full mb-4 max-[1025px]:mt-4 max-[1025px]:mb-0 max-[1025px]:flex-wrap max-[1025px]:justify-center">
              <p className="text-[18px] lg:text-[0.938vw] font-[500] uppercase text-left mb-1">
                QTY
              </p>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img
                    src="/assets/Images/arrowDown.png"
                    className="w-3 h-3 lg:w-[0.833vw] lg:h-[0.833vw] rotate-180"
                    alt=""
                  />
                </button>
                <input
                  value={quantity}
                  className="w-16 lg:text-[1.458vw] lg:leading-[1.25vw] lg:h-[1.563vw] relative top-[2px] p-0 mx-0 my-[0.521vw] text-center border-none outline-none text-sm"
                  readOnly
                />
                <button
                  type="button"
                  onClick={decrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img
                    src="/assets/Images/arrowDown.png"
                    className="w-3 h-3 lg:w-[0.833vw] lg:h-[0.833vw]"
                    alt=""
                  />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToRegistry}
                disabled={showAdded}
                className={`${
                  showAdded
                    ? 'bg-[#1F1D1B] cursor-default'
                    : 'bg-[#446184]'
                } text-white text-[14px] leading-[20px] font-bold py-4 px-6 lg:px-0 lg:leading-[1.042vw] w-[10.156vw] h-[4.01vw] max-[1025px]:w-full max-[1025px]:mt-4 max-[1025px]:h-auto max-[1025px]:text-[12px]`}
              >
                {showAdded ? 'ADDED!' : 'ADD TO REGISTRY'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
