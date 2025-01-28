import {Link, useLoaderData} from '@remix-run/react';

export async function loader(args) {
  const {context} = args;
  const registry = context?.session?.get('@Registry');

  const data = await context.ClientGet(
    `transactions/${registry[0].id}`,
    context,
  );

  return {giftTrackingData: data?.data || []};
}
const GiftTracker = () => {
  const {giftTrackingData} = useLoaderData();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Gift Tracker</h1>
      <p className="mt-2 text-center">How It Works</p>
      <p className="mt-2 text-center text-gray-600">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full mt-4 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Gift Purchased By</th>
              <th className="border px-4 py-2">Purchase Date</th>
              <th className="border px-4 py-2">Purchase Amount</th>
              <th className="border px-4 py-2">Gift Is For</th>
              <th className="border px-4 py-2">View Gifts</th>
              <th className="border px-4 py-2">Thank You’s</th>
            </tr>
          </thead>
          <tbody>
            {giftTrackingData.map((gift, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{gift.name}</td>
                <td className="border px-4 py-2">{gift.purchaseDate}</td>
                <td className="border px-4 py-2">{gift.totalAmount}</td>
                <td className="border px-4 py-2">{gift.giftFor}</td>
                <td className="border px-4 py-2">
                  <Link to={`/dashboard/viewgifts/${gift.greetingId}`}>
                    <div className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 text-center">
                      View Gifts
                    </div>
                  </Link>
                </td>
                <td className="border px-4 py-2">
                  {gift.messageSent ? 'Sent' : 'Send Thanks'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        * Prices shown include Ontario GST/HST tax
      </p>
    </div>
  );
};

export default GiftTracker;
