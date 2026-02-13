import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import "swiper/css/free-mode";
import {Navigation, FreeMode, Autoplay} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import vectorImg from '/assets/Images/Vector 14.png';
import headingCurve1 from '../assets/Images/heading-curve1.svg';
import Button from '~/components/Button.jsx';
import iconitem from '/assets/Images/groupGifting.png';
import newlywedDiscount from '/assets/Images/newlywedDiscount.png';
import freeShipping from '/assets/Images/freeShippings.png';
import fewerBetterThings from '/assets/Images/fewerBetterThings.png';
import WorldBestBrands from '/assets/Images/WORLDSBESTBRANDS.png';
import personalizedRegistry from '/assets/Images/personalized.png';
import styleAdvice from '/assets/Images/styleAdvices.png';
import CashTravel from '/assets/Images/CASHTRAVEL.png';
import BespokeTravel from '/assets/Images/BESPOKETRAVEL.png';
import TyNote from '/assets/Images/TYNOTE.png';
import ReadyMadeRegistries from '/assets/Images/READYMADEICON.png';
import { Link } from '@remix-run/react';

const CollectionItems = () => {
  return (
    <div className="relative">
      <div className="max-w-[100%] max-[1024px]:max-w-[1400px] mx-auto relative collection-slider">
        <h2 className="text-[20px] leading-[36px] lg:text-[2.5vw] prata text-center lg:leading-[1.875vw] font-normal mb-2 lg:mb-5">
          why the registry?
        </h2>
        <img
          src={headingCurve1}
          alt=""
          className="w-[220px] lg:w-[20.521vw] m-auto mb-[1.771vw] max-[1024px]:mb-[52px]"
        />
        <p className="text-center lg:text-[1.354vw] lg:leading-[1.979vw] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-10 mb-[52px] max-[1024px]:hidden">
        A smarter, more stylish way to register—curated for how couples live now.
      </p>
      <Swiper
        className="my-16 max-[1024px]:my-0 pointer-events-none"
        modules={[Autoplay]}
        slidesPerView={7}
        spaceBetween={30}
        allowTouchMove={false}
        simulateTouch={false}
        grabCursor={false} 
        freeMode={{ enabled: true }}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false
        }}
        preventClicks={true}
        preventClicksPropagation={true}
        speed={8000}                   // higher => slower, smoother
        loop={true}
        breakpoints={{
          320:  { slidesPerView: 2, spaceBetween: 20 },
          600:  { slidesPerView: 5, spaceBetween: 30 },
          1025: { slidesPerView: 7, spaceBetween: 50 },
        }}
      >
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={WorldBestBrands}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                THE WORLD’S <br/>BEST BRANDS
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={CashTravel}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                <>CASH <br/>FUNDS</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={BespokeTravel}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                <>BESPOKE <br/>TRAVEL</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={TyNote}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                THANK YOU NOTE <br/>TRACKER
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={ReadyMadeRegistries}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                <>READY-MADE <br/>REGISTRIES</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={iconitem}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                GROUP <br/>GIFTING
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={newlywedDiscount}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                NEWLYWED <br/>DISCOUNT
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={freeShipping}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                FREE <br/>SHIPPING
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={fewerBetterThings}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                FEWER, <br/>BETTER THINGS
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={personalizedRegistry}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                PERSONALIZED <br/>REGISTRY PAGE
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <div className="relative bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[8px] lg:p-[0.5vw] max-[1024px]:w-[100px] max-[1024px]:h-[100px] flex items-center justify-center">
                <img
                  src={styleAdvice}
                  alt="icon collection item"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-center font-bold text-[10px] lg:text-[1.042vw] lg:leading-[1.458vw] leading-[14px] tracking-[1px]">
                STYLE ADVICE <br/>& GUIDED TOOLS
              </h3>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="flex justify-center items-center">
        <Link to="/why-the-registry">
        <Button
          text="Learn More"
          className="button-cs text-[#1F1D1B] cursor-pointer bg-white lg:text-[0.938vw] lg:leading-[0.938vw] border-3 max-[1024px]:border-2 border-[#1F1D1B]  py-[5px] lg:h-[4.583vw] lg:w-[18.75vw] w-[250px] h-[44px] rounded-none max-[768px]:text-lg hover:bg-gray-100 max-[1024px]:mt-[50px] max-[1024px]:mb-[85px]"
        />
        </Link>
      </div>
    </div>
  );
};

export default CollectionItems;
