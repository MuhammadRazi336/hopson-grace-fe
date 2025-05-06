import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import iconitem from '../assets/Images/collectionitems.png';
import nextitem from '../assets/Images/next.png';

const CollectionItems = () => {

return (
<div className='max-w-[1400px] mx-auto relative collection-slider'>
    <h2 className='text-5xl prata text-center leading-[60px] font-normal mb-5'>Why The Registry?</h2>
    <Swiper  className='my-16' modules={[Navigation]} spaceBetween={50} slidesPerView={5} slidesPerGroup={1} navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>THE WORLD'S <br /> BEST
                    BRANDS</h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>CASH, GIFT CARDS &
                    PERSONALIZED FUNDS</h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>BESPOKE TRAVEL</h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>PRIVATE DASHBOARD & GIFT
                    TRACKER</h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>READY MADE REGISTRIES
                </h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>EXCLUSIVE OFFERS</h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>PERSONALIZED GIFTING
                </h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>TRAVEL VOUCHERS</h3>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='flex items-center justify-center gap-4 flex-col'>
                <img src={iconitem} alt="icon collection item" className='bg-[#F5F2ED] rounded-full w-[82px] p-3' />
                <h3 className='text-center font-bold text-[20px] leading-[28px] tracking-[10%]'>GIFT CARDS GALORE</h3>
            </div>
        </SwiperSlide>
    </Swiper>
    <div className="swiper-button-prev absolute left-[-200px] top-1/2 transform -translate-y-full z-10 cursor-pointer text-black uppercase">
        <img src={nextitem} alt="" className='rotate-180' />
        <span className='rotate-90 text-black'>more</span>
        </div>
    < div className="swiper-button-next absolute right-[-200px] top-1/2 transform -translate-y-full z-10 cursor-pointer text-black uppercase">
        <span className='rotate-90 text-black'>more</span>
        <img src={nextitem} alt="" />
</div>
</div>
);
}

export default CollectionItems;