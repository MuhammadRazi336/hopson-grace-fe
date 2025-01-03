// import React from 'react';
import ButtonComponent from '~/components/Button.jsx';

const ViewGiftsMessage = () => {
  const gifts = [
    {
      title: 'Group Gift Item',
      totalValue: '$1289.00',
      contribution: '$100.00',
      quantity: 1,
      imageSrc: 'https://via.placeholder.com/150',
    },
    {
      title: 'Group Gift Item',
      totalValue: '$1289.00',
      contribution: '$100.00',
      quantity: 1,
      imageSrc: 'https://via.placeholder.com/150',
    },
    {
      title: 'Cash Fund',
      totalValue: '$1289.00',
      contribution: '$500.00',
      imageSrc: 'https://via.placeholder.com/150',
    },
  ];

  const totalContribution = gifts.reduce((acc, gift) => {
    const contribution = parseFloat(gift.contribution.replace(/[$,]/g, ''));
    return acc + contribution;
  }, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">View Gifts / Message</h1>
      <h2 className="text-xl text-center">Robert & Elisabeth Fox</h2>
      <p className="text-center text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

      {gifts.map((gift, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-300 rounded bg-white">
          <img src={gift.imageSrc} alt={gift.title} className="w-full h-32 object-cover rounded mb-2" />
          <h3 className="text-lg font-semibold">{gift.title}</h3>
          <p>Total Gift Value: <span className="font-medium">{gift.totalValue}</span></p>
          <p>Contribution: <span className="font-medium">{gift.contribution}</span></p>
          {gift.quantity !== undefined && (
            <div className="mt-2 flex items-center">
              <label htmlFor={`qty-${index}`} className="mr-2 font-medium">QTY</label>
              <input type="number" id={`qty-${index}`} defaultValue={gift.quantity} min="1" className="border border-gray-300 rounded px-2 py-1 w-16" />
            </div>
          )}
        </div>
      ))}

      <h3 className="text-lg font-bold text-right mt-4">TOTAL: <span className="font-medium">${totalContribution.toFixed(2)}</span></h3>

      <div className="mt-6 text-center">
        <ButtonComponent text="Confirm Gifts" onClick={() => alert('Gifts confirmed!')} className="w-full" />
      </div>
    </div>
  );
};

export default ViewGiftsMessage;
