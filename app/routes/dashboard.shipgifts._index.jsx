import {Link} from '@remix-run/react';
import React from 'react';
import {Footer} from '~/components/Footer';

const ShipGifts = () => {
  return (
    <div className="pt-[80px]">
      <div className=" p-4">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          <span className="prata uppercase">FULFILL +</span> SHIP GIFTS
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-10 h-auto mx-auto"
        />
        <p className="max-w-xl mx-auto text-center  my-5 font-normal leading-relaxed">
          Follow the steps below to make your final selections and order your
          gifts. We recommend fulfilling your registry post-wedding, giving you
          the freedom to adjust quantities or make changes before your final
          order. Don’t forget about your Newlywed Discount - enjoy 15% off
          anything left on your list. Enjoy two complimentary shipments of your
          registry gifts after the wedding. Prefer to receive something sooner?
          You can ship gifts anytime; standard rates apply once your two free
          deliveries are used.
        </p>
      </div>

      <div className="mb-16"></div>
      <section className="container mx-auto mb-10">
        <div className="flex lg:gap-8 flex-wrap xl:flex-nowrap gap-2 items-stretch">
          <div className="lg:w-[40%] w-full">
            <img
              src="/assets/Images/ship-my-gifts.png"
              alt="Image Banner"
              className="max-[1024px]:h-full object-cover object-[80%]"
            />
          </div>
          <div className="bg-[#446184] xl:-bottom-10 xl:-left-16 left-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[60%] w-full max-[768px]:p-10">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full max-w-[410px] text-center">
                FULFILL MY REGITRY + SHIP
              </h3>
              <img
                src="/assets/Images/white-bdr.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%]"
              />
              <p className="text-sm lg:text-xl  max-w-[488px] mt-4 mb-4 text-center text-white">
                Finalize your selections, and we’ll take care of the rest.
              </p>
              <div>
                <button className=" font-bold bg-white text-black px-6 mt-3 py-4 text-sm  hover:bg-gray-100">
                  FULFILL MY REGISTRY <br /> & SHIP MY GIFTS
                </button>
              </div>
            </div>
            <div className="mt-14 flex flex-col items-center justify-center">
              <h3 className="text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full max-w-[410px] text-center">
                BOOK AN APPOINTMENT
              </h3>
              <img
                src="/assets/Images/white-bdr.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[220px] 2xl:w-[30%] mx-auto"
              />
              <p className="text-sm lg:text-xl  max-w-[488px] mt-4 mb-4 text-center text-white">
                Looking for advice or guidance? Book a virtual appointment with
                a registry concierge and we’ll do this with you.
              </p>
              <div>
                <Link to={'https://calendly.com/concierge-theregistry/30min'}>
                  <button className=" font-bold bg-white text-black px-6 mt-3 py-4 text-sm hover:bg-gray-100">
                    BOOK AN APPOINTMENT
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-[120px]"></div>

      <div className="container  mx-auto flex flex-col items-center justify-center">
        <img
          src="/assets/Images/registrylogoSteps.png"
          width={100}
          alt="Image Banner"
          className="max-[1024px]:h-full object-cover object-[80%]"
        />
        <h3 className="text-xl text-center mt-10">
          DIDN’T GET EVERYTHING ON YOUR LIST?
        </h3>
        <p className="text-sm lg:text-xl  max-w-[600px] mt-4 mb-4 text-center ">
          Take advantage of our 15% discount, a one-time opportunity to complete
          your registry.
        </p>
        <div>
          <button className="border w-[300px] mb-20 font-bold bg-white text-black px-6 mt-3 py-4 text-sm hover:bg-gray-100">
            KEEP SHOPPING
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShipGifts;
