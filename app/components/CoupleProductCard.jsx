import React, {useState} from 'react';

const CoupleProductCard = ({
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
}) => {
  const [contributionAmount, setContributionAmount] = useState('');
  const [error, setError] = useState('');

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
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
            >
              Contribute to Cash Fund
            </button>
          </>
        );
      case 'addToCart':
        return (
          <button
            onClick={handleButtonClick}
            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 w-full"
          >
            Add to Cart
          </button>
        );
      case 'purchased':
        return (
          <button
            className="bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed w-full"
            disabled
          >
            Purchased
          </button>
        );
      default:
        return null;
    }
  };

  const progressPercentage = (contributedAmount / maxContribution) * 100;

  return (
    <div className="max-w-xs border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-between">
      <div>
        <div className="bg-gray-200 h-40 w-full rounded mb-4 flex items-center justify-center">
          <div className="text-gray-500">Image</div>
        </div>
        <h2 className="text-lg font-bold">{name}</h2>
        <p className="text-gray-500">{price}</p>
        {isGroupGift && (
          <p className="text-sm text-blue-500 italic">This is a group gift</p>
        )}
        {isCashFund && (
          <p className="text-sm text-green-500 italic">This is a Cash Fund</p>
        )}
        <p className="text-gray-600 mt-2">{description}</p>
        {(isGroupGift || isCashFund) && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Contributed: ${contributedAmount.toFixed(2)} / $
              {maxContribution.toFixed(2)}
            </p>
            <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{width: `${progressPercentage}%`}}
              ></div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col justify-end">{renderButton()}</div>
    </div>
  );
};

export default CoupleProductCard;
