import {Link, useLoaderData} from '@remix-run/react';
import {useEffect, useMemo, useState} from 'react';
import { Footer } from '~/components/Footer';

export async function loader(args) {
  const {context} = args;
  
  try {
    const user = await context?.session?.get('@User');
    
    // Check if user session exists
    if (!user?.user?.id) {
      const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
      return clearSessionAndRedirect(context);
    }
    
    let registry;
    try {
      registry = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
    } catch (apiError) {
      // Check if it's a session expiration error
      if (apiError.isSessionExpired || apiError.status === 401 || apiError.status === 403) {
        const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
        return clearSessionAndRedirect(context);
      }
      throw apiError;
    }

    if (!registry?.data?.[0]?.id) {
      throw new Response('Registry not found', {status: 404});
    }

    let data;
    try {
      data = await context.ClientGet(
        `transactions/${registry.data[0].id}`,
        context,
      );
    } catch (apiError) {
      // Check if it's a session expiration error
      if (apiError.isSessionExpired || apiError.status === 401 || apiError.status === 403) {
        const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
        return clearSessionAndRedirect(context);
      }
      throw apiError;
    }

    return {giftTrackingData: data?.data || []};
  } catch (error) {
    // If it's a session expiration error, handle it
    if (error.isSessionExpired || error.status === 401 || error.status === 403) {
      const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
      return clearSessionAndRedirect(context);
    }
    throw error;
  }
}

const GiftTracker = () => {
  const {giftTrackingData} = useLoaderData();
  console.log( 'giftTrackingData', giftTrackingData);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(giftTrackingData.length / ITEMS_PER_PAGE),
  );

  const paginatedGiftTrackingData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return giftTrackingData.slice(startIndex, endIndex);
  }, [giftTrackingData, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
            className="max-w-full h-auto mx-auto"
          />

          <div className="w-full space-y-3 bg-[#F5F2ED] p-5 mt-8">
            {/* Show message when no transactions */}
            {giftTrackingData.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="max-w-md mx-auto">
                  <img
                    src="/assets/Images/NoProduct.png"
                    alt="No Transactions"
                    className="w-3xs h-3xs mx-auto mb-6 opacity-50"
                  />
                  <h3 className="text-[22px] font-semibold text-[#1F1D1B] mb-4 font-['bastardogrotesk']">
                    IT'S QUIET HERE - FOR NOW.
                  </h3>
                  <p className="text-[#1F1D1B] mb-6">
                  Once guests start shopping, your gifts will show up here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="grid grid-cols-6 bg-[#F5F2ED] px-4 pt-6 pb-4 text-xs font-semibold uppercase text-gray-600">
                  <div className='text-center'>Order #</div>
                  <div className='text-center'>Purchased By</div>
                  <div className='text-center'>Date</div>
                  <div className='text-center'>Purchase Amount</div>
                  <div className='text-center'>Gift / Message</div>
                  <div className='text-center'>Thank Yous</div>
                </div>

                {/* Rows */}
                {paginatedGiftTrackingData.map((item, idx) => (
                  <div
                    key={item.greetingsId || item.checkoutNumber || idx}
                    className="grid grid-cols-6 items-center  bg-white px-4 py-6 text-sm"
                  >
                    <div className='text-center'>{item.checkoutNumber}</div>
                    <div className='text-center'>{item.guestName}</div>
                    <div className='text-center'>{new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric', 
                      year: 'numeric'
                    })}</div>
                    <div className='text-center'>${item.amount}</div>
                    <div className='text-center'>
                      <Link to={`/dashboard/viewgifts/${item.productId}`}>
                      <button className="border border-gray-700 px-3 py-3 text-sm font-medium hover:bg-gray-100 uppercase">
                        View Gifts/Message
                      </button>
                      </Link>
                    </div>
                    <div className='text-center'>
                      {item.messageSent ? (
                        <span className='text-xl text-center block text-[#446184] font-bold'>&#10004;</span>
                      ) : (
                        <Link to={`/dashboard/sendthanks/toguest?greetingsId=${item.greetingsId}`}>
                        <button className=" text-white font-bold py-3 px-3 bg-[#446184] rounded-none cursor-pointer">
                          SEND THANKS
                        </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {giftTrackingData.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between px-4 py-4 bg-[#F5F2ED]">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="border border-gray-700 px-4 py-2 text-sm font-medium uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1),
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="border border-gray-700 px-4 py-2 text-sm font-medium uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
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
