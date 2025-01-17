import {Link} from '@remix-run/react';

export async function loader(args) {
  const {context} = args;
  const registry = context?.session?.get('@Registry');

  // Await the critical data required to render initial state of the page
  const data = await context.ClientGet(
    `transactions/${registry[0].id}`,
    context,
  );

  return {giftTrackingData: data?.data || []};
}
const GiftTracker = () => {
  const gifts = [
    {
      purchasedBy: 'Robert & Elisabeth Fox',
      date: 'Feb 11, 2024',
      amount: '$351.02',
      giftFor: 'Shower',
      viewGifts: 'View Gifts/Message',
      thankYou: 'Send Thanks',
    },
    {
      purchasedBy: 'Ronald Richards',
      date: 'Feb 03, 2024',
      amount: '$739.65',
      giftFor: 'Shower',
      viewGifts: 'View Gifts/Message',
      thankYou: 'Send Thanks',
    },
    {
      purchasedBy: 'Cody Fisher & Candice Farr',
      date: 'Feb 03, 2024',
      amount: '$328.85',
      giftFor: 'Wedding',
      viewGifts: 'View Gifts/Message',
      thankYou: '✓',
    },
    {
      purchasedBy: 'Marvin McKinney',
      date: 'Feb 03, 2024',
      amount: '$948.55',
      giftFor: 'Wedding',
      viewGifts: 'View Gifts/Message',
      thankYou: '✓',
    },
    {
      purchasedBy: 'Arlene & Mansel McCoy',
      date: 'Jan 30, 2024',
      amount: '$293.01',
      giftFor: 'Shower',
      viewGifts: 'View Gifts/Message',
      thankYou: 'Send Thanks',
    },
    {
      purchasedBy: 'Leslie & Marie Alexander',
      date: 'Jan 29, 2024',
      amount: '$767.50',
      giftFor: 'Wedding',
      viewGifts: 'View Gifts/Message',
      thankYou: '✓',
    },
    {
      purchasedBy: 'Darrell Steward',
      date: 'Jan 01, 2024',
      amount: '$169.43',
      giftFor: 'Wedding',
      viewGifts: 'View Gifts/Message',
      thankYou: '✓',
    },
  ];

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
            {gifts.map((gift, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{gift.purchasedBy}</td>
                <td className="border px-4 py-2">{gift.date}</td>
                <td className="border px-4 py-2">{gift.amount}</td>
                <td className="border px-4 py-2">{gift.giftFor}</td>
                <td className="border px-4 py-2">
                  <Link>
                    <div className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 text-center">
                      {gift.viewGifts}
                    </div>
                  </Link>
                </td>
                <td className="border px-4 py-2">{gift.thankYou}</td>
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
