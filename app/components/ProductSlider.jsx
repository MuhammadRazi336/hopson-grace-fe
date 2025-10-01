import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import {useNavigate} from '@remix-run/react';

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
    <div className="relative items-start mt-10 lg:mt-[5.469vw] lg:mb-0 mb-10 max-[1024px]:my-[30px]">
      <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] max-[1024px]:max-w-[88%] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
        <div className="swiper-button-prev-prod absolute top-0 max-[1024px]:left-[-15px] -left-[5.1%] max-[1601px]:-left-[8%] h-full cursor-pointer text-white uppercase flex w-[139px] items-center bg-[#446184] lg:w-[7.24vw] lg:h-[18.75vw] justify-center max-[1024px]:w-[28px]">
          <img src={nextitem} alt="" className="rotate-180 invert-100 lg:w-[1.042vw] lg:h-[1.042vw]" />
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
          className="px-[178px]"
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
            1024: {
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
                  className="cursor-pointer"
                  onClick={() => handleProductClick(productNode.handle)}
                >
                  <img 
                    src={firstImage?.url || '/assets/Images/placeholder.jpg'} 
                    alt={firstImage?.altText || productNode.title} 
                    className="rounded-none lg:w-[18.75vw] lg:h-[18.75vw] w-full h-[160px] object-cover" 
                  />
                  <h3 className="mt-2.5 uppercase lg:mt-[1.563vw] lg:text-[1.25vw] lg:leading-[1.25vw] text-[12px] font-medium tracking-wider">
                    {productNode.title}
                  </h3>
                  <p className="lg:text-[1.25vw] lg:leading-[1.25vw] text-[12px] pt-[0.625vw]">
                    {price ? `$${price.amount} ${price.currencyCode}` : 'Price not available'}
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="swiper-button-next-prod absolute top-0 max-[1024px]:right-[-15px] -right-[5.1%] max-[1601px]:-right-[8%] cursor-pointer text-white uppercase flex lg:w-[7.24vw] lg:h-[18.75vw] items-center bg-[#446184] h-full justify-center max-[1024px]:w-[28px]">
          <span className="-rotate-90 lg:text-[1.146vw] lg:leading-[1.667vw] text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="invert-100 lg:w-[1.042vw] lg:h-[1.042vw]" alt="" />
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
