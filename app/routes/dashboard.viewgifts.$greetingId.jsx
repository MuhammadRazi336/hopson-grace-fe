import {useLoaderData, useParams, useSearchParams} from '@remix-run/react';
import React from 'react';

export async function loader({params, context}) {
  const {greetingId} = params;

  const response = await context.ClientGet(
    `transactions/detail/${greetingId}`,
    context,
  );
  return {viewGifts: response.data || []};
}

const ViewGifts = () => {
  const {viewGifts} = useLoaderData();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">View Gifts / Message</h1>
      <div className="text-gray-700 mb-8">
        <h2 className="text-xl font-semibold">
          {viewGifts[0]?.name || 'Guest Name'}
        </h2>
        <p className="mt-2">{viewGifts[0]?.message || 'No message'}</p>
      </div>

      {viewGifts.map((gift, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Group Gift Item</h3>
              <p className="mt-1 text-sm text-gray-600">
                Total Gift Value:{' '}
                <span className="font-bold">{gift.amount}</span>
              </p>
              <p className="mt-2 text-gray-600 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-sm mb-2">Contribution</h4>
              <p className="bg-gray-200 px-2 py-2 rounded-md">
                {gift.contribution}
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-sm mb-2">Quantity</h4>
              <p className="bg-gray-200 px-2 py-2 rounded-md">
                {gift.quantity}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewGifts;
