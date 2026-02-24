import React, {useState, useCallback, useRef} from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/line.png';
import headingBottomCurve from '../assets/Images/heading-bottom-curve.png';
import Heading from '~/components/Heading';
import {Swiper, SwiperSlide} from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-2.png';
import product1 from '/assets/Images/gift-img-collection-3.png';
import product4 from '/assets/Images/gift-img-collection-4.png';
import {Navigation} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import {Link, useLoaderData, useFetcher, useLocation, redirect, json} from '@remix-run/react';
import {formatPrice} from '~/utils/priceFormatter';
import { RECOMMENDED_PRODUCTS_QUERY } from '~/graphql/product-queries';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import AlertPortal from '~/components/AlertPortal';
import BackToTop from '~/components/BackToTop';




const WeThinkYouLove = ({recommendedProducts}) => {

    
    return ( 
    <section className="bg-[#FAF9F6] py-[3.906vw] flex items-center pl-[5.833vw] mb-[9.01vw] gap-[5.521vw] justify-center max-[767px]:flex-col max-[767px]:py-[50px] max-[767px]:mb-[50px] max-[767px]:px-[20px]">
        <Heading
          text={<>we think <span className="ivyora">you'll love</span></>}
          classes={
            'prata text-2xl lg:text-[2.083vw] xl:text-[2.083vw] 2xl:text-[2.083vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          divClasses={'basis-[27%] w-[27%] max-[1024px]:w-full max-[1024px]:basis-full'}
          image={headingBottomCurve}
          imageClasses={'max-[1024px]:max-w-[330px] w-[14.271vw] h-[6px] object-right object-cover'}
        />

        <div className="relative items-start max-w-[81%] max-[767px]:max-w-[100%] basis-[73%] w-[73%] max-[1024px]:w-full">
          <div className="w-full mx-auto">
            <div className={`swiper-button-prev-prod absolute top-[25%] max-[767px]:top-[95px] left-[2.083vw] cursor-pointer flex w-[5.781vw] h-[6.198vw] items-center justify-center bg-white z-10 swiper-button-lock max-[1024px]:w-[75px] max-[1024px]:h-[75px] max-[1024px]:left-[10px] max-[768px]:w-[55px] max-[768px]:h-[55px] max-[1024px]:top-[75px]`}>
              <img src={nextitem} alt="" className="rotate-90 w-[1.3vw] h-[1.3vw] max-[1024px]:w-[15px] max-[1024px]:h-[15px]" />
            </div>

            <Swiper
              spaceBetween={35}
              slidesPerView={3.5}
              loop={false}
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-prod',
                prevEl: '.swiper-button-prev-prod',
              }}
              className=""
              breakpoints={{
                320: {
                  spaceBetween: 10,
                  slidesPerView: 1,
                },
                475: {
                  spaceBetween: 15,
                  slidesPerView: 2,
                },
                768: {
                  spaceBetween: 20,
                  slidesPerView: 3,
                },
                1024: {
                  spaceBetween: 30,
                  slidesPerView: 3.5,
                },
                1366: {
                  spaceBetween: 30,
                  slidesPerView: 3.5,
                },
                1600: {
                  spaceBetween: 35,
                  slidesPerView: 3.5,
                },
              }}
            >
              {/* Dynamic recommended products */}
              {recommendedProducts && recommendedProducts.length > 0 ? (
                recommendedProducts.map((product) => {
                  const productNode = product.node;
                  const firstImage = productNode.images?.edges?.[0]?.node;
                  const price = productNode.priceRange?.minVariantPrice;
                  
                  return (
                    <SwiperSlide key={productNode.id} className=''>
                      <Link to={`/dashboard/addgifts/${productNode.handle}`} className="block cursor-pointer hover:no-underline pointer-events-auto">
                        <img 
                          src={firstImage?.url || '/assets/Images/placeholder.png'} 
                          alt={productNode.title || 'Product'} 
                          className="w-full aspect-square object-cover rounded-none cursor-pointer hover:opacity-80 transition-opacity pointer-events-none" 
                        />
                        <h3 className="mt-2.5 uppercase lg:mt-[1.354vw] xl:mt-[1.354vw] 2xl:mt-[1.354vw] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] xl:leading-[1.354vw] 2xl:leading-[1.354vw] text-sm font-medium tracking-wider cursor-pointer hover:text-gray-600 transition-colors pointer-events-none">
                          {productNode.title}
                        </h3>
                        <p className="lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm py-2 pointer-events-none">{formatShopifyPrice(price)}</p>
                      </Link>
                    </SwiperSlide>
                  );
                })
              ) : (
                // Fallback to static slides if no recommended products
                <>
                  <SwiperSlide className='w-[18.75vw] min-w-[18.75vw] max-w-[18.75vw] max-[767px]:w-[unset] max-[767px]:min-w-[unset] max-[767px]:max-w-[unset]'>
                    <img src={product1} alt="New Arrival" className="w-full h-[18.75vw] max-[767px]:h-[170px] object-cover rounded-none cursor-pointer hover:opacity-80 transition-opacity pointer-events-none" />
                    <h3 className="mt-2.5 uppercase lg:mt-[1.354vw] xl:mt-[1.354vw] 2xl:mt-[1.354vw] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] xl:leading-[1.354vw] 2xl:leading-[1.354vw] text-sm font-medium tracking-wider cursor-pointer hover:text-gray-600 transition-colors pointer-events-none">
                      ARKE GLASS BOTTLE FOR CARBONATOR PRO
                    </h3>
                    <p className="lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm py-2 pointer-events-none">$95.00</p>
                  </SwiperSlide>
                  <SwiperSlide className='w-[18.75vw] min-w-[18.75vw] max-w-[18.75vw] max-[767px]:w-[unset] max-[767px]:min-w-[unset] max-[767px]:max-w-[unset]'>
                    <img src={product2} alt="Tableware" className="w-full h-[18.75vw] max-[767px]:h-[170px] object-cover rounded-none cursor-pointer hover:opacity-80 transition-opacity pointer-events-none" />
                    <h3 className="mt-2.5 uppercase lg:mt-[1.354vw] xl:mt-[1.354vw] 2xl:mt-[1.354vw] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] xl:leading-[1.354vw] 2xl:leading-[1.354vw] text-sm font-medium tracking-wider cursor-pointer hover:text-gray-600 transition-colors pointer-events-none">
                      SMEG TOASTER, 2 SLICE
                    </h3>
                    <p className="lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm py-2 pointer-events-none">$95.00</p>
                  </SwiperSlide>
                  <SwiperSlide className='w-[18.75vw] min-w-[18.75vw] max-w-[18.75vw] max-[767px]:w-[unset] max-[767px]:min-w-[unset] max-[767px]:max-w-[unset]'>
                    <img src={product3} alt="Staub Cast Iron Q4" className="w-full h-[18.75vw] max-[767px]:h-[170px] object-cover rounded-none cursor-pointer hover:opacity-80 transition-opacity pointer-events-none" />
                    <h3 className="mt-2.5 uppercase lg:mt-[1.354vw] xl:mt-[1.354vw] 2xl:mt-[1.354vw] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] xl:leading-[1.354vw] 2xl:leading-[1.354vw] text-sm font-medium tracking-wider cursor-pointer hover:text-gray-600 transition-colors pointer-events-none">
                      THE BARISTA TOUCH ESPRESSO MAKER
                    </h3>
                    <p className="lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm py-2 pointer-events-none">$95.00</p>
                  </SwiperSlide>
                </>
              )}
            </Swiper>
            <div className="swiper-button-next-prod absolute top-[25%] max-[767px]:top-[95px] right-[2.083vw] cursor-pointer flex w-[5.781vw] h-[6.198vw] items-center justify-center bg-white z-10 swiper-button-lock max-[1024px]:w-[75px] max-[1024px]:h-[75px] max-[1024px]:right-[10px] max-[768px]:w-[55px] max-[768px]:h-[55px] max-[1024px]:top-[75px]">
              <img src={nextitem} className="rotate-270 w-[1.3vw] h-[1.3vw] max-[1024px]:w-[15px] max-[1024px]:h-[15px]" alt="" />
            </div>
          </div>
        </div>
      </section>
     );
}
 
export default WeThinkYouLove;