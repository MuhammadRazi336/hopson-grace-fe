import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import {useNavigate} from '@remix-run/react';
import {formatShopifyPrice} from '~/utils/priceFormatter';

const ProductSlider = ({products = []}) => {
  const navigate = useNavigate();

  const handleProductClick = (productHandle) => {
    // Navigate to product detail page (accessible to everyone)
    navigate(`/dashboard/addgifts/${productHandle}`);
  };
  if (products.length === 0) {
    return (
      <div className="relative items-start mt-10 lg:mt-[5.469vw] lg:mb-0 mb-10 max-[1024px]:my-10">
        <div className="2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto text-center py-16">
          <p className="text-gray-500">No bestseller products found.</p>
          <p className="text-sm text-gray-400 mt-2">Make sure products have the "bestseller" tag in Shopify.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative items-start mt-10 lg:mt-[3.958vw] xl:mt-[3.958vw] 2xl:mt-[3.958vw] lg:mb-0 mb-10 max-[1024px]:my-[30px]">
      <div className="max-[1024px]:max-w-[78%] w-[81.25vw] mx-auto relative">
        <div className="swiper-button-prev-prod absolute top-0 max-[1024px]:left-[-38px] left-[-9.6vw] h-[160px] cursor-pointer text-white uppercase flex w-[139px] items-center bg-[#446184] lg:w-[7.24vw] lg:h-[18.75vw] justify-center max-[1024px]:w-[28px] max-[1024px]:h-[18.75vw] max-[767px]:h-[39.801vw]">
          <img src={nextitem} alt="" className="rotate-90 invert-100 w-[11px] h-[11px] lg:w-[1.042vw] lg:h-[1.042vw]" />
          <span className="-rotate-90 lg:text-[1.146vw] lg:leading-[1.667vw] text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>

        <Swiper
          spaceBetween={40}
          slidesPerView={4}
          modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next-prod',
            prevEl: '.swiper-button-prev-prod',
          }}
          className=""
          style={{}}
          loop={true}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 8,
            },
            475: {
              slidesPerView: 2,
              spaceBetween: 8,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 19,
            },
            1025: {
              slidesPerView: 4,
              spaceBetween: 40,
            }
          }}
        >
          {products.map((product) => {
            const productNode = product.node;
            const firstImage = productNode.images?.edges?.[0]?.node;
            const price = productNode.priceRange?.minVariantPrice;
            
            return (
              <SwiperSlide key={productNode.id}>
                <div 
                  className="cursor-pointer w-[18.75vw] max-[1024px]:w-full"
                  onClick={() => handleProductClick(productNode.handle)}
                >
                  <img 
                    src={firstImage?.url || '/assets/Images/placeholder.jpg'} 
                    alt={firstImage?.altText || productNode.title} 
                    className="rounded-none w-full h-[18.75vw] object-cover max-[767px]:h-[39.801vw]" 
                  />
                  <h3 className="mt-2.5 uppercase lg:mt-[1.563vw] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw] text-[12px] font-medium tracking-wider">
                    {productNode.title}
                  </h3>
                  <p className="lg:text-[1.25vw] lg:leading-[1.25vw] text-[12px] pt-[0.625vw]">
                    {formatShopifyPrice(price)}
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="swiper-button-next-prod absolute top-0 max-[1024px]:right-[-38px] right-[-9.6vw] cursor-pointer text-white uppercase flex lg:w-[7.24vw] lg:h-[18.75vw] h-[160px] items-center bg-[#446184] justify-center max-[1024px]:w-[28px] max-[767px]:h-[39.801vw] max-[1024px]:h-[18.75vw]">
          <span className="-rotate-270 lg:text-[1.146vw] lg:leading-[1.667vw] text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="rotate-270 invert-100 lg:w-[1.042vw] lg:h-[1.042vw] w-[11px] h-[11px]" alt="" />
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
