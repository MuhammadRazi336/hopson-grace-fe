import Heading from "./Heading";
import Items from "./Items";
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '../assets/Images/next.png';

const Sliderwithcontent = () => {
return (
<div>
    <Heading text="Kyle & Erik" classes={`text-3xl font-bold uppercase tracking-[0.1em] mb-[40px]`} />

    <div className="tabandslider relative">
        <Swiper className='pb-[100px]' modules={[Navigation, Pagination]} spaceBetween={50} slidesPerView={1} navigation={{
          nextEl: '.swiper-button-next-tab',
          prevEl: '.swiper-button-prev-tab',
        }}
            slidesPerGroup={1} pagination={{ clickable: true }}>
            <SwiperSlide>
                <Items />
            </SwiperSlide>
            <SwiperSlide>
                <Items />
            </SwiperSlide>
        </Swiper>
        <div
            className="swiper-button-prev-tab absolute left-[-140px] top-1/2.5 transform -translate-y-full z-10 cursor-pointer text-black uppercase flex">
            <img src={nextitem} alt="" className='rotate-180' />
            <span className='rotate-90 text-black block'>PREV</span>
        </div>
        < div
            className="swiper-button-next-tab absolute right-[-140px] top-1/2.5 transform -translate-y-full z-10 cursor-pointer text-black uppercase flex">
            <span className='rotate-90 text-black block'>NEXT</span>
            <img src={nextitem} alt="" />
        </div>
    </div>
</div>
);
}

export default Sliderwithcontent;