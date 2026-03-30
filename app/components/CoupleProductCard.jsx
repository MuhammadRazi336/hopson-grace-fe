import React, {useState} from 'react';
import {formatPrice} from '~/utils/priceFormatter';

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
  const [selectedQuantity, setSelectedQuantity] = useState(1);

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
      onAddToCart(selectedQuantity);
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
          {error && <p className="text-[#FD446F] text-sm mb-2">{error}</p>}
          <button
            onClick={handleButtonClick}
            className=" bg-white w-full cursor-pointer border px-4 py-2 lg:h-[4.063vw] tracking-[0.8px] uppercase text-[18px] leading-[18px] font-semibold mt-4 hover:bg-black hover:text-white"
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
          {error && <p className="text-[#FD446F] text-sm mb-2">{error}</p>}
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
          className=" bg-white w-full cursor-pointer border px-4 py-2 lg:h-[4.063vw] tracking-[0.8px] uppercase text-[18px] leading-[18px] font-semibold mt-4 hover:bg-black hover:text-white"
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
            className=" bg-white w-full border px-4 py-2 lg:h-[4.063vw] tracking-[0.8px] uppercase text-[18px] leading-[18px] font-semibold mt-4 hover:bg-black hover:text-white"
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

  // Keep selector synced with still-needs limits
  React.useEffect(() => {
    if (stillNeeds <= 0) {
      setSelectedQuantity(1);
      return;
    }
    if (selectedQuantity > stillNeeds) {
      setSelectedQuantity(stillNeeds);
    }
  }, [stillNeeds, selectedQuantity]);

  const incrementSelectedQuantity = () => {
    if (selectedQuantity < stillNeeds) {
      setSelectedQuantity((prev) => prev + 1);
    }
  };

  const decrementSelectedQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity((prev) => prev - 1);
    }
  };

  //AWS Image URL Cleanup
  const cleanUrl = getCleanImageUrl(image);

  function getCleanImageUrl(url) {
    const match = url.match(/^(.*\.(jpg|png|webp))/i);
    return match ? match[1] : url;
  }

  // Use original image for cash funds to preserve S3 query parameters
  const finalImageUrl = isCashFund ? image : cleanUrl;

  return (
    <div
      className={`${
        (!isCashFund && !isGroupGift && status === 'purchased') || 
        ((isCashFund || isGroupGift) && !isAnyAmount && maxContribution - contributedAmount === 0) || 
        (!isCashFund && !isGroupGift && isFullyGifted) ? 'overlay-gifted' : ''
      } p-0 flex flex-col justify-between`}
    >
      <div className="flex flex-col justify-between">
        {image ? (
          <div
            className={`${
              !finalImageUrl ? 'bg-gray-200 ' : ''
            } h-[360px] lg:h-[19.792vw] w-full mb-4 flex items-center justify-center relative`}
          >
            <img
              src={finalImageUrl}
              alt={name}
              className="w-full h-full object-cover mb-4 cursor-pointer"
              onClick={() => {
                if (isCashFund || isGroupGift) {
                  if (isAnyAmount || maxContribution - contributedAmount > 0) {
                    onTitleClick(name);
                  }
                } else if (!isFullyGifted) {
                  onTitleClick(name);
                }
              }}
            />

            {isGroupGift && (
              <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100 flex items-center justify-center">
                <h2 className="prata text-black text-sm text-center font-bold mt-3 leading-tight">
                  group <br /> gift
                </h2>
              </div>
            )}

            {!isGroupGift && isCashFund && (
              <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100 flex items-center justify-center">
                <h2 className="prata text-black text-sm text-center font-bold mt-3 leading-tight">
                  cash <br /> fund
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
          className={`text-lg lg:text-[1.25vw] font-[500] mb-[8px] ${
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
          {isAnyAmount ? '' : (
            <p className="font-normal text-lg lg:text-[1.25vw]">
              {formatPrice(price)}
            </p>
          )}

          {(isCashFund || isGroupGift) && !isAnyAmount && (
            <p className="text-sm ivyora lg:text-[1.042vw] italic mt-2 text-right w-full ivyora mb-2 text-[#1F1D1B]">
              ${maxContribution - contributedAmount} Remaining
            </p>
          )}
        </div>
        {(isGroupGift || isCashFund) && !isAnyAmount && (
          <div className="mt-[1.146vw]">
            <p className="text-sm ivyora lg:text-[1.042vw] text-[#1F1D1B]">
              Contributed: ${contributedAmount.toFixed(2)} / $
              {maxContribution.toFixed(2)}
            </p>
          </div>
        )}
      </div>
      {(!isGroupGift && !isCashFund) && (
          <div className="mt-2 flex flex-row items-center gap-6">
            <p className="text-sm italic ivyora lg:text-[1.042vw] text-[#1F1D1B]">
              Requested: {quantity}
            </p>
            <p className="text-sm ivyora lg:text-[1.042vw] text-[#1F1D1B] italic">
              Still Needs: {stillNeeds}
            </p>
          </div>
        )}
      {(!isGroupGift && !isCashFund && !isFullyGifted && status !== 'purchased') && (
        <div className="mt-2 flex items-center gap-4">
          <p className="text-sm ivyora lg:text-[1.042vw] text-[#1F1D1B] italic">
            QTY
          </p>
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={incrementSelectedQuantity}
              disabled={selectedQuantity >= stillNeeds}
              className="w-6 h-6 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="/assets/Images/arrowDown.png"
                alt="increase quantity"
                className="w-3 h-3 rotate-180"
              />
            </button>
            <span className="text-sm lg:text-[0.938vw] leading-[1] text-[#1F1D1B]">
              {selectedQuantity}
            </span>
            <button
              onClick={decrementSelectedQuantity}
              disabled={selectedQuantity <= 1}
              className="w-6 h-6 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="/assets/Images/arrowDown.png"
                alt="decrease quantity"
                className="w-3 h-3"
              />
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-col justify-end">{renderButton()}</div>
    </div>
  );
};

export default CoupleProductCard;
