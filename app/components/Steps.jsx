import React, {useRef} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, EffectFade} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import moreitem from '/assets/Images/more.png';

const Steps = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

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
      >
        <SwiperSlide>
          <div className="flex items-start py-6">
            <div className="text-[56px] prata font-normal leading-9 mr-2 max-[1024px]:hidden">
              1.
            </div>
            <div>
              <div className="flex ">
                <div className="text-3xl lg:text-[56px] prata font-normal leading-9 mr-2 min-[1024px]:hidden">
                  1.
                </div>
                <h2 className="uppercase text-lg lg:text-[24px] font-80 mb-6 leading-[28px] tracking-[10%]">
                  Let's Connect
                </h2>
              </div>
              <p className="text-sm leading-normal lg:text-[24px] lg:leading-[38px] text-gray-700">
                Enter your names and wedding details and start adding gifts and
                funds. It's that easy! If you'd prefer to talk to us first or
                set up your registry in our Toronto showroom, we can do that as
                well.
              </p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex items-start py-6">
            <div className="text-[56px] prata font-normal leading-9 mr-2 max-[1024px]:hidden">
              2.
            </div>
            <div>
              <div className="flex ">
                <div className="text-3xl lg:text-[56px] prata font-normal leading-9 mr-2 min-[1024px]:hidden">
                  2.
                </div>
                <h2 className="uppercase text-lg lg:text-[24px] font-80 mb-6 leading-[28px] tracking-[10%]">
                  Let's Connect
                </h2>
              </div>
              <p className="text-sm leading-normal lg:text-[24px] lg:leading-[38px] text-gray-700">
                Enter your names and wedding details and start adding gifts and
                funds. It's that easy! If you'd prefer to talk to us first or
                set up your registry in our Toronto showroom, we can do that as
                well.
              </p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex items-start py-6">
            <div className="text-[56px] prata font-normal leading-9 mr-2 max-[1024px]:hidden">
              3.
            </div>
            <div>
              <div className="flex ">
                <div className="text-3xl lg:text-[56px] prata font-normal leading-9 mr-2 min-[1024px]:hidden">
                  3.
                </div>
                <h2 className="uppercase text-lg lg:text-[24px] font-80 mb-6 leading-[28px] tracking-[10%]">
                  Let's Connect
                </h2>
              </div>
              <p className="text-sm leading-normal lg:text-[24px] lg:leading-[38px] text-gray-700">
                Enter your names and wedding details and start adding gifts and
                funds. It's that easy! If you'd prefer to talk to us first or
                set up your registry in our Toronto showroom, we can do that as
                well.
              </p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {/* Custom Navigation */}
      <div className="absolute lg:right-[-50px] lg:top-[80px] max-[1024px]:bottom-[26px] max-[1024px]:-right-[17px] flex flex-col items-center text-lg">
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
            1
          </span>{' '}
          <span className="text-gray-950 font-normal lg:text-lg text-sm">
            / 5
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
