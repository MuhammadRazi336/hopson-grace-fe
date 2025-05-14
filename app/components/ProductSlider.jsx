import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import product3 from '/assets/Images/product3.png';
import product2 from '/assets/Images/product2.png';
import product1 from '/assets/Images/product1.png';
import product4 from '/assets/Images/product4.png';

const ProductSlider = () => {
  return (
    <div className="relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
      <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
        <div className="swiper-button-prev-prod absolute top-0 left-0  cursor-pointer text-white uppercase flex w-[139px] items-center bg-[#446184] h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
          <img src={nextitem} alt="" className="rotate-180 invert-100" />
          <span className="-rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>

        <Swiper
          spaceBetween={39}
          slidesPerView={4}
          modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next-prod',
            prevEl: '.swiper-button-prev-prod',
          }}
          className="px-[178px]"
          style={{}}
          loop={true}
          breakpoints={{
            345: {
              slidesPerView: 1,
              spaceBetween: 5,
            },
            475: {
              slidesPerView: 2,
              spaceBetween: 19,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 19,
            },
            1366: {
              slidesPerView: 3,
              spaceBetween: 19,
            },
            1440: {
              slidesPerView: 4,
              spaceBetween: 19,
            },
            1600: {
              slidesPerView: 4,
              spaceBetween: 19,
            },
          }}
        >
          <SwiperSlide>
            <img src={product1} alt="Marble Butter Keeper" className="w-full" />
            <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              MARBLE BUTTER KEEPER
            </h3>
            <p className="lg:text-2xl text-sm">$80</p>
            <p className="ivyora lg:text-lg text-sm">*The Registry Exclusive</p>
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={product2}
              alt="Belle-V Icecream Scoop"
              className="w-full"
            />
            <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              BELLE-V ICECREAM SCOOP
            </h3>
            <p className="lg:text-2xl text-sm">$95</p>
          </SwiperSlide>
          <SwiperSlide>
            <img src={product3} alt="Staub Cast Iron Q4" className="w-full" />
            <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              STAUB CAST IRON Q4
            </h3>
            <p className="lg:text-2xl text-sm">$430</p>
          </SwiperSlide>
          <SwiperSlide>
            <img src={product4} alt="Coluna Fruit Bowls" className="w-full" />
            <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              COLUNA FRUIT BOWLS
            </h3>
            <p className="lg:text-2xl text-sm">Prices vary</p>
          </SwiperSlide>
          <SwiperSlide>
            <img src={product1} alt="Coluna Fruit Bowls" className="w-full" />
            <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              COLUNA FRUIT BOWLS
            </h3>
            <p className="lg:text-2xl text-sm">Prices vary</p>
          </SwiperSlide>
        </Swiper>
        <div className="swiper-button-next-prod absolute top-0 right-0 cursor-pointer  uppercase flex w-[139px] items-center bg-[#446184] max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px]">
          <span className="rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="invert-100" alt="" />
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
