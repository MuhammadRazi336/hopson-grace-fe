import React, {useState} from 'react';

const ProductCard = ({
  image,
  productName,
  price,
  description,
  onAddToRegistry,
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
    <div className="h-full flex flex-col max-w-sm bg-gray-100 rounded-lg shadow-md p-4">
      <div className="h-48 bg-black flex items-center justify-center rounded">
        {image ? (
          <img
            src={image}
            alt={productName}
            className="object-contain h-full w-full rounded"
          />
        ) : (
          <div className="h-12 w-12 bg-white rounded"></div>
        )}
      </div>
      <div className="mt-4 flex-1 flex flex-col">
        <h2 className="text-lg font-bold">{productName}</h2>
        <p className="text-gray-700">${price}</p>
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
        {description && description.length > 100 ? (
          <div className="text-sm text-gray-600 mt-2">
            <p>
              {isReadMore ? description : `${description.substring(0, 100)}...`}
              <button
                className="text-blue-600 hover:text-blue-800 ml-1"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsReadMore(!isReadMore);
                }}
              >
                {isReadMore ? 'Read Less' : 'Read More'}
              </button>
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        )}
        <div className="mt-4 flex items-center mt-auto">
          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-12 h-10 border rounded text-center mr-2"
          />
          <button
            onClick={handleAddToRegistry}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Add to Registry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
