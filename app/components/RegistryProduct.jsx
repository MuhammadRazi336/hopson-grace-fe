import { Link } from '@remix-run/react';
import React, {useState} from 'react';

const ProductCard = ({
  image,
  productName,
  price,
  description,
  onAddToRegistry,
  onPersonalizeFund,
  onGroupGiftTagChange,
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
    if (onGroupGiftTagChange) {
      onGroupGiftTagChange(isChecked);
    }
  };

  return (
    <div className="pt-0 relative z-0">
      <div className="relative group h-[460px]">
        {/* Product Image and Info */}
        <div className="p-4 z-10 relative">
          <img
            src={image}
            alt={productName}
            className="w-full h-[300px] object-cover"
          />
          <h3 className="text-[18px] font-semibold uppercase mt-3">
            {productName}
          </h3>
          <p className="text-sm mt-1">${price}</p>
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id="group-gift"
              className="mr-2"
              checked={isGroupGift}
              onChange={handleGroupGiftChange}
            />
            <label htmlFor="group-gift" className="text-sm text-gray-600">
              Tag as group gift?
            </label>
          </div>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute inset-0 z-40 bg-[#FAF9F6] py-4 px-12 flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 group-hover:scale-y-115 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
          <div>
            <img
              src={image}
              alt={productName}
              className="w-full h-[220px] mx-auto object-cover mb-2"
            />
            <h4 className="text-xs font-medium uppercase text-left mb-1">
              {'BRAND NAME'}
            </h4>
            <h3 className="text-sm font-bold uppercase text-left leading-snug">
              {productName}
            </h3>
            <p className="text-sm mt-2 text-left">${price}</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex flex-col w-full items-center text-xs">
              {/* Add to Registry Button */}
              <button
                className="bg-white w-full block mb-2 text-black uppercase border border-black text-xs font-bold py-4 px-8"
                onClick={onPersonalizeFund}
              >
                personalize fund
              </button>
              {/* Add to Registry Button */}
              <button
                className="bg-[#446184] w-full block text-white text-xs font-bold py-4 px-8"
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
