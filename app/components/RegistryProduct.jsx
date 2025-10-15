import { Link } from '@remix-run/react';
import React, {useState} from 'react';
import {formatPrice} from '~/utils/priceFormatter';

const ProductCard = ({
  image,
  productName,
  price,
  description,
  onAddToRegistry,
  onPersonalizeFund,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);

  const handleAddToRegistry = () => {
    if (onAddToRegistry && quantity > 0) {
      onAddToRegistry(quantity, isGroupGift);
    }
  };

  const handleGroupGiftChange = (e) => {
    const isChecked = e.target.checked;
    setIsGroupGift(isChecked);
  };

  return (
    <div className="pt-0 relative z-0">
      <div className="relative group mb-[4.844vw]">
        {/* Product Image and Info */}
        <div className="p-4 z-10 relative">
          <img
            src={image}
            alt={productName}
            className="w-full h-[18.75vw] object-cover"
          />
          <h3 className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.354vw] uppercase mt-[1.563vw]">
            {productName}
          </h3>
          <p className="text-sm mt-[0.677vw] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw]">{formatPrice(price)}</p>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute lg:h-[37.5vw] lg:min-h-[490px] inset-0 z-40 bg-[#FAF9F6] px-[2.552vw] py-[2.24vw] flex flex-col shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
          <div>
            <img
              src={image}
              alt={productName}
              className="w-full rounded-none h-[15.625vw] mx-auto object-cover"
            />
            <h4 className="text-xs font-medium uppercase text-left mt-[1.135vw] mb-[0.781vw]">
              {'BRAND NAME'}
            </h4>
            <h3 className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.146vw] line-clamp-1 uppercase text-left leading-snug">
              {productName}
            </h3>
            <p className="text-sm mt-2 lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw] text-left">{formatPrice(price)}</p>
          </div>

          <div className="flex items-center justify-between mt-[2.813vw]">
            {/* Quantity Controls */}
            <div className="flex flex-col w-full items-center text-xs">
              {/* Add to Registry Button */}
              {onPersonalizeFund && (
                <button
                  className="bg-white cursor-pointer w-full lg:h-[4.01vw] xl:h-[4.01vw] 2xl:h-[4.01vw] lg:mb-[0.729vw] lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] block text-black uppercase border border-black text-xs font-bold py-2 px-4"
                  onClick={onPersonalizeFund}
                >
                  personalize fund
                </button>
              )}
              {/* Add to Registry Button */}
              <button
                className="bg-[#446184] cursor-pointer uppercase w-full lg:h-[4.01vw] xl:h-[4.01vw] 2xl:h-[4.01vw] lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] block text-white text-xs font-bold py-4 px-8 disabled:opacity-50"
                onClick={handleAddToRegistry}
              >
                ADD TO REGISTRY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
