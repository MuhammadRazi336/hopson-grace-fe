import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import vectorImg from '/assets/Images/Vector 14.png';
import Button from '~/components/Button.jsx';
import iconitem from '/assets/Images/collectionitems.png';
import WorldBestBrands from '/assets/Images/WORLDSBESTBRANDS.png';
import CashTravel from '/assets/Images/CASHTRAVEL.png';
import BespokeTravel from '/assets/Images/BESPOKETRAVEL.png';
import TyNote from '/assets/Images/TYNOTE.png';
import ReadyMadeRegistries from '/assets/Images/READYMADEICON.png';

const CollectionItems = () => {
  return (
    <div className="relative">
      <div className="max-w-[80%] max-[1024px]:max-w-[1400px] mx-auto relative collection-slider">
        <h2 className="text-3xl leading-normal lg:text-5xl prata text-center lg:leading-[60px] font-normal mb-2 lg:mb-5">
          Why The Registry?
        </h2>
        <img
          src={vectorImg}
          alt=""
          className="min-[1024px]:hidden w-[310px] m-auto"
        />
        <Swiper
          className="my-16"
          modules={[Navigation]}
          slidesPerView={5}
          slidesPerGroup={1}
          navigation={{
            nextEl: '.swiper-button-next-collection',
            prevEl: '.swiper-button-prev-collection',
          }}
          breakpoints={{
            340: {
              slidesPerView: 2,
              spaceBetween: 0,
            },
            475: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 50,
            },
          }}
        >
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={WorldBestBrands}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                THE WORLD'S <br />
                BEST BRANDS
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={CashTravel}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                CASH FUNDS
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={BespokeTravel}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                BESPOKE TRAVEL
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={TyNote}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                THANK YOU NOTE TRACKER
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={ReadyMadeRegistries}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                READY-MADE REGISTRIES
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                EXCLUSIVE OFFERS
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                PERSONALIZED GIFTING
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                TRAVEL VOUCHERS
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[139px] p-7"
              />
              <h3 className="text-center font-bold text-sm lg:text-[20px] leading-normal lg:leading-[28px] tracking-[10%]">
                GIFT CARDS GALORE
              </h3>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="swiper-button-prev-collection absolute flex left-[10px] top-9/20 transform -translate-y-full z-10 cursor-pointer text-black uppercase">
        <img src={nextitem} alt="" className="rotate-180" />
        <span className="rotate-90 text-black max-[1024px]:text-sm">more</span>
      </div>
      <div className="swiper-button-next-collection absolute flex right-[10px] top-9/20 transform -translate-y-full z-10 cursor-pointer text-black uppercase">
        <span className="rotate-90 text-black max-[1024px]:text-sm">more</span>
        <img src={nextitem} alt="" />
      </div>
      <div className="flex justify-center items-center">
        <Button
          text="IT’S ALL IN THE DETAILS"
          className="button-cs text-[#1F1D1B] bg-white border-3 border-[#1F1D1B]  py-[18px] lg:py-[30px] lg:w-[320px] w-[280px] rounded-none max-[768px]:text-lg"
        />
      </div>
    </div>
  );
};

export default CollectionItems;
