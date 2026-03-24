import {Link, useFetcher} from '@remix-run/react';
import React from 'react';
import {Footer} from '~/components/Footer';
import ShipGiftsActionPopup from '~/components/ShipGiftsActionPopup';

export async function action({request, context}) {
  const formData = await request.formData();
  const requestType = String(formData.get('requestType') || '').trim();

  const allowedRequestTypes = new Set([
    'fulfill_my_registry',
    'withdraw_cash',
    'activate_travel_fund',
  ]);

  if (!allowedRequestTypes.has(requestType)) {
    return {success: false, error: 'Invalid request type'};
  }

  try {
    const user = context?.session?.get('@User');
    if (!user?.user?.id) {
      return {success: false, error: 'User not found'};
    }

    const registryResponse = await context.ClientGet(
      `registries/by-userId/${user.user.id}`,
      context
    );
    const registryId = registryResponse?.data?.[0]?.id;

    if (!registryId) {
      return {success: false, error: 'Registry not found'};
    }

    await context.ClientPost(
      {requestType},
      `registries/${registryId}/admin-request-notification`,
      context
    );

    return {success: true};
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Failed to send notification',
    };
  }
}

const ShipGifts = () => {
  const fetcher = useFetcher();
  const [showActionPopup, setShowActionPopup] = React.useState(false);

  React.useEffect(() => {
    if (fetcher.data?.success) {
      setShowActionPopup(true);
    }
  }, [fetcher.data]);

  const handleSendNotification = (requestType) => {
    const submitFormData = new FormData();
    submitFormData.append('requestType', requestType);
    fetcher.submit(submitFormData, {method: 'post'});
  };

  const handleCloseActionPopup = () => {
    setShowActionPopup(false);
  };

  return (
    <div className="pt-[4.323vw]">
      <div className=" p-4">
        <h2 className="mt-0 ivyora lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] text-[24px] prata text-center lg:leading-[3.333vw] xl:leading-[3.333vw] 2xl:leading-[3.333vw] font-normal mb-1">
          <span className="prata">ready to </span><span className='italic'>FULFILL & SHIP?</span>
        </h2>
        <img
          src="/assets/Images/heading-bottom-curve.png"
          alt="Couple"
          className="max-w-[23.646vw] mt-4 h-auto mx-auto"
        />
        <p className="max-w-[45.26vw] mx-auto text-center mt-[4.01vw] mb-6 lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] font-normal leading-relaxed lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] max-[1024px]:max-w-[90%]">
        Your registry gifts and funds will be ready when you are. Many couples choose to finalize selections and arrange deliveries after the wedding, giving them the greatest flexibility and a clearer sense of what they’ll truly need for their home.
        </p>
        <p className="max-w-[45.26vw] mx-auto text-center mt-4 mb-6 lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] font-normal leading-relaxed lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] max-[1024px]:max-w-[90%]">
        When you're ready, simply choose one of the options below to continue. Our team will guide you through the rest.
        </p>
      </div>

      <div className="mb-16 max-[1024px]:mb-[4vw]"></div>
      <section className="mx-auto mb-10 px-[7.906vw] max-[1024px]:px-[40px]">
        <div className="flex lg:gap-8 flex-wrap xl:flex-nowrap gap-2 items-center justify-center">
          <div className="lg:w-[35%] w-full lg:h-[82.813vw] xl:h-[82.813vw] 2xl:h-[82.813vw] relative z-10 xl:-right-8 lg:-right-8 2xl:-right-8">
            <img className="w-[10.417vw] h-[7.813vw] object-contain absolute top-[3.385vw] left-[-3.5vw]" src="/assets/Images/imglogo.png" alt="image icon" />
            <img
              src="/assets/Images/fullshipgifts.jpg"
              alt="Image Banner"
              className="h-full object-cover object-center"
            />
          </div>
          <div className="bg-[#446184] lg:h-[92.813vw] xl:h-[92.813vw] 2xl:h-[92.813vw] xl:-left-8 lg:-left-8 2xl:-left-8  left-0 py-[4.688vw] relative flex items-center justify-center flex-col lg:w-[50%] w-full max-[768px]:p-10">
            <div className="flex flex-col items-center justify-center">
              <h2 className="prata font-normal text-2xl text-white lg:text-[3.75vw] xl:text-[3.75vw] 2xl:text-[3.75vw] 3xl:w-full mb-[1.042vw] max-w-[410px] text-center">
              1.
              </h2>
              <h3 className="text-lg text-white font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full max-w-[410px] text-center">
                FULFILL MY REGITRY + SHIP
              </h3>
              <img
                src="/assets/Images/heading-bottom-curve.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] lg:w-[12.031vw] xl:w-[12.031vw] 2xl:w-[12.031vw] brightness-0 invert-100"
              />
              <p className="text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] lg:w-[33.021vw] xl:w-[33.021vw] 2xl:w-[33.021vw] mt-4 mb-4 text-center text-white">
                When you're ready to fulfill your registry our team will help you review and make any final adjustments, then coordinate delivery. Simply let us know you're ready and we’ll be in touch to guide you through the final steps. Enjoy two complimentary shipments of your gifts; standard shipping rates apply to any extra deliveries. 
              </p>
              <div>
                <button
                  onClick={() => handleSendNotification('fulfill_my_registry')}
                  disabled={fetcher.state !== 'idle'}
                  className="font-bold bg-white text-black px-6 mt-3 py-4 text-sm lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] hover:bg-gray-100 lg:w-[19.635vw] xl:w-[19.635vw] 2xl:w-[19.635vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] cursor-pointer"
                >
                  FULFILL MY REGISTRY
                </button>
              </div>
            </div>
            <div className="mt-[6.25vw] flex flex-col items-center justify-center">
              <h2 className="prata font-normal text-2xl text-white lg:text-[3.75vw] xl:text-[3.75vw] 2xl:text-[3.75vw] 3xl:w-full mb-[1.042vw] max-w-[410px] text-center">
              2.
              </h2>
              <h3 className="text-lg text-white font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full max-w-[410px] text-center">
                WITHDRAW CASH FUNDS
              </h3>
              <img
                src="/assets/Images/heading-bottom-curve.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[220px] lg:w-[12.031vw] xl:w-[12.031vw] 2xl:w-[12.031vw] brightness-0 invert-100"
              />
              <p className="text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] lg:w-[33.021vw] xl:w-[33.021vw] 2xl:w-[33.021vw] mt-4 mb-4 text-center text-white">
                Withdraw your cash at any time, or wait until after your wedding to receive the full amount. When you’re ready, let us know and we’ll securely arrange your transfer. Two withdrawals are on us; additional transfers incur a small processing fee. 
              </p>
              <div>
                <button
                  onClick={() => handleSendNotification('withdraw_cash')}
                  disabled={fetcher.state !== 'idle'}
                  className="font-bold bg-white text-black px-6 mt-3 py-4 text-sm lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] hover:bg-gray-100 lg:w-[19.635vw] xl:w-[19.635vw] 2xl:w-[19.635vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] cursor-pointer"
                >
                  WITHDRAW CASH
                </button>
              </div>
            </div>
            <div className="mt-[6.25vw] flex flex-col items-center justify-center">
              <h2 className="prata font-normal text-2xl text-white lg:text-[3.75vw] xl:text-[3.75vw] 2xl:text-[3.75vw] 3xl:w-full mb-[1.042vw] max-w-[410px] text-center">
              3.
              </h2>
              <h3 className="text-lg text-white font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full max-w-[410px] text-center">
                ACTIVATE MY TRAVEL FUNDS
              </h3>
              <img
                src="/assets/Images/heading-bottom-curve.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[220px] lg:w-[12.031vw] xl:w-[12.031vw] 2xl:w-[12.031vw] brightness-0 invert-100"
              />
              <p className="text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] lg:w-[33.021vw] xl:w-[33.021vw] 2xl:w-[33.021vw] mt-4 mb-4 text-center text-white">
                Ready to begin planning? We'll connect you directly with Porte Travel to start designing your journey.
              </p>
              <div>
                <button
                  onClick={() => handleSendNotification('activate_travel_fund')}
                  disabled={fetcher.state !== 'idle'}
                  className="font-bold bg-white text-black px-6 mt-3 py-4 text-sm lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] hover:bg-gray-100 lg:w-[19.635vw] xl:w-[19.635vw] 2xl:w-[19.635vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] cursor-pointer"
                >
                  ACTIVATE NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-[2.969vw]"></div>

      <div className="container  mx-auto flex flex-col items-center justify-center">
        <img
          src="/assets/Images/imglogo.png"
          width={100}
          alt="Image Banner"
          className="max-[1024px]:h-full object-cover object-[80%]"
        />
        <h3 className="text-xl font-[500] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] text-center mt-[1.771vw]">
          FULFILLMENT QUESTIONS?
        </h3>
        <h3 className="text-xl font-[500] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] text-center mt-1">
          LET US HELP.
        </h3>
        <p className="text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] max-w-[38.49vw] mt-4 mb-4 text-center ">
          Book a virtual appointment with a registry concierge 
        <br />and we’ll do this with you. 
        </p>
        <div>
          <Link to="https://calendly.com/concierge-theregistry/30min" target='_blank'>
          <button className="border w-[300px] lg:w-[24.688vw] xl:w-[24.688vw] 2xl:w-[24.688vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] mb-20 font-bold bg-white text-black px-6 mt-3 py-4 text-sm hover:bg-gray-100">
            BOOK AN APPOINTMENT
          </button>
          </Link>
        </div>
      </div>

      {showActionPopup && <ShipGiftsActionPopup onClose={handleCloseActionPopup} />}

      <Footer />
    </div>
  );
};

export default ShipGifts;
