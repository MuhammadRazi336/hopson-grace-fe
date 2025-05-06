import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '../assets/Images/next.png';
import product3 from '../assets/Images/product3.png';
import product2 from '../assets/Images/product2.png';
import product1 from '../assets/Images/product1.png';
import product4 from '../assets/Images/product4.png';

const ProductSlider = () => {
return (
<div className='relative flex items-start pt-[105px] pb-10'>
    <div
        className="swiper-button-prev-prod  cursor-pointer text-white uppercase flex w-[139px] items-center bg-[#446184] h-[360px] justify-center">
        <img src={nextitem} alt="" className='rotate-180 invert-100' />
        <span className='-rotate-90 text-white block tracking-wider'>more</span>
    </div>
    <div className=' max-w-[1560px] mx-auto'>

        <Swiper spaceBetween={39} slidesPerView={4} modules={[Navigation]} navigation={{
            nextEl: '.swiper-button-next-prod',
            prevEl: '.swiper-button-prev-prod',
          }} className='px-[178px]' style={{
          }} loop={true}>
            <SwiperSlide>
                <img src={product1} alt="Marble Butter Keeper" />
                <h3 className='mt-[30px] uppercase text-2xl font-medium tracking-wider'>MARBLE BUTTER KEEPER</h3>
                <p className='text-2xl'>$80</p>
                <p className='ivyora text-lg'>*The Registry Exclusive</p>
            </SwiperSlide>
            <SwiperSlide>
                <img src={product2} alt="Belle-V Icecream Scoop" />
                <h3 className='mt-[30px] uppercase text-2xl font-medium tracking-wider'>BELLE-V ICECREAM SCOOP</h3>
                <p className='text-2xl'>$95</p>
            </SwiperSlide>
            <SwiperSlide>
                <img src={product3} alt="Staub Cast Iron Q4" />
                <h3 className='mt-[30px] uppercase text-2xl font-medium tracking-wider'>STAUB CAST IRON Q4</h3>
                <p className='text-2xl'>$430</p>
            </SwiperSlide>
            <SwiperSlide>
                <img src={product4} alt="Coluna Fruit Bowls" />
                <h3 className='mt-[30px] uppercase text-2xl font-medium tracking-wider'>COLUNA FRUIT BOWLS</h3>
                <p className='text-2xl'>Prices vary</p>
            </SwiperSlide>
            <SwiperSlide>
                <img src={product1} alt="Coluna Fruit Bowls" />
                <h3 className='mt-[30px] uppercase text-2xl font-medium tracking-wider'>COLUNA FRUIT BOWLS</h3>
                <p className='text-2xl'>Prices vary</p>
            </SwiperSlide>
        </Swiper>
    </div>
    < div
        className="swiper-button-next-prod cursor-pointer  uppercase flex w-[139px] items-center bg-[#446184] h-[360px] justify-center text-white">
        <span className='rotate-90 text-white block tracking-wider'>more</span>
        <img src={nextitem} className='invert-100' alt="" />
</div>
</div>
);
}

export default ProductSlider;