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
      <div className="max-[1024px]:max-w-[92%] max-[767px]:max-w-[87.5%] w-[101.56vw] mx-auto relative">
        <div className="swiper-button-prev-prod absolute top-0 max-[1024px]:left-[-38px] max-[767px]:left-[-6.2vw] left-[-11.7vw] w-[9.05vw] h-[23.43vw] cursor-pointer text-white uppercase flex items-center bg-[#446184] justify-center max-[1024px]:w-[28px] max-[767px]:w-[4vw] max-[767px]:h-[39.801vw]">
          <img src={nextitem} alt="" className="rotate-90 invert-100 w-[11px] h-[11px] lg:w-[1.042vw] lg:h-[1.042vw] max-[767px]:w-[8px] max-[767px]:h-[8px]" />
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
                  className="cursor-pointer w-[23.43vw] max-[1024px]:w-full"
                  onClick={() => handleProductClick(productNode.handle)}
                >
                  <img 
                    src={firstImage?.url || '/assets/Images/placeholder.jpg'} 
                    alt={firstImage?.altText || productNode.title} 
                    className="rounded-none w-full h-[23.43vw] object-cover max-[767px]:h-[39.801vw]" 
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
        <div className="swiper-button-next-prod absolute w-[9.05vw] h-[23.43vw] top-0 max-[1024px]:right-[-38px] max-[767px]:right-[-6.2vw] right-[-11.7vw] cursor-pointer text-white uppercase flex items-center bg-[#446184] justify-center max-[1024px]:w-[28px] max-[767px]:w-[4vw] max-[767px]:h-[39.801vw]">
          <span className="-rotate-270 lg:text-[1.146vw] lg:leading-[1.667vw] text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="rotate-270 invert-100 lg:w-[1.042vw] lg:h-[1.042vw] w-[11px] h-[11px] max-[767px]:w-[8px] max-[767px]:h-[8px]" alt="" />
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
