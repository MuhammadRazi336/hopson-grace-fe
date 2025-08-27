import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitle.png';

const ContactUs = () => {
  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="book a virtual appointment"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-1xl lg:text-2xl font-normal text-center py-16 w-[40%] lg:w-[60%]  mx-auto">
          Questions? We're here for you. From setup to thank-you notes, you can
          reach us anytime for help, guidance, or just a second opinion.
        </p>

        <section className="container mx-auto mb-10">
          <div className="flex lg:gap-8 gap-2 flex-wrap xl:flex-nowrap items-stretch">
            <div className="lg:w-[40%] w-full">
              <img
                src="/assets/Images/appointment.png"
                alt="Image Banner"
                className="max-[1024px]:h-full object-cover object-[80%]"
              />
            </div>
            <div className="bg-[#446184] xl:-bottom-10 xl:-left-16 left-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[60%] w-full max-[768px]:p-10">
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full  text-center">
                  SETTING UP YOUR REGISTRY
                </h3>
                <img
                  src="/assets/Images/white-bdr.png"
                  alt="lineimg"
                  className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%]"
                />
                <p className="text-sm lg:text-xl  max-w-[500px] mt-4 mb-4 text-center text-white">
                  Need a hand getting started? Book a virtual appointment with
                  our Registry Concierge. We’ll walk you through the process,
                  answer your questions, and help you build a registry that
                  reflects your style, your life, and your wishlist.
                </p>

                <h3 className="text-2xl mt-10 text-white lg:text-5xl 2xl:text-xl 3xl:w-full  text-center">
                  ADVICE & REGISTRY FULFILLMENT
                </h3>
                <img
                  src="/assets/Images/white-bdr.png"
                  alt="lineimg"
                  className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%] mx-auto"
                />
                <p className="text-sm lg:text-xl  max-w-[500px] mt-4 mb-4 text-center text-white">
                  Getting close to the big day—or already married? Book a
                  session with our Concierge for help wrapping things up. From
                  choosing your final gifts to coordinating delivery and
                  fulfillment, we’re here to make the process seamless and
                  stress-free.
                </p>
              </div>
              <button 
                    className="font-bold px-6 mt-3 py-4 text-sm transition-colors duration-200 bg-white text-black hover:bg-gray-100"
                  >
                   BOOK AN APPOINTMENT
                  </button>
            </div>
          </div>
        </section>
        <div className="pb-[200px]"></div>
      </div>

      <Footer />
    </section>
  );
};

export default ContactUs;
