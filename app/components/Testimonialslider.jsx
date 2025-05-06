import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

import test1 from '../assets/Images/test.png';
import test2 from '../assets/Images/test2.png';
import { Navigation, Pagination } from 'swiper/modules';


const Testimonialslider = () => {
    return (
        <div className='testimonialSlider py-20'>
        <Swiper
            loop={true}
            spaceBetween={126}
            slidesPerView={1.65}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            style={{
                paddingRight: 100
            }}
            >
            <SwiperSlide>
                <div className="flex p-4 bg-white ml-[70px] registrytagwhite relative">
                    <img src={test1} alt="Testimonial" className="h-[700px]" />
                    <div className="bg-[#446184] text-white h-auto p-11 absolute bottom-[-70px] right-[-120px] w-[519px]">
                        <span className='text-[186px] ivyora absolute top-0 left-5'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px]">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex p-4 bg-white ml-[70px] registrytagwhite relative">
                    <img src={test2} alt="Testimonial" className="h-[700px]" />
                    <div className="bg-[#446184] text-white h-auto p-11 absolute bottom-[-70px] right-[-120px] w-[519px]">
                        <span className='text-[186px] ivyora absolute top-0 left-5'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px]">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex p-4 bg-white ml-[70px] registrytagwhite relative">
                    <img src={test1} alt="Testimonial" className="h-[700px]" />
                    <div className="bg-[#446184] text-white h-auto p-11 absolute bottom-[-70px] right-[-120px] w-[519px]">
                        <span className='text-[186px] ivyora absolute top-0 left-5'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px]">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex p-4 bg-white ml-[70px] registrytagwhite relative">
                    <img src={test2} alt="Testimonial" className="h-[700px]" />
                    <div className="bg-[#446184] text-white h-auto p-11 absolute bottom-[-70px] right-[-120px] w-[519px]">
                        <span className='text-[186px] ivyora absolute top-0 left-5'>“</span>
                        <p className="mt-[110px] text-4xl italic ivyora tracking-wider leading-[48px]">
                        Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo qui molestiae animi. Est quos tempore nam culpa voluptas ea deserunt deserunt ut deserunt quaerat.
                        </p>
                        <h3 className="font-bold mt-[90px] text-right">KARELLE &amp; CHRISTOPER</h3>
                    </div>
                </div>
            </SwiperSlide>


        </Swiper>
            </div>
    );
}

export default Testimonialslider;
