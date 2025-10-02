import React, {useState, useRef, useEffect} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, Autoplay} from 'swiper/modules';
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import heroImg from '/assets/Images/heroImg.png';
import vectorImg from '/assets/Images/Vector 22.png';
import 'swiper/css/pagination';
import Button from '~/components/Button.jsx';
import { NavLink } from '@remix-run/react';

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      type: 'content',
      content: <>elevated. <br />effortless.<br /><span style={{fontFamily: 'ivyora'}}>yours</span>.</>,
      description:
        <>A modern registry for gifts, travel & <br/>everything in between.</>,
      image: heroImg,
    },
    {
      id: 2, 
      type: 'video', 
      // Provide multiple video sources for better compatibility
      videoSources: [
        // Try public path first (works better in deployment)
        { src: '/assets/Images/sample.webm', type: 'video/webm' },
        // Fallback to app assets path
        { src: '/assets/Images/sample.webm', type: 'video/webm' }
      ],
      // Fallback image if video fails
      fallbackImage: heroImg
    },
  ];

  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      // Try to play the video, but handle errors gracefully
      const playVideo = async () => {
        try {
          await videoRef.current.play();
        } catch (error) {
          console.warn('Video autoplay failed:', error);
          // Don't set error state for autoplay failures
        }
      };
      playVideo();
    }
  }, [videoLoaded]);

  const handleVideoError = (e) => {
    const error = e.target.error;
    const details = error ? `Code: ${error.code}, Message: ${error.message}` : 'Unknown error';
    
    setErrorDetails(details);
    
    // Try next video source if available
    if (currentVideoIndex < slides[1].videoSources.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setVideoError(false);
    } else {
      setVideoError(true);
    }
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
  };

  // Reset video state when changing sources
  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
  }, [currentVideoIndex]);

  // Log current environment for debugging
  useEffect(() => {
    // Check browser video support
    checkBrowserVideoSupport();
    
    // Test video accessibility
    testVideoAccessibility();
  }, []);

  // Function to check browser video support
  const checkBrowserVideoSupport = () => {
    const video = document.createElement('video');
    // Browser video support check - silent for production
    video.canPlayType('video/webm');
    video.canPlayType('video/mp4');
    video.canPlayType('video/ogg');
  };

  // Function to test if video files are accessible
  const testVideoAccessibility = async () => {
    for (let i = 0; i < slides[1].videoSources.length; i++) {
      const source = slides[1].videoSources[i];
      try {
        const response = await fetch(source.src, { method: 'HEAD' });
        
        if (response.ok) {
          // Try to actually load the video
          testVideoLoadability(source.src, i);
        }
      } catch (error) {
        console.error(`Video source ${i} (${source.src}): Error -`, error);
      }
    }
  };

  // Function to test if video can actually be loaded
  const testVideoLoadability = (src, index) => {
    const testVideo = document.createElement('video');
    testVideo.muted = true;
    testVideo.preload = 'metadata';
    
    testVideo.onerror = (e) => {
      console.error(`Video source ${index} (${src}): Failed to load metadata`, e);
    };
    
    testVideo.src = src;
  };

  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      slidesPerView={1}
      autoplay={{delay: 14000}} // Autoplay every 14 seconds
      pagination={ false } // Show dots
      className='lg:h-[48.958vw]'
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          {slide.type === 'content' ? (
            <div className='lg:h-[48.958vw]'>
              <img
                src={slide.image}
                alt="Slide"
                className="w-full h-[430px] lg:h-[1000px] object-cover"
              />
              <div className="absolute flex flex-col items-center top-0 max-w-[50%] max-[1024px]:max-w-[70%] h-full justify-center text-white px-8">
                <h3 className="text-[40px] leading-[46px] lg:text-[5.521vw] text-center prata lg:leading-[5.833vw] text-shadow">
                  {slide.content}
                </h3>
                <img src={vectorImg} alt="line" className="w-72 max-[1024px]:w-[158px] mt-[2vw] max-[1024px]:mt-[10px]" />
                <p className="text-[12px] w-full max-[1024px]:w-[170px] max-[1024px]:mt-[15px] leading-[16px] lg:text-[1.25vw] mt-[2.604vw] text-center font-semibold uppercase lg:w-2xl lg:leading-[2.083vw]">
                  {slide.description}
                </p>
              <div className="mx-auto flex lg:flex-row flex-col gap-[15px] mt-[2.604vw] max-[1024px]:mt-[18px] justify-center items-center ">
                <NavLink to="/register">
                <Button
                  text="Begin Your Journey"
                  className="text-white tracking-[1.28px] max-[1024px]:w-[224px] max-[1024px]:h-[44px] cursor-pointer text-[16px] lg:px-[5px] lg:text-[0.833vw] lg:leading-[0.938vw] leading-[18px] bg-[#446184] py-[2px] lg:h-[4.063vw] lg:w-[14.353vw] w-[275.58px] rounded-none button-cs max-[1024px]:text-[10px]"
                />
                </NavLink>
                <NavLink to="/couple">
                <Button
                  text="Find a Couple"
                  className="button-cs tracking-[1.28px] max-[1024px]:w-[224px] max-[1024px]:h-[44px] cursor-pointer text-[#1F1D1B] text-[16px] lg:text-[0.833vw] lg:leading-[0.938vw] leading-[18px] lg:px-[5px] lg:h-[4.063vw] bg-white py-[2px] lg:w-[14.353vw] w-[275.58px] rounded-none max-[1024px]:text-[10px]"
                />
                </NavLink>
              </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-[430px] lg:h-[1000px]">
              {videoError ? (
                // Fallback to image if video fails to load
                <div className="w-full h-full">
                  <img
                    src={slide.fallbackImage}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white bg-black/70 px-6 py-4 rounded max-w-md">
                      <p className="text-lg mb-2">Video unavailable</p>
                      <p className="text-sm mb-4 text-gray-300">{errorDetails}</p>
                      <button
                        onClick={() => {
                          setCurrentVideoIndex(0);
                          setVideoError(false);
                          setVideoLoaded(false);
                          testVideoAccessibility();
                        }}
                        className="bg-white text-black px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Retry Video
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  width="100%"
                  height="100%"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onError={handleVideoError}
                  onLoadedData={handleVideoLoad}
                  onCanPlay={handleVideoCanPlay}
                  className="w-full h-full object-cover"
                >
                  <source
                    src={slides[1].videoSources[currentVideoIndex].src}
                    type={slides[1].videoSources[currentVideoIndex].type}
                  />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;
