import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

'use client'; // This is crucial

const SliderItems = () => {

  return (
    <div>
        <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop={true}
      spaceBetween={30}
      slidesPerView={1}
      className="mySwiper"
    >
      <SwiperSlide>
        <div className="h-64 bg-red-300 flex items-center justify-center">Slide 1</div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="h-64 bg-blue-300 flex items-center justify-center">Slide 2</div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="h-64 bg-green-300 flex items-center justify-center">Slide 3</div>
      </SwiperSlide>
    </Swiper>
    </div>
);
};

export default SliderItems;