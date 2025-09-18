import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import vectorImg from '/assets/Images/Vector 14.png';
import headingCurve1 from '../assets/Images/heading-curve1.svg';
import Button from '~/components/Button.jsx';
import iconitem from '/assets/Images/collectionitems.png';
import WorldBestBrands from '/assets/Images/WORLDSBESTBRANDS.png';
import CashTravel from '/assets/Images/CASHTRAVEL.png';
import BespokeTravel from '/assets/Images/BESPOKETRAVEL.png';
import TyNote from '/assets/Images/TYNOTE.png';
import ReadyMadeRegistries from '/assets/Images/READYMADEICON.png';
import { Link } from '@remix-run/react';

const CollectionItems = () => {
  return (
    <div className="relative">
      <div className="max-w-[80%] max-[1024px]:max-w-[1400px] mx-auto relative collection-slider">
        <h2 className="text-3xl leading-normal lg:text-[2.5vw] prata text-center lg:leading-[1.875vw] font-normal mb-2 lg:mb-5">
          why the registry?
        </h2>
        <img
          src={headingCurve1}
          alt=""
          className="w-[350px] lg:w-[20.521vw] m-auto mb-[1.771vw]"
        />
        <p className="text-center lg:text-[1.354vw] lg:leading-[1.979vw] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-10 mb-8">
        A smarter, more stylish way to register—curated for how couples live now.
      </p>
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
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
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
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                <>CASH <br/>FUNDS</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={BespokeTravel}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                <>BESPOKE <br/>TRAVEL</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={TyNote}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                THANK YOU NOTE TRACKER
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={ReadyMadeRegistries}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                <>READY-MADE <br/>REGISTRIES</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                <>EXCLUSIVE <br/>OFFERS</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                <>PERSONALIZED <br/>GIFTING</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                <>TRAVEL <br/>VOUCHERS</>
              </h3>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center justify-center gap-4 flex-col">
              <img
                src={iconitem}
                alt="icon collection item"
                className="bg-[#F5F2ED] rounded-full w-[7.24vw] h-[7.24vw] p-[1.042vw]"
              />
              <h3 className="text-center font-bold text-sm lg:text-[1.042vw] lg:leading-[1.458vw] leading-normal tracking-[10%]">
                <>GIFT CARDS <br/>GALORE</>
              </h3>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="swiper-button-prev-collection absolute flex left-[10px] top-10.5/20 transform -translate-y-full z-10 cursor-pointer text-black uppercase">
        <img src={nextitem} alt="" className="rotate-180" />
        <span className="rotate-90 text-black max-[1024px]:text-sm">more</span>
      </div>
      <div className="swiper-button-next-collection absolute flex right-[10px] top-10.5/20 transform -translate-y-full z-10 cursor-pointer text-black uppercase">
        <span className="rotate-90 text-black max-[1024px]:text-sm">more</span>
        <img src={nextitem} alt="" />
      </div>
      <div className="flex justify-center items-center">
        <Link to="/why-the-registry">
        <Button
          text="IT’S ALL IN THE DETAILS"
          className="button-cs text-[#1F1D1B] cursor-pointer bg-white lg:text-[0.938vw] lg:leading-[0.938vw] border-3 border-[#1F1D1B]  py-[5px] lg:h-[4.583vw] lg:w-[18.75vw] w-[280px] rounded-none max-[768px]:text-lg hover:bg-gray-100"
        />
        </Link>
      </div>
    </div>
  );
};

export default CollectionItems;
