import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import heroImg from '../assets/images/heroImg.png';
import vectorImg from '../assets/images/Vector 22.png';
import sampleVideo from '../assets/images/sample.mp4';
import 'swiper/css/pagination';

// Mark this component as a client component
'use client';

const HeroSlider = () => {
  const slides = [
    { id: 1, type: 'content', content: "Elevated. Effortless. Yours.", description: "A modern registry for gifts, travel & everything in between.", image: heroImg },
    { id: 2, type: 'video', videoSrc: sampleVideo },
    // Add more slides as needed
  ];

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <Swiper
    modules={[Pagination, Autoplay]}
      slidesPerView={1}
      autoplay={{ delay: 14000 }} // Autoplay every 10 seconds
      pagination={{ clickable: true }} // Show dots
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          {slide.type === 'content' ? (
            <div>
              <img src={slide.image} alt="Slide" style={{ width: '100%', height: '1000px', objectFit: 'cover' }}  />
              <div className='absolute flex flex-col items-center top-0 max-w-[50%] h-full justify-center text-white px-12 gap-8'>
                <h3 className='text-[112px] text-center prata leading-[124px]'>{slide.content}</h3>
                <img src={vectorImg} alt="line" className='w-72'  />
                <p className='text-2xl text-center font-semibold uppercase w-2xl leading-10'>{slide.description}</p>
              </div>
            </div>
          ) : (
            <video 
              ref={videoRef}
              width="100%" 
              height="1000px" 
              objectFit="cover" 
              muted 
              loop 
              className='w-full h-[1000px] object-cover'
            >
              <source src={slide.videoSrc} type="video/mp4" style={{ height: '1000px' }} />
              Your browser does not support the video tag.
            </video>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;