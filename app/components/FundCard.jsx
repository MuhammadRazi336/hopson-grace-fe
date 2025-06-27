import React from 'react';

const FundCard = ({
  title,
  totalAmount,
  image,
  collectedAmount,
  onViewContributors,
}) => {
  const progress = Math.min(collectedAmount / totalAmount, 1) * 100; // Calculate progress percentage

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden m-4">
      <div className="h-60 flex items-center justify-center">
        <div className="w-full h-full">
          <img src={image} alt="Cash Fund" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          ${totalAmount.toLocaleString()} Collected: $
          {collectedAmount.toLocaleString()}
        </p>

        <div className="h-3 bg-gray-300 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-black rounded-full transition-all"
            style={{width: `${progress}%`}}
          ></div>
        </div>

        <button
          className="text-black hover:underline font-semibold mt-2 inline-block"
          onClick={onViewContributors}
        >
          View Contributors
        </button>
      </div>
    </div>
  );
};

export default FundCard;
