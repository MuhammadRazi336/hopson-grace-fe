import React from 'react';
import {Link} from '@remix-run/react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import Heading from '~/components/Heading';
import headingBottomCurve from '../assets/Images/heading-bottom-curve.png';
import nextitem from '/assets/Images/next.png';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import 'swiper/css';
import 'swiper/css/navigation';

const WeThinkYoullLove = ({recommendedProducts = [], productLinkPrefix = '/dashboard/addgifts'}) => {
  // Fallback products if no recommended products are provided
  const fallbackProducts = [
    {
      node: {
        id: '1',
        title: 'ARKE GLASS BOTTLE FOR CARBONATOR PRO',
        handle: 'arke-glass-bottle',
        images: {edges: [{node: {url: '/assets/Images/gift-img-collection-1.png'}}]},
        priceRange: {minVariantPrice: {amount: '95.00', currencyCode: 'USD'}},
      },
    },
    {
      node: {
        id: '2',
        title: 'SMEG TOASTER, 2 SLICE',
        handle: 'smeg-toaster',
        images: {edges: [{node: {url: '/assets/Images/gift-img-collection-2.png'}}]},
        priceRange: {minVariantPrice: {amount: '95.00', currencyCode: 'USD'}},
      },
    },
    {
      node: {
        id: '3',
        title: 'THE BARISTA TOUCH ESPRESSO MAKER',
        handle: 'barista-touch',
        images: {edges: [{node: {url: '/assets/Images/gift-img-collection-3.png'}}]},
        priceRange: {minVariantPrice: {amount: '95.00', currencyCode: 'USD'}},
      },
    },
  ];

  const productsToShow = recommendedProducts && recommendedProducts.length > 0 
    ? recommendedProducts 
    : fallbackProducts;

  return (
    <section className="bg-[#FAF9F6] py-[5.26vw] mb-[9.323vw]">
      <Heading
        text="we think you'll love"
        classes={
          'prata text-2xl lg:text-[2.083vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
        }
        image={headingBottomCurve}
        imageClasses={'max-[1024px]:max-w-[330px] lg:w-[25.625vw] lg:h-[0.417vw]'}
      />

      <div className=" relative items-start mt-[5.573vw] max-[1024px]:my-10">
        <div className="lg:w-[77.969vw] max-w-[85%] mx-auto">
          <div className="swiper-button-prev-prod absolute top-0 left-[0] max-[1601px]:-left-[0%] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
            <img src={nextitem} alt="" className="rotate-90 lg:w-[1.042vw] lg:h-[1.042vw] xl:w-[1.042vw] xl:h-[1.042vw] 2xl:w-[1.042vw] 2xl:h-[1.042vw]" />
            <span className="-rotate-90 text-black lg:text-[1.146vw] block tracking-wider max-[1024px]:hidden">
              more
            </span>
          </div>

          <Swiper
            spaceBetween={15}
            slidesPerView={3}
            loop={true}
            modules={[Navigation]}
            navigation={{
              nextEl: '.swiper-button-next-prod',
              prevEl: '.swiper-button-prev-prod',
            }}
            className="px-[178px]"
            breakpoints={{
              345: {
                spaceBetween: 10,
                centeredSlides: true,
              },
              475: {
                spaceBetween: 15,
                centeredSlides: true,
              },
              768: {
                spaceBetween: 20,
                centeredSlides: true,
              },
              1024: {
                spaceBetween: 30,
                centeredSlides: true,
              },
              1366: {
                spaceBetween: 39,
                centeredSlides: true,
              },
              1600: {
                spaceBetween: 66,
                centeredSlides: true,
              },
            }}
          >
            {productsToShow.map((product) => {
              const productNode = product.node || product;
              const firstImage = productNode.images?.edges?.[0]?.node;
              const price = productNode.priceRange?.minVariantPrice;
              
              return (
                <SwiperSlide key={productNode.id}>
                  <Link to={`${productLinkPrefix}/${productNode.handle}`} className="block cursor-pointer hover:no-underline pointer-events-auto">
                    <img 
                      src={firstImage?.url || '/assets/Images/placeholder.png'} 
                      alt={productNode.title || 'Product'} 
                      className="w-full rounded-none cursor-pointer hover:opacity-80 transition-opacity pointer-events-none" 
                    />
                    <h3 className="mt-2.5 uppercase lg:mt-[1.25vw] lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider cursor-pointer hover:text-gray-600 transition-colors pointer-events-none">
                      {productNode.title}
                    </h3>
                    <p className="lg:text-[1.25vw] text-sm py-2 pointer-events-none">{formatShopifyPrice(price)}</p>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="swiper-button-next-prod absolute top-0 right-[0] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
            <span className="rotate-90 text-black block lg:text-[1.146vw] tracking-wider max-[1024px]:hidden">
              more
            </span>
            <img src={nextitem} className="rotate-270 lg:w-[1.042vw] lg:h-[1.042vw] xl:w-[1.042vw] xl:h-[1.042vw] 2xl:w-[1.042vw] 2xl:h-[1.042vw]" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeThinkYoullLove;

