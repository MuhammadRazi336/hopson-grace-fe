import React from 'react';

const AccordionIcon = ({ isOpen, className = '' }) => {
  return (
    <svg 
      width="56" 
      height="56" 
      viewBox="0 0 56 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`w-6 h-6 lg:w-[2.917vw] xl:w-[2.917vw] 2xl:w-[2.917vw] lg:h-[2.917vw] xl:h-[2.917vw] 2xl:h-[2.917vw] transition-transform duration-300 flex-shrink-0 ${
        isOpen ? '' : 'rotate-180'
      } ${className}`}
    >
      <circle cx="28" cy="28" r="28" fill="#446184"/>
      <path d="M28.866 37.5C28.4811 38.1667 27.5189 38.1667 27.134 37.5L18.4737 22.5C18.0888 21.8333 18.5699 21 19.3397 21L36.6603 21C37.4301 21 37.9112 21.8333 37.5263 22.5L28.866 37.5Z" fill="#F5F2ED"/>
    </svg>
  );
};

export default AccordionIcon;

