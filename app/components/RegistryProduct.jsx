import { Link } from '@remix-run/react';
import React, {useState} from 'react';
import {formatPrice} from '~/utils/priceFormatter';

const ProductCard = ({
  image,
  productName,
  price,
  description,
  onAddToRegistry,
  productHandle,
  isLoggedIn = false,
  isAddingToRegistry = false,
  brandName = 'BRAND NAME',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);

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

  const handleGroupGiftChange = (e) => {
    const isChecked = e.target.checked;
    setIsGroupGift(isChecked);
  };

  return (
    <div className="pt-0 relative lg:w-[23.43vw] xl:w-[23.43vw] 2xl:w-[23.43vw]">
      <div className="relative group mb-[4.844vw]">
        {/* Product Image and Info */}
        <div className="z-10 relative">
          <img
            src={image}
            alt={productName}
            className="w-full h-[23.43vw] object-cover max-[1024px]:h-[44vw] max-[475px]:h-[36vw]"
          />
          <h3 className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.354vw] uppercase mt-[1.563vw]">
            {productName}
          </h3>
          <p className="text-sm mt-[0.677vw] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw]">{formatPrice(price)}</p>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute lg:h-[33.5vw] xl:h-[33.5vw] 2xl:h-[37.3vw] lg:min-h-[20vw] xl:min-h-[20vw] 2xl:min-h-[20vw] inset-0 z-40 bg-[#FAF9F6] px-[2.552vw] py-[2.24vw] flex flex-col shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center scale-[1.13]">
          <div>
            <Link to={`/dashboard/addgifts/${productHandle}`}>
              <img
                src={image}
                alt={productName}
                className="w-full rounded-none h-[18.223vw] mx-auto object-cover cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <h4 className="text-base font-medium uppercase text-left mt-[1.135vw] mb-[0.781vw]">
              {brandName}
            </h4>
            <Link to={`/dashboard/addgifts/${productHandle}`}>
              <h3 className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.146vw] uppercase text-left leading-snug cursor-pointer hover:text-gray-600 transition-colors">
                {productName}
              </h3>
            </Link>
            <p className="text-2xl mt-2 text-left">{formatPrice(price)}</p>
          </div>

          <div className="flex items-center justify-between mt-[2.3vw]">
            {/* Quantity Controls */}
            <div className="flex w-full items-center text-xs gap-1.5">
              {/* Quantity Selector - Only show when logged in */}
              {/* {isLoggedIn && ( */}
                <div className="flex items-center w-[45%] gap-2 justify-center">
                  <p className="text-[18px] font-semibold uppercase text-left mb-1">QTY</p>
                  {/* Quantity Selector */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={incrementQuantity}
                      className="flex items-center justify-center bg-white transition-colors"
                    >
                      <img
                        src="/assets/Images/arrowDown.png"
                        className="w-3 h-3 lg:w-[0.833vw] xl:w-[0.833vw] 2xl:w-[0.833vw] lg:h-[0.833vw] xl:h-[0.833vw] 2xl:h-[0.833vw] rotate-180"
                        alt=""
                      />
                    </button>

                    <input
                      value={quantity}
                      className="w-16 lg:text-[1.458vw] lg:leading-[1.25vw] lg:h-[1.563vw] relative top-[2px] p-0 mx-0 my-[0.521vw] text-center border-none outline-none text-sm"
                      readOnly
                    />

                    <button
                      onClick={decrementQuantity}
                      className="flex items-center justify-center bg-white transition-colors"
                    >
                      <img
                        src="/assets/Images/arrowDown.png"
                        className="w-3 h-3 lg:w-[0.833vw] xl:w-[0.833vw] 2xl:w-[0.833vw] lg:h-[0.833vw] xl:h-[0.833vw] 2xl:h-[0.833vw]"
                        alt=""
                      />
                    </button>
                  </div>
                </div>
              {/* )} */}
              {/* Add to Registry Button */}
              <button
                className={`uppercase w-full lg:h-[4.31vw] xl:h-[4.31vw] 2xl:h-[4.31vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] block text-white text-sm font-semibold py-4 tracking-widest ${isAddingToRegistry ? 'bg-[#1F1D1B] cursor-wait' : 'bg-[#446184] cursor-pointer'}`}
                onClick={handleAddToRegistry}
                disabled={isAddingToRegistry}
              >
                {isAddingToRegistry ? 'ADDED!' : 'ADD TO REGISTRY'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
