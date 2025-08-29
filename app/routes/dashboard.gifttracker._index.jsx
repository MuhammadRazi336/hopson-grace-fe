import {Link, useLoaderData} from '@remix-run/react';
import { Footer } from '~/components/Footer';

export async function loader(args) {
  const {context} = args;
  const user = await context?.session?.get('@User');
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );

  const data = await context.ClientGet(
    `transactions/${registry.data[0].id}`,
    context,
  );

  return {giftTrackingData: data?.data || []};
}

const GiftTracker = () => {
  const {giftTrackingData} = useLoaderData();
  console.log(giftTrackingData);

  return (
    <>
    <div className="mx-auto pt-[80px]">
    <div className="flex xl:flex-nowrap flex-wrap gap-4 flex-shrink-0 pb-16 container">
        <div className="w-full flex flex-col gap-y-4 items-center pb-8">
          <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
            gift <span className="prata uppercase">tracker</span>
          </h2>
          <p className="text-center text-base text-gray-600">
            Keep track of who purchased what—and make saying thank you simple
            and seamless.
          </p>
          <img
            src="/assets/Images/profile-view-page-bdr.png"
            alt="Couple"
            className="max-w-[630px] h-auto mx-auto"
          />

          <div className="w-full space-y-3 bg-[#F5F2ED] p-5 mt-8">
            {/* Show message when no transactions */}
            {giftTrackingData.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="max-w-md mx-auto">
                  <img
                    src="/assets/Images/gift.png"
                    alt="No Transactions"
                    className="w-24 h-24 mx-auto mb-6 opacity-50"
                  />
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4 prata">
                    No Transactions Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No gift purchases have been made yet. When guests start buying gifts, 
                    they will appear here for you to track and send thank you messages.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      <strong>Tip:</strong> Share your registry with friends and family to start 
                      receiving gifts and tracking purchases.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="grid grid-cols-6 bg-[#F5F2ED] px-4 pt-6 pb-4 text-xs font-semibold uppercase text-gray-600">
                  <div>Order #</div>
                  <div>Purchased By</div>
                  <div>Date</div>
                  <div>Purchase Amount</div>
                  <div>Gift / Message</div>
                  <div>Thank Yous</div>
                </div>

                {/* Rows */}
                {giftTrackingData.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-6 items-center  bg-white px-4 py-6 text-sm"
                  >
                    <div>{item.checkoutNumber}</div>
                    <div>{item.name}</div>
                    <div>{new Date(item.purchaseDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric', 
                      year: 'numeric'
                    })}</div>
                    <div>${item.totalAmount}</div>
                    <div>
                      <Link to={`/dashboard/viewgifts/${item.greetingId}`}>
                      <button className="border border-gray-700 px-3 py-3 text-sm font-medium hover:bg-gray-100">
                        View Gifts/Message
                      </button>
                      </Link>
                    </div>
                    <div>
                      {item.messageSent ? (
                        <span className="text-xl text-center block text-[#446184] font-bold">✓</span>
                      ) : (
                        <Link to="/dashboard/sendthanks/toguest">
                        <button className=" text-white font-bold py-3 px-3 bg-[#446184] rounded-none cursor-pointer">
                          SEND THANKS
                        </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default GiftTracker;
