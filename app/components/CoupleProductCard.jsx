import React, {useState} from 'react';

const CoupleProductCard = ({
  image,
  name,
  price,
  description,
  quantity,
  isGroupGift,
  isCashFund,
  status,
  contributedAmount,
  maxContribution,
  purchasedQuantity = 0, // Add this prop for partial purchases
  isAnyAmount = false, // Add this prop for cash funds
  onAddToCart,
  onContribute,
  onTitleClick,
}) => {
  const [contributionAmount, setContributionAmount] = useState('');
  const [error, setError] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleInputChange = (e) => {
    const value = parseFloat(e.target.value);

    // Validation logic
    if (value < 0) {
      setError('Contribution amount cannot be negative.');
      setContributionAmount('');
    } else if (!isAnyAmount && value + contributedAmount > maxContribution) {
      setError(
        `You can only contribute up to $${(
          maxContribution - contributedAmount
        ).toFixed(2)}.`,
      );
      setContributionAmount(value); // Allow the value but show an error
    } else {
      setError(''); // Clear the error if input is valid
      setContributionAmount(value);
    }
  };

  const handleButtonClick = () => {
    const amount = parseFloat(contributionAmount);

    if ((isGroupGift || isCashFund) && (isNaN(amount) || amount <= 0)) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }

    if (error) {
      alert(error);
      return;
    }

    if (isGroupGift || isCashFund) {
      onContribute(amount);
      setContributionAmount(''); // Reset input
    } else if (status === 'addToCart') {
      onAddToCart();
    }
  };

  const renderButton = () => {
    // Check for group gift first (both status and prop)
    if (status === 'groupGift' || isGroupGift) {
      return (
        <>
          <input
            type="number"
            value={contributionAmount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            className="border rounded px-2 py-1 w-full mb-2"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            onClick={handleButtonClick}
            className=" bg-white w-full border px-4 py-4 uppercase text-sm font-semibold mt-4 hover:bg-black hover:text-white"
          >
            Contribute
          </button>
        </>
      );
    }
    
    // Check for cash fund
    if (status === 'cashFund' || isCashFund) {
      return (
        <>
          <input
            type="number"
            value={contributionAmount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            className="border rounded px-2 py-1 w-full mb-2"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            onClick={handleButtonClick}
            className="mt-auto bg-white w-full border px-4 py-4 uppercase text-sm font-semibold hover:bg-black hover:text-white"
          >
            Contribute
          </button>
        </>
      );
    }
    
    // Check for add to cart
    if (status === 'addToCart') {
      return (
        <button
          onClick={handleButtonClick}
          className=" bg-white w-full border px-4 py-4 uppercase text-sm font-semibold mt-4 hover:bg-black hover:text-white"
        >
          Add to Cart
        </button>
      );
    }
    
    // Check for purchased
    if (status === 'purchased') {
      return (
        <>
          <button
            onClick={handleButtonClick}
            className=" bg-white w-full border px-4 py-4 uppercase text-sm font-semibold mt-4 hover:bg-black hover:text-white"
          >
            Add to Cart
          </button>
        </>
      );
    }
    
    return null;
  };

  const progressPercentage = (contributedAmount / maxContribution) * 100;

  // Calculate if the product is fully gifted
  const stillNeeds = status === 'purchased' ? 0 : Math.max(0, quantity - purchasedQuantity);
  const isFullyGifted = stillNeeds === 0;

  //AWS Image URL Cleanup
  const cleanUrl = getCleanImageUrl(image);

  function getCleanImageUrl(url) {
    const match = url.match(/^(.*\.(jpg|png|webp))/i);
    return match ? match[1] : url;
  }

  return (
    <div
      className={`${
        (!isCashFund && !isGroupGift && status === 'purchased') || 
        ((isCashFund || isGroupGift) && !isAnyAmount && maxContribution - contributedAmount === 0) || 
        (!isCashFund && !isGroupGift && isFullyGifted) ? 'overlay-gifted' : ''
      } p-4 flex flex-col justify-between`}
    >
      <div className="flex flex-col justify-between">
        {image ? (
          <div
            className={`${
              !cleanUrl ? 'bg-gray-200 ' : ''
            } h-[380px] w-full mb-4 flex items-center justify-center relative`}
          >
            <img
              src={cleanUrl}
              alt={name}
              className="w-full h-full object-cover mb-4"
            />

            {isGroupGift && (
              <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100  flex items-center justify-center">
                <h2 className=" prata text-black text-sm text-center font-bold mt-1">
                  group <br /> gift
                </h2>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-200  h-[380px] w-full rounded mb-4 flex items-center justify-center">
            <div className="text-gray-500">No image</div>
          </div>
        )}
        <h2
          className={`text-lg font-semibold ${
            (isCashFund || isGroupGift) 
              ? (isAnyAmount ? 'cursor-pointer' : (maxContribution - contributedAmount === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'))
              : (isFullyGifted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')
          }`}
          onClick={() => {
            if (isCashFund || isGroupGift) {
              if (isAnyAmount || maxContribution - contributedAmount > 0) {
                onTitleClick(name);
              }
            } else if (!isFullyGifted) {
              onTitleClick(name);
            }
          }}
        >
          {name}
        </h2>
        <div className="flex justify-between items-center">
         {isAnyAmount ? "" : <p className="font-semibold text-md">${price}</p>}

          {(isCashFund || isGroupGift) && !isAnyAmount && (
            <p className="text-sm italic my-2 text-right w-full mb-2 text-gray-600">
              Remaining: ${maxContribution - contributedAmount}
            </p>
          )}
        </div>
        {(isGroupGift || isCashFund) && !isAnyAmount && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Contributed: ${contributedAmount.toFixed(2)} / $
              {maxContribution.toFixed(2)}
            </p>
          </div>
        )}
      </div>
      {(!isGroupGift && !isCashFund) && (
          <div className="mt-2 flex flex-row items-center gap-6">
            <p className="text-sm text-gray-500 italic">
              Requested: {quantity}
            </p>
            <p className="text-sm text-gray-500 italic">
              Still Needs: {stillNeeds}
            </p>
          </div>
        )}
      <div className="mt-4 flex flex-col justify-end">{renderButton()}</div>
    </div>
  );
};

export default CoupleProductCard;
