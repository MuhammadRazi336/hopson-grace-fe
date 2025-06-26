import React, {useState} from 'react';

const CoupleProductCard = ({
  image,
  name,
  price,
  description,
  isGroupGift,
  isCashFund,
  status,
  contributedAmount,
  maxContribution,
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
    } else if (value + contributedAmount > maxContribution) {
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
    switch (status) {
      case 'groupGift':
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
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full"
            >
              Contribute to Group Gift
            </button>
          </>
        );
      case 'cashFund':
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
      case 'addToCart':
        return (
          <button
            onClick={handleButtonClick}
            className=" bg-white w-full border px-4 py-4 uppercase text-sm font-semibold mt-4 hover:bg-black hover:text-white"
          >
            Add to Cart
          </button>
        );
      case 'purchased':
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
      default:
        return null;
    }
  };

  const progressPercentage = (contributedAmount / maxContribution) * 100;

  //AWS Image URL Cleanup
  const cleanUrl = getCleanImageUrl(image);

  function getCleanImageUrl(url) {
    const match = url.match(/^(.*\.(jpg|png|webp))/i);
    return match ? match[1] : url;
  }

  return (
    <div
      className={`${
        status === 'purchased' ? 'overlay-gifted' : ''
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
              <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100 z-10 flex items-center justify-center">
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
          className="text-lg font-semibold cursor-pointer"
          onClick={() => onTitleClick(name)}
        >
          {name}
        </h2>
        <div className="flex justify-between items-center">
          <p className="font-semibold text-md">${price}</p>

          {isCashFund && (
            <p className="text-sm italic my-2 text-right w-full mb-2 text-gray-600">
              Remaining: ${maxContribution - contributedAmount}
            </p>
          )}
        </div>
        {(isGroupGift || isCashFund) && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Contributed: ${contributedAmount.toFixed(2)} / $
              {maxContribution.toFixed(2)}
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col justify-end">{renderButton()}</div>
    </div>
  );
};

export default CoupleProductCard;
