import {useLoaderData, Link} from '@remix-run/react';
import React from 'react';
export async function loader({ context }) {
  const registry = context?.session?.get('@Registry');

  if (!registry || !registry.id) {
    throw new Response('Registry not found in session', { status: 404 });
  }

  const data = await context.ClientGet(
    `registryProducts/cash-fund/${registry.id}`,
    context
  );

  // Defensive check for image
  if (data?.data && Array.isArray(data.data)) {
    data.data.forEach((item, idx) => {
      if (item && item.image && item.image.fileUrl) {
        // ok
      } else {
        // Ensure item.image is at least an empty object
        if (item && !item.image) item.image = {};
      }
    });
  }

  // Remove or comment out the direct console.log that assumes image exists
  // console.log('data', data.data[1].image.fileUrl);

  return { cashFundData: data?.data || [] };
}
const CashFunds = () => {
  const {cashFundData} = useLoaderData();

  const handleButtonClick = (title) => {
    alert(`Button clicked for ${title}`);
  };

  return (
    <div className="flex flex-col px-4 py-8">
      <div className="max-w-6xl w-full mx-auto">
        {/* Heading Section */}
        <h2 className="text-2xl font-bold mb-4 text-left">Cash Funds</h2>
        <div className="mb-8">
          {/* How It Works Section */}
          <h3 className="text-lg font-semibold text-left">How It Works</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <p className="text-gray-600 w-full md:w-1/2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-gray-600 w-full md:w-1/2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cashFundData.map((card, index) => (
            <Card
              id={card.id}
              key={index}
              image={card.image && card.image.fileUrl ? card.image.fileUrl : undefined}
              title={card.name}
              amount={card.amount}
              buttonLabel={'Personalize Fund'}
              onButtonClick={() => handleButtonClick(card.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashFunds;

const Card = ({title, amount, buttonLabel, onButtonClick, id, image}) => {
  return (
    <div className="w-full bg-white shadow-md rounded-md overflow-hidden">
      <div className="h-60 flex items-center justify-center">
        {/* Placeholder for the image or icon */}
        <div className="w-full h-full">
          {image ? (
            <img src={image} alt="Cash Fund" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              No Image
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">$ {amount}</p>
        <Link to={`/dashboard/cashfunds/${id}`}>
          <div className="mt-4 w-full bg-black text-white py-2 rounded-md text-center">
            {buttonLabel}
          </div>
        </Link>
      </div>
    </div>
  );
};
