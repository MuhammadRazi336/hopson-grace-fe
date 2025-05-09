import brand1 from '../assets/Images/brands/1456ead1987f9ff92eaa25a31ac01721cc0ba3d7.png';
import brand2 from '../assets/Images/brands/5dfd1bfe8206879821a59889873bf7df3766c8f3.png';
import brand3 from '../assets/Images/brands/image 10.png';
import brand4 from '../assets/Images/brands/image_11.png';
import brand5 from '../assets/Images/brands/image 7 (1).png';
import brand6 from '../assets/Images/brands/image_8.png';
import brand7 from '../assets/Images/brands/image_9.png';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const Marquee = () => {
    return ( 
        <div className='brandSlider'>
            <Swiper
               spaceBetween={0}
               slidesPerView={5.75}
               centeredSlides={true}
               loop={true}
               speed={6000} // VERY slow transition so it looks continuous
               autoplay={{
                 delay: 1,
                 disableOnInteraction: false
               }}
               modules={[Autoplay]}
               allowTouchMove={false} // optional: disables dragging to maintain marquee effect
               className="my-6 lg:my-16 px-12"
               style={{
                 paddingLeft: '60px',
                 paddingRight: '60px',
               }}
               breakpoints={{
                340: {
                    slidesPerView: 1.75,
                    spaceBetween: 40
                },
                475: {
                    slidesPerView: 2.75,
                    spaceBetween: 40
                },
                768: {
                    slidesPerView: 3.75,
                    spaceBetween: 40
                },
                1024: {
                    slidesPerView: 5.75,
                    spaceBetween: 40
                },
            }}
            >
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand1} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand2} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand3} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand4} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand5} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand6} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand7} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand1} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand2} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand3} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand4} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand5} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand6} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='flex items-center justify-center'>
                        <img src={brand7} className='w-52' alt="" />
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
     );
}
 
export default Marquee;