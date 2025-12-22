import React, {useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination} from 'swiper/modules';
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import heroImg from '/assets/Images/heroImgs.jpg';
import vectorImg from '/assets/Images/Vector 22.png';
import 'swiper/css/pagination';
import Button from '~/components/Button.jsx';
import { NavLink } from '@remix-run/react';
import Popup from './Popup';
import ModalPortal from './ModalPortal';

const HeroSlider = () => {
  const [showPopup, setShowPopup] = useState(false);
  const handleOpenPopup = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  const slides = [
    {
      id: 1,
      type: 'content',
      content: <>elevated. effortless.<br /><span style={{fontFamily: 'ivyora', lineHeight: '10px'}}>yours</span>.</>,
      description:
        <>A modern registry for gifts, travel & <br/>everything in between.</>,
      image: heroImg,
    },
  ];

  const slide = slides[0];

  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView={1}
      pagination={ false }
      className='lg:h-[43vw] xl:h-[43vw] 2xl:h-[43vw] h-[380px]'
    >
      <SwiperSlide key={slide.id}>
        <div className='lg:h-[43vw] xl:h-[43vw] 2xl:h-[43vw] h-[380px]'>
          <img
            src={slide.image}
            alt="Slide"
            className="w-full h-[380px] lg:h-[43vw] xl:h-[43vw] 2xl:h-[43vw] object-cover lg:object-[0vw_-10vw] xl:object-[0vw_-10vw] 2xl:object-[0vw_-10vw]"
          />
          <div className="absolute flex flex-col items-center w-[246px] lg:w-[40%] xl:w-[40%] 2xl:w-[40%] top-0 max-w-[50%] max-[1024px]:max-w-[70%] h-full justify-center text-white px-8">
            <h3 className="text-[40px] leading-[46px] max-w-screen-lg:w-[246px] lg:text-[4.479vw] xl:text-[4.479vw] 2xl:text-[4.479vw] text-center ivyoraDisplay lg:leading-[4.1vw] xl:leading-[4.1vw] 2xl:leading-[4.1vw] font-normal text-shadow">
              {slide.content}
            </h3>
            <img src={vectorImg} alt="line" className="w-72 max-[1024px]:w-[158px] mt-[2vw] max-[1024px]:mt-[10px]" />
            <p className="text-[12px] w-full max-[1024px]:w-[170px] max-[1024px]:mt-[15px] leading-[16px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] mt-[2.604vw] text-center font-semibold uppercase lg:w-2xl lg:leading-[2.083vw] xl:w-2xl xl:leading-[2.083vw] 2xl:w-2xl 2xl:leading-[2.083vw]">
              {slide.description}
            </p>
            <div className="mx-auto flex lg:flex-row flex-col gap-[15px] mt-[2.604vw] max-[1024px]:mt-[18px] justify-center items-center ">
              <Button
                onClick={handleOpenPopup}
                text="Begin Your Journey"
                className="text-white tracking-[1.28px] max-[1024px]:w-[224px] max-[1024px]:h-[44px] cursor-pointer text-[16px] lg:px-[5px] lg:text-[0.833vw] lg:leading-[0.938vw] leading-[18px] bg-[#446184] py-[2px] lg:h-[4.063vw] lg:w-[14.353vw] w-[275.58px] rounded-none button-cs max-[1024px]:text-[10px]"
              />
              {showPopup && (
                <Popup onClose={handleClosePopup} />
              )}

              <NavLink to="/couple">
              <Button
                text="Find a Couple"
                className="button-cs tracking-[1.28px] max-[1024px]:w-[224px] max-[1024px]:h-[44px] cursor-pointer text-[#1F1D1B] text-[16px] lg:text-[0.833vw] lg:leading-[0.938vw] leading-[18px] lg:px-[5px] lg:h-[4.063vw] bg-white py-[2px] lg:w-[14.353vw] w-[275.58px] rounded-none max-[1024px]:text-[10px]"
              />
              </NavLink>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroSlider;
