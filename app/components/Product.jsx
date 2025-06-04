import {Money} from '@shopify/hydrogen';
import React from 'react';

const ProductCard = ({
  productName,
  productImage,
  price,
  collected,
  isGroupGift,
  onContributorsClick,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="mt-4">
        <h2 className="text-lg font-bold">{productName}</h2>
        {/* <p className="text-gray-600">${price}</p> */}
        {price && price.amount && price.currencyCode ? (
          <Money className="text-gray-600" data={price} />
        ) : (
          <span className="text-gray-600">N/A</span>
        )}

        <p className="text-gray-600">${collected} Collected</p>
        {isGroupGift && (
          <p className="text-gray-800 font-semibold mt-2">Group Gift</p>
        )}
        <button
          onClick={onContributorsClick}
          className="text-blue-600 hover:underline font-semibold mt-2 inline-block"
        >
          View Contributors
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
