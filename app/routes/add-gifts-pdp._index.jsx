import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import nextitem from '/assets/Images/next.png';
import ProductSlider from '~/components/ProductSlider';
import brandline from '/assets/Images/brandline.png';
import 'swiper/css';
import 'swiper/css/navigation';
import product3 from '/assets/Images/product3.png';
import product2 from '/assets/Images/product2.png';
import product1 from '/assets/Images/product1.png';
import product4 from '/assets/Images/product4.png';
import ExploreCategories from '~/components/ExploreCategories';

export default function ProductSection() {
  const images = [
    '/assets/Images/gift-prod-1.png',
    '/assets/Images/gift-prod-2.png',
    '/assets/Images/gift-prod-3.png',
    '/assets/Images/gift-prod-1.png', // Reuse to make 4 images
  ];
  return (
    <>
      <div>
        <Header />
        <div className="flex container flex-col lg:flex-row max-w-screen-xl mx-auto px-4 py-12 gap-8">
          {/* Images Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product ${index + 1}`}
                className="object-cover aspect-square "
              />
            ))}
          </div>

          {/* Product Info */}
          <div className="flex-1 ml-4 flex flex-col pr-12">
            <h2 className="text-sm font-medium uppercase ">Hopson Grace</h2>
            <h1 className="text-3xl m-0 mb-3 prata font-semibold">
              marble butter keeper
            </h1>
            <p className="text-xl font-medium">$80.00</p>

            {/* Quantity & Buttons */}
            <div className="flex items-center gap-4 mt-4">
              <span className="font-medium">QTY</span>
              <div className="flex flex-col items-center">
                <button className="text-lg leading-none">▲</button>
                <span className="my-1">
                  <input
                    type="number"
                    className="w-10 text-center border-none pr-1"
                    value={1}
                  />
                </span>
                <button className="text-lg leading-none">▼</button>
              </div>
              <button class="bg-[#446184] text-white text-xs font-bold py-4 px-8">
                ADD TO REGISTRY
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="border rounded-full w-6 h-6 flex items-center justify-center text-sm"
                />
                <p className="text-md text-center">
                  {' '}
                  Tag as <br /> Group Gift
                </p>
              </div>
            </div>

            {/* Description */}
            <div className=" text-md mt-6">
              <p>
                Keep your butter spreadable and fresh in this butter keeper, a
                French invention when refrigeration didn’t exist. Marble
                naturally keeps butter cool, and the French naturally know their
                way around the kitchen.
              </p>

              <p className="mt-4 font-semibold">How it works:</p>
              <p className="text-md">
                Fill your butter keeper with 1/4&quot; cold water to keep butter
                soft. Change water every 3–5 days to keep butter fresh.
              </p>

              <p className="mt-4 font-semibold">Details:</p>
              <p>H 4.25&quot; | 4&quot; DIA</p>
            </div>
          </div>
        </div>

        <section className="bg-[#446184] text-white py-12 px-6">
          <div className="container mx-auto flex flex-col lg:flex-row gap-10">
            {/* Left Text Section */}
            <div className="lg:w-3/12 w-full flex flex-col gap-4">
              <p className="text-sm tracking-wide uppercase mb-2 border-b border-white w-fit pb-1">
                Meet the Maker
              </p>
              <h2 className="text-3xl font-serif mb-1">hopson grace</h2>
              <p className="text-xs uppercase mb-4">Toronto</p>
              <p className="text-sm leading-relaxed mb-6">
                Lorem ipsum dolor sit amet. Ab nesciunt officia qui labore unde
                33 veniam reprehenderit ut impedit perspiciatis in magnam
                accusantium est ratione dignissimos qui dolor internos. Sit
                laboriosam rerum est minima provident eos doloremque omnis.
              </p>
              <button className="bg-white text-[#3e5c7b] px-4 py-2 text-sm font-semibold uppercase tracking-wide">
                View Full Profile
              </button>
            </div>
            <section className="lg:w-9/12 w-full  container ">
              <div className="relative items-start mt-[105px] mb-10 max-[1024px]:my-10 mr-8">
                <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
                  <Swiper
                    spaceBetween={39}
                    slidesPerView={3}
                    modules={[Navigation, Pagination]}
                    navigation={{
                      nextEl: '.swiper-button-next-prod',
                      prevEl: '.swiper-button-prev-prod',
                    }}
                    className="px-[178px]"
                    style={{}}
                    loop={true}
                    breakpoints={{
                      345: {
                        slidesPerView: 1,
                        spaceBetween: 5,
                      },
                      475: {
                        slidesPerView: 2,
                        spaceBetween: 19,
                      },
                      768: {
                        slidesPerView: 2,
                        spaceBetween: 19,
                      },
                      1366: {
                        slidesPerView: 3,
                        spaceBetween: 19,
                      },
                      1440: {
                        slidesPerView: 4,
                        spaceBetween: 19,
                      },
                      1600: {
                        slidesPerView: 3,
                        spaceBetween: 19,
                      },
                    }}
                  >
                    <SwiperSlide>
                      <img
                        src={product1}
                        alt="Marble Butter Keeper"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        CLASSIC TUMBLER, SET OF 6
                      </h3>
                      <p className="lg:text-2xl text-sm">$80</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product2}
                        alt="Belle-V Icecream Scoop"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        FARMHOUSE BOWL 11”
                      </h3>
                      <p className="lg:text-2xl text-sm">$95</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product3}
                        alt="Staub Cast Iron Q4"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        RAW HONEY
                      </h3>
                      <p className="lg:text-2xl text-sm">$430</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product3}
                        alt="Staub Cast Iron Q4"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        RAW HONEY
                      </h3>
                      <p className="lg:text-2xl text-sm">$430</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product2}
                        alt="Belle-V Icecream Scoop"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        FARMHOUSE BOWL 11”
                      </h3>
                      <p className="lg:text-2xl text-sm">$95</p>
                    </SwiperSlide>
                  </Swiper>
                  <div className="swiper-button-next-prod absolute top-[45%] z-10 -right-16  cursor-pointer uppercase flex items-center justify-center text-white">
                    <span className="rotate-90 text-white block tracking-wider max-[1024px]:hidden">
                      more
                    </span>
                    <img src={nextitem} className="invert-100" alt="" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <div className="py-[120px] px-12">
          <ExploreCategories />
        </div>
      </div>
      <Footer />
    </>
  );
}
