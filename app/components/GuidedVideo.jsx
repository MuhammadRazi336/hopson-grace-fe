import React, { useState } from 'react';

const GuidedVideo = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="guided-video fixed bottom-4 right-4 z-40 z-index-[99] hidden sm:block">
      <video 
        className="guided-video__video rounded-lg shadow-lg w-[143px] h-[250px] object-cover" 
        src="/assets/videos/guided-video.mov" 
        width="143" 
        height="250" 
        controls 
        playsInline 
        poster="/assets/Images/guided-video-poster.png"
      >
      </video>
      <button 
        className="guided-video__close-button w-[36px] h-[36px] flex items-center justify-center absolute -top-3 cursor-pointer -right-3 rounded-full p-1 shadow-lg bg-[#000000]" 
        id="close-guided-video-button" 
        aria-label="Close guided video button"
        onClick={handleClose}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          version="1.1" 
          xmlns="http://www.w3.org/2000/svg" 
          className="guided-video__close-button__icon fill-white"
        >
          <g stroke="none" strokeWidth="1" fillRule="evenodd">
            <g transform="translate(-24.000000, -95.000000)">
              <g id="Shape" transform="translate(24.000000, 95.000000)">
                <path d="M1.06066017,0.353553391 L7.99010678,7.28310678 L14.9191739,0.353553391 C15.114436,0.158291245 15.4310185,0.158291245 15.6262807,0.353553391 C15.8215428,0.548815536 15.8215428,0.865398026 15.6262807,1.06066017 L8.69710678,7.99010678 L15.6262807,14.9191739 C15.8215428,15.114436 15.8215428,15.4310185 15.6262807,15.6262807 C15.4310185,15.8215428 15.114436,15.8215428 14.9191739,15.6262807 L7.99010678,8.69710678 L1.06066017,15.6262807 C0.865398026,15.8215428 0.548815536,15.8215428 0.353553391,15.6262807 C0.158291245,15.4310185 0.158291245,15.114436 0.353553391,14.9191739 L7.28310678,7.99010678 L0.353553391,1.06066017 C0.158291245,0.865398026 0.158291245,0.548815536 0.353553391,0.353553391 C0.548815536,0.158291245 0.865398026,0.158291245 1.06066017,0.353553391 Z"></path>
              </g>
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
};

export default GuidedVideo;
