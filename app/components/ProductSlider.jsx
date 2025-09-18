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
    <div className="relative items-start mt-10 lg:mt-[5.469vw] lg:mb-0 mb-10 max-[1024px]:my-10">
      <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
        <div className="swiper-button-prev-prod absolute top-0 -left-[5.1%] max-[1601px]:-left-[8%] cursor-pointer text-white uppercase flex w-[139px] items-center bg-[#446184] lg:w-[7.24vw] lg:h-[18.75vw] justify-center max-[1024px]:w-[33px]">
          <img src={nextitem} alt="" className="rotate-180 invert-100 lg:w-[1.042vw] lg:h-[1.042vw]" />
          <span className="-rotate-90 lg:text-[1.146vw] lg:leading-[1.667vw] text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>

        <Swiper
          spaceBetween={40}
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
            1024: {
              slidesPerView: 3,
              spaceBetween: 19,
            },
            1025: {
              slidesPerView: 4,
              spaceBetween: 40,
            }
          }}
        >
          <SwiperSlide>
            <img src={product1} alt="Marble Butter Keeper" className="rounded-none w-[18.75vw] h-[18.75vw]" />
            <h3 className="mt-2.5 uppercase lg:mt-[1.563vw] lg:text-[1.25vw] lg:leading-[1.25vw] text-sm font-medium tracking-wider">
              MARBLE BUTTER KEEPER
            </h3>
            <p className="lg:text-[1.25vw] lg:leading-[1.25vw] text-sm pt-[0.625vw]">$80</p>
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={product2}
              alt="Belle-V Icecream Scoop"
              className="rounded-none w-[18.75vw] h-[18.75vw]"
            />
            <h3 className="mt-2.5 uppercase lg:mt-[1.563vw] lg:text-[1.25vw] lg:leading-[1.25vw] text-sm font-medium tracking-wider">
              BELLE-V ICECREAM SCOOP
            </h3>
            <p className="lg:text-[1.25vw] lg:leading-[1.25vw] text-sm pt-[0.625vw]">$95</p>
          </SwiperSlide>
          <SwiperSlide>
            <img src={product3} alt="Staub Cast Iron Q4" className="rounded-none w-[18.75vw] h-[18.75vw]" />
            <h3 className="mt-2.5 uppercase lg:mt-[1.563vw] lg:text-[1.25vw] lg:leading-[1.25vw] text-sm font-medium tracking-wider">
              STAUB CAST IRON Q4
            </h3>
            <p className="lg:text-[1.25vw] lg:leading-[1.25vw] text-sm pt-[0.625vw]">$430</p>
          </SwiperSlide>
          <SwiperSlide>
            <img src={product4} alt="Coluna Fruit Bowls" className="rounded-none w-[18.75vw] h-[18.75vw]" />
            <h3 className="mt-2.5 uppercase lg:mt-[1.563vw] lg:text-[1.25vw] lg:leading-[1.25vw] text-sm font-medium tracking-wider">
              COLUNA FRUIT BOWLS
            </h3>
            <p className="lg:text-[1.25vw] lg:leading-[1.25vw] text-sm pt-[0.625vw]">Prices vary</p>
          </SwiperSlide>
          <SwiperSlide>
            <img src={product1} alt="Coluna Fruit Bowls" className="rounded-none w-[18.75vw] h-[18.75vw]" />
            <h3 className="mt-2.5 uppercase lg:mt-[1.563vw] lg:text-[1.25vw] lg:leading-[1.25vw] text-sm font-medium tracking-wider">
              COLUNA FRUIT BOWLS
            </h3>
            <p className="lg:text-[1.25vw] lg:leading-[1.25vw] text-sm pt-[0.625vw]">Prices vary</p>
          </SwiperSlide>
        </Swiper>
        <div className="swiper-button-next-prod absolute top-0 -right-[5.1%] max-[1601px]:-right-[8%] cursor-pointer text-white uppercase flex lg:w-[7.24vw] lg:h-[18.75vw] items-center bg-[#446184] h-full justify-center max-[1024px]:w-[33px]">
          <span className="-rotate-90 lg:text-[1.146vw] lg:leading-[1.667vw] text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="invert-100 lg:w-[1.042vw] lg:h-[1.042vw]" alt="" />
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
