import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Autoplay} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const Marquee = ({ brands = [] }) => {
  // Debug logging
  console.log('Marquee component received brands:', brands);
  console.log('Brands length:', brands.length);
  
  // Fallback to static images if no brands are provided
  const fallbackBrands = [
    '/assets/Images/brands/1456ead1987f9ff92eaa25a31ac01721cc0ba3d7.png',
    '/assets/Images/brands/5dfd1bfe8206879821a59889873bf7df3766c8f3.png',
    '/assets/Images/brands/image 10.png',
    '/assets/Images/brands/image_11.png',
    '/assets/Images/brands/image 7 (1).png',
    '/assets/Images/brands/image_8.png',
    '/assets/Images/brands/image_9.png'
  ];

  // Use dynamic brands if available, otherwise use fallback
  const displayBrands = brands.length > 0 ? brands : fallbackBrands;
  
  console.log('Display brands:', displayBrands);
  console.log('Using dynamic brands:', brands.length > 0);

  // Function to get brand image URL
  const getBrandImage = (brand) => {
    if (typeof brand === 'string') {
      // Fallback static image path
      return brand;
    }
    // Dynamic brand from GraphQL
    return brand.image?.url || fallbackBrands[0];
  };

  // Function to get brand alt text
  const getBrandAlt = (brand) => {
    if (typeof brand === 'string') {
      return 'Brand';
    }
    return brand.image?.altText || brand.title || 'Brand';
  };

  return (
    <div className="brandSlider">
      <Swiper
        spaceBetween={40}
        slidesPerView="auto"
        centeredSlides={false}
        loop={displayBrands.length > 1} // Only loop if we have more than 1 brand
        speed={6000} // VERY slow transition so it looks continuous
        autoplay={{
          delay: 1,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        allowTouchMove={false} // optional: disables dragging to maintain marquee effect
        className="my-6 lg:my-16 px-12"
        style={{
          paddingLeft: '60px',
          paddingRight: '60px',
        }}
        breakpoints={{
          340: {
            slidesPerView: 1.75,
            spaceBetween: 40,
          },
          475: {
            slidesPerView: 2.75,
            spaceBetween: 40,
          },
          768: {
            slidesPerView: 3.75,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 5.75,
            spaceBetween: 40,
          },
        }}
      >
        {/* Render brands only once - Swiper will handle the loop internally */}
        {displayBrands.map((brand, index) => (
          <SwiperSlide key={`brand-${brand.id || index}`}>
            <div className="flex items-center justify-center">
              <img 
                src={getBrandImage(brand)} 
                alt={getBrandAlt(brand)}
                className="w-52" 
                onError={(e) => {
                  // Fallback to first fallback image if dynamic image fails
                  e.target.src = fallbackBrands[0];
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Marquee;
