import React, {useState, useRef, useEffect} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, Autoplay} from 'swiper/modules';
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import heroImg from '/assets/Images/heroImg.png';
import vectorImg from '/assets/Images/Vector 22.png';
import sampleVideo from '/assets/Images/sample.webm';
import 'swiper/css/pagination';
import Button from '~/components/Button.jsx';

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      type: 'content',
      content: 'Elevated. Effortless. Yours.',
      description:
        'A modern registry for gifts, travel & everything in between.',
      image: heroImg,
    },
    {id: 2, type: 'video', videoSrc: sampleVideo},
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
      autoplay={{delay: 14000}} // Autoplay every 10 seconds
      pagination={{clickable: true}} // Show dots
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          {slide.type === 'content' ? (
            <div>
              <img
                src={slide.image}
                alt="Slide"
                className="w-full h-[510px] lg:h-[1000px] object-cover"
              />
              <div className="absolute flex flex-col items-center top-0 max-w-[50%] max-[1024px]:max-w-[70%] h-full justify-center text-white px-12 gap-8">
                <h3 className="text-5xl leading-[60px] lg:text-[112px] text-center prata lg:leading-[124px] text-shadow">
                  {slide.content}
                </h3>
                <img src={vectorImg} alt="line" className="w-72" />
                <p className="text-sm w-full leading-6 lg:text-2xl text-center font-semibold uppercase lg:w-2xl lg;leading-10">
                  {slide.description}
                </p>
              <div className="mx-auto flex lg:flex-row flex-col gap-6 justify-center items-center ">
                <Button
                  text="Begin Your Journey"
                  className="text-white bg-[#446184] py-[22px] lg:py-[30px] lg:w-[320px] w-[280px] rounded-none button-cs max-[768px]:text-lg"
                />
                <Button
                  text="Find a Couple"
                  className="button-cs text-[#1F1D1B] bg-white border-3 border-[#1F1D1B]  py-[18px] lg:py-[30px] lg:w-[320px] w-[280px] rounded-none max-[768px]:text-lg"
                />
              </div>
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
              className="w-full h-[510px] lg:h-[1000px] object-cover"
            >
              <source
                src={slide.videoSrc}
                type="video/mp4"
                style={{height: '1000px'}}
              />
              Your browser does not support the video tag.
            </video>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;
