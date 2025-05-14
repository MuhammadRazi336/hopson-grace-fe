import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

import test1 from '../assets/Images/test.png';
import test2 from '../assets/Images/test2.png';
import { Navigation, Pagination } from 'swiper/modules';


const Testimonialslider = () => {
    return (
        <div className='testimonialSlider pt-20 pb-5 lg:py-20'>
        <Swiper
            loop={true}
            slidesPerView={1.55}
            spaceBetween={40}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className=''
            breakpoints={{
                340: {
                    slidesPerView: 1,
                    spaceBetween: 16
                },
                767: {
                    slidesPerView: 1,
                    spaceBetween: 16
                },
                2000: {
                    slidesPerView: 1.5,
                    spaceBetween: 40
                },
                
            }}
            >
            <SwiperSlide>
                <div className="flex p-4 max-[1024px]:p-0 bg-white registrytagwhite relative">
                    <img src={test1} alt="Testimonial" className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[95vw]" />
                    <div className="bg-[#446184] text-white h-auto p-11 relative lg:w-[680px] -left-[83px] -bottom-[117px] max-[1024px]:p-5 max-[1024px]:-bottom-[19px] max-[1024px]:-left-[30px] ">
                        <span className='text-[186px] ivyora absolute top-0 left-5 max-[1024px]:text-[62px]'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px] max-[1024px]:text-[16px] max-[1024px]:mt-10 max-[1024px]:leading-normal">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex p-4 max-[1024px]:p-0 bg-white registrytagwhite relative">
                    <img src={test2} alt="Testimonial" className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[95vw]" />
                    <div className="bg-[#446184] text-white h-auto p-11 relative lg:w-[680px] -left-[83px] -bottom-[117px] max-[1024px]:p-5 max-[1024px]:-bottom-[19px] max-[1024px]:-left-[30px]">
                        <span className='text-[186px] ivyora absolute top-0 left-5 max-[1024px]:text-[62px]'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px] max-[1024px]:text-[16px] max-[1024px]:mt-10 max-[1024px]:leading-normal">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex p-4 max-[1024px]:p-0 bg-white registrytagwhite relative">
                    <img src={test1} alt="Testimonial" className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[95vw]" />
                    <div className="bg-[#446184] text-white h-auto p-11 relative lg:w-[680px] -left-[83px] -bottom-[117px] max-[1024px]:p-5 max-[1024px]:-bottom-[19px] max-[1024px]:-left-[30px]">
                        <span className='text-[186px] ivyora absolute top-0 left-5 max-[1024px]:text-[62px]'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px] max-[1024px]:text-[16px] max-[1024px]:mt-10 max-[1024px]:leading-normal">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex p-4 max-[1024px]:p-0 bg-white registrytagwhite relative">
                    <img src={test2} alt="Testimonial" className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[95vw]" />
                    <div className="bg-[#446184] text-white h-auto p-11 relative lg:w-[680px] -left-[83px] -bottom-[117px] max-[1024px]:p-5 max-[1024px]:-bottom-[19px] max-[1024px]:-left-[30px]">
                        <span className='text-[186px] ivyora absolute top-0 left-5 max-[1024px]:text-[62px]'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px] max-[1024px]:text-[16px] max-[1024px]:mt-10 max-[1024px]:leading-normal">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>


        </Swiper>
            </div>
    );
}

export default Testimonialslider;
