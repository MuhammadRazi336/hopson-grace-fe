import React, {useRef, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, EffectFade} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import moreitem from '/assets/Images/more.png';

const stepsData = [
  {
    title: "Let's Connect",
    description:
      "Enter your names and wedding details and start adding gifts and funds. It's that easy! If you'd prefer to talk to us first or set up your registry in our Toronto showroom, we can do that as well.",
  },
  {
    title: "Let's Connect",
    description:
      "Enter your names and wedding details and start adding gifts and funds. It's that easy! If you'd prefer to talk to us first or set up your registry in our Toronto showroom, we can do that as well.",
  },
  {
    title: "Let's Connect",
    description:
      "Enter your names and wedding details and start adding gifts and funds. It's that easy! If you'd prefer to talk to us first or set up your registry in our Toronto showroom, we can do that as well.",
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
              <div className="text-[56px] prata font-normal leading-9 mr-2 max-[1024px]:hidden">
                {idx + 1}.
              </div>
              <div>
                <div className="flex ">
                  <div className="text-3xl 2xl:text-[56px] lg:text-[42px] prata font-normal leading-9 mr-2 min-[1024px]:hidden">
                    {idx + 1}.
                  </div>
                  <h2 className="uppercase text-lg 2xl:text-[20px] font-80 mb-6 leading-[28px] tracking-[10%]">
                    {step.title}
                  </h2>
                </div>
                <p className="text-sm leading-normal lg:text-[18px] 2xl:text-[22px] lg:leading-[28px] 2xl:leading-[32px] text-gray-700 w-[90%]">
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
        <div className="text-sm font-light my-1 absolute left-[-40px] top-[46px] flex items-center gap-[5px]">
          <span className="lg:text-[40px] max-[1024px]:text-[24px] lg:leading-6 font-normal">
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
