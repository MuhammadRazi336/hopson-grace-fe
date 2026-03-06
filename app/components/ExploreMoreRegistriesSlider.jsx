import Heading from './Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
import { Link } from '@remix-run/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import nextitem from '/assets/Images/next.png';


const ExploreMoreRegistriesSlider = ({ otherRegistries, className }) => {
  // Check if there are registries to display
  const hasRegistries = otherRegistries && otherRegistries.length > 0;

  return (
    <section className={`bg-[#FAF9F6] py-12 ${className}`}>

      <Heading
        text="explore more registries"
        classes={
          'prata text-2xl lg:text-4xl font-normal text-center max-[1024px]:m-0'
        }
        image={lineImghead}
        imageClasses={'max-[1024px]:max-w-[330px] px-4 '}
      />

      {hasRegistries ? (
        <div className="pt-16 px-4 lg:px-10">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            navigation={{
              nextEl: '.swiper-button-next-prod',
              prevEl: '.swiper-button-prev-prod',
            }}
            pagination={false}
            loop={false}
            className="mySwiper"
          >
            {otherRegistries.map((registry) => (
              <SwiperSlide key={registry.id}>
                <div className="text-center p-4">
                  <Link to={`/registry/${registry.handle}`}>
                    <img 
                      src={registry.image?.url || '/assets/Images/placeholder.png'} 
                      alt={registry.title} 
                      className="w-full object-cover hover:opacity-90 transition-opacity aspect-square"
                    />
                    <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                      {registry.title}
                    </h3>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
            
            {/* Custom Navigation Buttons */}
            <div className="z-10 swiper-button-prev-prod absolute left-[0.5%] lg:w-[5.781vw] xl:w-[5.781vw] lg:h-[5.781vw] xl:h-[5.781vw] 2xl:h-[5.781vw] 2xl:w-[5.781vw] cursor-pointer text-white uppercase items-center bg-white top-[45%] translate-y-[-50%] flex justify-center max-[1024px]:w-[33px]">
                <img src={nextitem} alt="" className="rotate-90 lg:w-[1.875vw] lg:h-[1.875vw] xl:w-[1.875vw] xl:h-[1.875vw] 2xl:w-[1.875vw] 2xl:h-[1.875vw]" />
            </div>
            <div className="z-10 swiper-button-next-prod absolute right-[0.5%] lg:w-[5.781vw] xl:w-[5.781vw] lg:h-[5.781vw] xl:h-[5.781vw] 2xl:h-[5.781vw] 2xl:w-[5.781vw] cursor-pointer text-white uppercase items-center bg-white top-[45%] translate-y-[-50%] flex justify-center max-[1024px]:w-[33px]">
                  <img src={nextitem} alt="" className="rotate-270 lg:w-[1.875vw] lg:h-[1.875vw] xl:w-[1.875vw] xl:h-[1.875vw] 2xl:w-[1.875vw] 2xl:h-[1.875vw]" />
                </div>
          </Swiper>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No registries available to display</p>
        </div>
      )}
    </section>
  );
}

export default ExploreMoreRegistriesSlider;