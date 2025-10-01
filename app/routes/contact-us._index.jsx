import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitle.png';
import {Link} from '@remix-run/react';

const ContactUs = () => {
  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="Work one-on-one with your registry concierge to build, refine, or complete your registry."
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
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
            <div className="lg:w-[41.56%] w-full">
              <img
                src="/assets/Images/appointment.png"
                alt="Image Banner"
                className="max-[1024px]:h-full object-cover object-[80%]"
              />
            </div>
            <div className="bg-[#446184] xl:-bottom-10 xl:-left-16 left-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[57%] w-full max-[768px]:p-10">
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-2xl text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  SETTING UP YOUR REGISTRY
                </h3>
                <img
                  src={lineImghead}
                  alt="lineimg"
                  className="mb-2 mt-2 lg:w-[15.365vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px]"
                />
                <p className="text-sm lg:text-[1.146vw] lg:leading-[1.667vw] max-w-[500px] mt-4 mb-4 text-center text-white">
                  Need a hand getting started? Let our concierge help set up, manage or fulfill your registry. with
                  our Registry Concierge. We’ll walk you through the process,
                  answer your questions, and help you build a registry that
                  reflects your style, your life, and your wishlist.
                </p>

                <h3 className="text-2xl mt-10 text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  ADVICE & REGISTRY FULFILLMENT
                </h3>
                <img
                  src={lineImghead}
                  alt="lineimg"
                  className="mb-2 mt-2 lg:w-[19.365vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px] mx-auto"
                />
                <p className="text-sm lg:text-[1.146vw] lg:leading-[1.667vw]  max-w-[500px] mt-4 mb-4 text-center text-white">
                  Getting close to the big day—or already married? Book a
                  session with our Concierge for help wrapping things up. From
                  choosing your final gifts to coordinating delivery and
                  fulfillment, we’re here to make the process seamless and
                  stress-free.
                </p>
              </div>
              <Link to={"https://calendly.com/concierge-theregistry/30min"}>
                <button className="font-[500] px-2 mt-3 py-0 text-[18px] leading-[18px] transition-colors duration-200 bg-white text-black w-[361px] h-[78px] hover:bg-gray-100">
                  BOOK AN APPOINTMENT
                </button>
              </Link>
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
