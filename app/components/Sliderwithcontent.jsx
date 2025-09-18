import Heading from './Heading';
import Items from './Items';
import React, { useState } from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import nextitem from '/assets/Images/next.png';

const Sliderwithcontent = ({ featuredRegistryData }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  // Debug logging
  console.log('🔍 DEBUG: Sliderwithcontent received:', featuredRegistryData);
  
  if (!featuredRegistryData || !featuredRegistryData.subCollections) {
    console.log('🔍 DEBUG: No valid data structure in Sliderwithcontent');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No registry data available</p>
        <p className="text-sm text-gray-400 mt-2">
          {featuredRegistryData?.parentCollection?.title ? 
            `No subcollections found for ${featuredRegistryData.parentCollection.title}` : 
            'No parent collection found'
          }
        </p>
      </div>
    );
  }

  if (featuredRegistryData.subCollections.length === 0) {
    console.log('🔍 DEBUG: Empty subcollections array in Sliderwithcontent');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No subcollections available</p>
        <p className="text-sm text-gray-400 mt-2">
          {featuredRegistryData?.parentCollection?.title ? 
            `No subcollections found for ${featuredRegistryData.parentCollection.title}` : 
            'No parent collection found'
          }
        </p>
      </div>
    );
  }

  const { parentCollection, subCollections } = featuredRegistryData;
  
  console.log('🔍 DEBUG: Parent collection:', parentCollection);
  console.log('🔍 DEBUG: Sub collections count:', subCollections?.length);
  console.log('🔍 DEBUG: Sub collections:', subCollections);

  return (
    <div>
      <Heading
        text={subCollections[activeSlideIndex]?.title || 'Registry'}
        classes={`text-xl lg:text-[1.458vw] lg:leading-[1.458vw] font-bold uppercase tracking-[0.1em] mt-6 mb-4 lg:mb-[2.083vw]`}
      />

      <div className="tabandslider relative">
        <Swiper
          className="pb-[100px]"
          modules={[Navigation, Pagination]}
          spaceBetween={50}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-tab',
            prevEl: '.swiper-button-prev-tab',
          }}
          slidesPerGroup={1}
          pagination={{clickable: true}}
          onSlideChange={(swiper) => {
            setActiveSlideIndex(swiper.activeIndex);
          }}
        >
          {subCollections?.map((subCollection, index) => (
            <SwiperSlide key={subCollection.id || index}>
              <Items 
                featuredRegistryData={{
                  parentCollection: parentCollection,
                  subCollection: subCollection
                }} 
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        <div className="max-[1024px]:hidden swiper-button-prev-tab absolute left-[-80px] top-1/2.5 transform -translate-y-full z-10 cursor-pointer text-black uppercase flex">
          <img src={nextitem} alt="" className="rotate-180" />
          <span className="rotate-90 text-black block">PREV</span>
        </div>
        <div className="max-[1024px]:hidden swiper-button-next-tab absolute right-[-80px] top-1/2.5 transform -translate-y-full z-10 cursor-pointer text-black uppercase flex">
          <span className="rotate-90 text-black block">NEXT</span>
          <img src={nextitem} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Sliderwithcontent;
