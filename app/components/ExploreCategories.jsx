import Heading from './Heading';
import headingCurve from '../assets/Images/heading-bottom-curve.png';
import { Link } from '@remix-run/react';
import { useState, useRef } from 'react';
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

function ExploreCategories({ collections = [] }) {
  // Filter collections to only show parent collections (parentMetafield.value === 'true')
  const parentCollections = collections.filter(
    (col) => col.parentMetafield?.value === 'true'
  );
  
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <section className="bg-[#FAF9F6] py-[5.208vw] ">
      <Heading
        text="explore more categories"
        classes={
          'prata text-2xl lg:text-[2.083vw] xl:text-[2.083vw] 2xl:text-[2.083vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
        }
        image={headingCurve}
        imageClasses={'max-[1024px]:max-w-[330px] lg:w-[27.24vw] xl:w-[27.24vw] 2xl:w-[27.24vw]'}
      />

      {/* Swiper carousel with custom buttons */}
      <div className="mt-[5.313vw] relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={35}
          slidesPerView={4}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={handleSlideChange}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 25,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 35,
            },
          }}
          className="explore-categories-swiper"
        >
          {parentCollections.map((col) => (
            <SwiperSlide key={col.id}>
              <Link to={`/products/${col.handle}`} className="hover:no-underline group block">
                <div className="cursor-pointer">
                  <img 
                    src={col.image?.url || '/assets/Images/placeholder.png'} 
                    alt={col.title} 
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity aspect-square" 
                  />
                  <h3 className="mt-2.5 text-center lg:mt-[1.771vw] uppercase lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw] text-sm font-bold tracking-wider cursor-pointer hover:text-gray-600 transition-colors">
                    {col.title}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={isBeginning}
          className={`z-10 rotate-180 mb-8 swiper-button-prev-prod absolute left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase max-[1601px]:w-[90px] items-center bg-white top-[38%] justify-center max-[1024px]:w-[33px] max-[1024px]:h-[33px] max-[1024px]:p-0 flex ${
            isBeginning ? 'opacity-0 cursor-not-allowed' : 'opacity-100 cursor-pointer'
          }`}
        >
          <img src="/assets/Images/sliderNext.png" alt="Prev" className='w-[100px] h-[100px]' />
        </button>

        <button
          onClick={() => swiperRef.current?.slideNext()}
          disabled={isEnd}
          className={`z-10  mb-8 swiper-button-next-prod absolute right-[1%] max-[1601px]:-right-[0%] cursor-pointer text-white uppercase max-[1601px]:w-[90px] items-center bg-white top-[38%] justify-center max-[1024px]:w-[33px] max-[1024px]:h-[33px] max-[1024px]:p-0 flex ${
            isEnd ? 'opacity-0 cursor-not-allowed' : 'opacity-100 cursor-pointer'
          }`}
        >
          <img src="/assets/Images/sliderNext.png" alt="Next" className='w-[100px] h-[100px]' />
        </button>
      </div>
    </section>
  );
}

export default ExploreCategories;