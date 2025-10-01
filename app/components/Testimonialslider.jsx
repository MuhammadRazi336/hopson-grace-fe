import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/swiper-bundle.css';

import test1 from '/assets/Images/test.png';
import test2 from '/assets/Images/test2.png';
import {Navigation, Pagination} from 'swiper/modules';
import {Link} from '@remix-run/react';

const Testimonialslider = () => {
  return (
    <div className="testimonialSlider pt-[38px] pb-5 lg:pt-20 lg:pb-0">
      <Swiper
        loop={true}
        slidesPerView={1.5}
        spaceBetween={40}
        centeredSlides={true}
        pagination={{clickable: true}}
        modules={[Pagination]}
        className=""
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 1.5,
            spaceBetween: 40,
          },
          2000: {
            slidesPerView: 1.5,
            spaceBetween: 40,
          },
        }}
      >
        <SwiperSlide>
          <div className="flex p-0 max-[1024px]:p-0 bg-white registrytagwhite relative max-[1024px]:h-[700px]">
            <img
              src={test1}
              alt="Testimonial"
              className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[450px] lg:w-[35.417vw] lg:h-[36.458vw] rounded-none"
            />
            <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[29.167vw] lg:h-[36.042vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
              <p className="text-2xl lg:text-[1.25vw] lg:leading-[2.292vw] font-normal tracking-wider leading-[45px] max-[1024px]:text-[16px] max-[1024px]:mt-0 max-[1024px]:leading-normal">
                The first time Karelle met Christopher tate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint obcaecat
                cupiditat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Excepteur sint obcaecat cupiditat
                non proident, sunt in culpa qui officia deserunt mollit anim id
                est laborum.
              </p>
              <Link to="/">
                <h3 className="lg:text-[0.938vw] lg:leading-[0.938vw] text-[16px] flex items-center gap-2 text-white font-normal mt-[2vw]">
                  <span className="border-white border-b-2 pb-[3px] max-[1024px]:hidden">READ ON</span>
                  <img
                    src="/assets/Images/next.png"
                    className="invert-100 -mt-1 lg:w-[0.834vw] lg:h-[0.834vw] max-[1024px]:hidden max-[1024px]:w-[12px] max-[1024px]:h-[12px]"
                    alt="next"
                  />
                </h3>
              </Link>
              <div className="flex flex-col items-end">
                <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                  KARELLE &amp; CHRISTOPER
                </h3>
                <h4 className="text-right ivyora text-xl lg:text-[1.875vw] lg:leading-[2.5vw] font-normal m-0 max-[1024px]:hidden">
                  Paris, France
                </h4>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex p-4 max-[1024px]:p-0 bg-white registrytagwhite relative">
            <img
              src={test2}
              alt="Testimonial"
              className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[700px] lg:w-[35.417vw] lg:h-[36.458vw] rounded-none"
            />
            <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[29.167vw] lg:h-[36.042vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
              <p className="text-2xl lg:text-[1.25vw] lg:leading-[2.292vw] font-normal tracking-wider leading-[45px] max-[1024px]:text-[16px] max-[1024px]:mt-0 max-[1024px]:leading-normal">
                The first time Karelle met Christopher tate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint obcaecat
                cupiditat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Excepteur sint obcaecat cupiditat
                non proident, sunt in culpa qui officia deserunt mollit anim id
                est laborum.
              </p>
              <Link to="/">
                <h3 className="lg:text-[0.938vw] lg:leading-[0.938vw] text-[16px] flex items-center gap-2 text-white font-normal mt-[2vw]">
                  <span className="border-white border-b-2 max-[1024px]:hidden">READ ON</span>
                  <img
                    src="/assets/Images/next.png"
                    className="invert-100 -mt-1 max-[1024px]:hidden max-[1024px]:w-[12px] max-[1024px]:h-[12px]"
                    alt="next"
                  />
                </h3>
              </Link>
              <div className="flex flex-col items-end">
                <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                  KARELLE &amp; CHRISTOPER
                </h3>
                <h4 className="text-right ivyora text-xl lg:text-[1.875vw] lg:leading-[2.5vw] font-normal m-0 max-[1024px]:hidden">
                  Paris, France
                </h4>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex p-4 max-[1024px]:p-0 bg-white registrytagwhite relative">
            <img
              src={test1}
              alt="Testimonial"
              className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[700px] lg:w-[35.417vw] lg:h-[36.458vw] rounded-none"
            />
            <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[29.167vw] lg:h-[36.042vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
              <p className="text-2xl lg:text-[1.25vw] lg:leading-[2.292vw] font-normal tracking-wider leading-[45px] max-[1024px]:text-[16px] max-[1024px]:mt-0 max-[1024px]:leading-normal">
                The first time Karelle met Christopher tate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint obcaecat
                cupiditat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Excepteur sint obcaecat cupiditat
                non proident, sunt in culpa qui officia deserunt mollit anim id
                est laborum.
              </p>
              <Link to="/">
                <h3 className="lg:text-[0.938vw] lg:leading-[0.938vw] text-[16px] flex items-center gap-2 text-white font-normal mt-[2vw]">
                  <span className="border-white border-b-2 max-[1024px]:hidden">READ ON</span>
                  <img
                    src="/assets/Images/next.png"
                    className="invert-100 -mt-1 max-[1024px]:hidden max-[1024px]:w-[12px] max-[1024px]:h-[12px]"
                    alt="next"
                  />
                </h3>
              </Link>
              <div className="flex flex-col items-end">
                <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                  KARELLE &amp; CHRISTOPER
                </h3>
                <h4 className="text-right ivyora text-xl lg:text-[1.875vw] lg:leading-[2.5vw] font-normal m-0 max-[1024px]:hidden">
                  Paris, France
                </h4>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex p-4 max-[1024px]:p-0 bg-white registrytagwhite relative">
            <img
              src={test2}
              alt="Testimonial"
                className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[700px] lg:w-[35.417vw] lg:h-[36.458vw] rounded-none"
            />
            <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[29.167vw] lg:h-[36.042vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
              <p className="text-2xl lg:text-[1.25vw] lg:leading-[2.292vw] font-normal tracking-wider leading-[45px] max-[1024px]:text-[16px] max-[1024px]:mt-10 max-[1024px]:leading-normal">
                The first time Karelle met Christopher tate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint obcaecat
                cupiditat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Excepteur sint obcaecat cupiditat
                non proident, sunt in culpa qui officia deserunt mollit anim id
                est laborum.
              </p>
              <Link to="/">
                <h3 className="lg:text-[0.938vw] lg:leading-[0.938vw] text-2xl flex items-center gap-2 text-white font-normal mt-[2vw]">
                  <span className="border-white border-b-2">READ ON</span>
                  <img
                    src="/assets/Images/next.png"
                    className="invert-100 -mt-1"
                    alt="next"
                  />
                </h3>
              </Link>
              <div className="flex flex-col items-end">
                <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                  KARELLE &amp; CHRISTOPER
                </h3>
                <h4 className="text-right ivyora text-xl lg:text-[1.875vw] lg:leading-[2.5vw] font-normal m-0">
                  Paris, France
                </h4>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Testimonialslider;
