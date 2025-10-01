import React, {useRef, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, EffectFade} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import moreitem from '/assets/Images/more.png';
import { Link } from '@remix-run/react';

const stepsData = [
  {
    title: "Let's Connect",
    description: (
      <>
        Enter your names and wedding details and start adding gifts and funds - it's that easy. If you'd prefer to talk to us first or set up a virtual appointment, just{' '}
        <Link 
          to="https://calendly.com/concierge-theregistry/setting-up-your-registry" 
          className="text-black hover:text-black underline cursor-pointer font-medium"
        >
          click here
        </Link>{' '}
        to connect.
      </>
    ),
  },
  {
    title: "Personalize Your Registry Page",
    description:
      "Upload a photo, choose a background (or pick one of ours), and add a personal message for your guests. Your registry page is yours to make your own.",
  },
  {
    title: " Add Gifts",
    description:
      `From group gifting and cash funds to one-of-a-kind travel experiences, we make it easy to register for what you really want.
      Browse our curated collections, add gift cards, or start with one of our ready-made registries.
      When you're ready, publish your registry, link it to your wedding website, and share it with guests.`,
  },
  {
    title: "Along the Way",
    description:
      `our private dashboard is your command centre. You can add or edit gifts, track messages from our team, and stay up to date as guests shop your registry.
      Each time a gift is purchased, you’ll be notified but instead of receiving it right away, the value is added to your registry account. This gives you the freedom to adjust quantities or make changes before your final order.
      The easiest part? You can track gifts and send thank-you notes, all at your own pace.`,
  },
  {
    title: "After the Wedding",
    description:
      `Finalize your selections, and we’ll take care of the rest. Enjoy 15% off anything left on your list.`,
  },
  
];

const Steps = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = stepsData.length;

  return (
    <div className="relative w-full max-w-[550px] mx-auto step-slider">
      <Swiper
        spaceBetween={50}
        modules={[Navigation, EffectFade]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        allowTouchMove={false}
        loop={true}
        onSlideChange={(swiper) => {
          // Swiper's realIndex is 0-based and ignores loop duplicates
          setCurrentStep(swiper.realIndex);
        }}
      >
        {stepsData.map((step, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex items-start py-6">
              <div className="text-[40px] lg:text-[2.917vw] lg:leading-[1.875vw] prata font-normal leading-[40px] mr-2 max-[1024px]:hidden">
                {idx + 1}.
              </div>
              <div>
                <div className="flex ">
                  <div className="text-3xl 2xl:text-[56px] lg:text-[42px] prata font-normal leading-9 mr-2 min-[1024px]:hidden">
                    {idx + 1}.
                  </div>
                  <h2 className="uppercase text-lg lg:text-[1.25vw] lg:leading-[1.458vw] font-80 mb-6 leading-lg tracking-[10%]">
                    {step.title}
                  </h2>
                </div>
                <p className="text-sm leading-normal lg:text-[1.25vw] lg:leading-[1.979vw] text-gray-700 w-[90%]">
                  {step.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="absolute z-10 lg:right-0 lg:top-[80px] max-[1024px]:bottom-[26px] max-[1024px]:-right-[17px] flex flex-col items-center text-lg">
        <button
          ref={prevRef}
          className="text-black swiper-button-prev-steps hover:text-gray-500 absolute"
        >
          <img
            src={moreitem}
            alt=""
            className="rotate-180 max-[768px]:w-[12px] "
          />
        </button>
        <div className="text-sm font-light my-1 absolute w-[max-content] left-[-40px] top-[46px] flex items-center gap-[5px]">
          <span className="lg:text-[2.083vw] max-[1024px]:text-[24px] lg:leading-[1.25vw] font-normal">
            {currentStep + 1}
          </span>{' '}
          <span className="text-gray-950 font-normal lg:text-lg text-sm">
            / {totalSteps}
          </span>
        </div>
        <button
          ref={nextRef}
          className="text-black swiper-button-next-steps hover:text-gray-950 absolute"
        >
          <img src={moreitem} className="max-[768px]:w-[12px]" alt="" />
        </button>
      </div>
    </div>
  );
};

export default Steps;
