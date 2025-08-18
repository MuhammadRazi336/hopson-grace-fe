import React, { useState } from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/line.png';
import Heading from '~/components/Heading';
import { Swiper, SwiperSlide } from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import youll1 from '/assets/Images/zam-zam.jpg';
import youll2 from '/assets/Images/zam-zam.jpg';
import youll3 from '/assets/Images/zam-zam.jpg';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import { useLoaderData } from '@remix-run/react';

export async function loader({context}) {
    const cashFunds = await loadCashFunds({context});
    return cashFunds;
}

async function loadCashFunds({context}) {
    try {
        const [{collections}] = await Promise.all([
            context.storefront.query(CASH_FUND_QUERY),
        ]);
        
        // Filter collections that have cashfund metafield set to true
        const cashFundCollections = collections?.nodes?.filter(collection => 
            collection.metafield?.value === 'true'
        ) || [];
        
        return cashFundCollections;
    } catch (error) {
        console.error("Error loading cash funds:", error);
        throw error;
    }
}

const DreamFund = () => {
    const cashFunds = useLoaderData();
    const dreamFunds = cashFunds.filter(cashFund => cashFund.title === "Dream Funds Cash Fund")
    const safeCashFunds = Array.isArray(dreamFunds) ? dreamFunds : [];
  return (
    <section>
      <Header />
      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-[500px] lg:h-[800px] flex flex-row items-center justify-center">
        <div className="w-[50%] h-full bg-[#F5F2ED] relative">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%]">
            <Heading
              text={'dream funds'}
              classes={
                'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0 text-black'
              }
              image={lineImghead}
              imageClasses={'w-[150px] lg:w-[330px]'}
            />
            <p className="text-base sm:text-lg lg:text-xl text-black leading-relaxed mx-auto mt-10">
              Think: flight upgrades, home projects, or a honeymoon you’ll
              actually remember. These ready-to-go funds make it easy for guests
              to chip in on the good stuff.
            </p>
          </div>
        </div>
        <div className="w-[50%] h-full">
          <img
            src={'/assets/Images/dreamFunds.png'}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-10">
          <SidebarFilter />
          <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 pt-0 p-4 relative z-0">
            {safeCashFunds.flatMap(collection => 
              collection.products?.edges?.map(edge => {
                const product = edge.node;
                const firstImage = product.images?.edges?.[0]?.node?.url || '/assets/Images/placeholder.png';
                const firstVariant = product.variants?.edges?.[0]?.node;
                const price = firstVariant?.priceV2?.amount || 'N/A';
                
                return (
                  <div key={product.id} className="relative group h-[460px]">
                    {/* Product Image and Info */}
                    <div className="p-4 z-10 relative">
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="w-full h-[300px] object-cover"
                      />
                      <h3 className="text-sm font-semibold uppercase mt-3">
                        {product.title}
                      </h3>
                      <p className="text-sm mt-1">${price}</p>
                    </div>

                    {/* Expanding Overlay */}
                    <div className="absolute inset-0 z-40 bg-[#FAF9F6] py-4 px-12 flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 group-hover:scale-y-115 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
                      <div>
                        <img
                          src={firstImage}
                          alt={product.title}
                          className="w-full h-[220px] mx-auto object-cover mb-2"
                        />
                        <h4 className="text-xs font-medium uppercase text-left mb-1">
                          {collection.title || 'BRAND NAME'}
                        </h4>
                        <h3 className="text-sm font-bold uppercase text-left leading-snug">
                          {product.title}
                        </h3>
                        <p className="text-sm mt-2 text-left">${price}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex flex-col w-full items-center text-xs">
                          {/* Add to Registry Button */}
                          <button className="bg-white w-full block mb-2 text-black uppercase border border-black text-xs font-bold py-4 px-8">
                            personalize fund
                          </button>
                          {/* Add to Registry Button */}
                          <button className="bg-[#446184] w-full block text-white text-xs font-bold py-4 px-8">
                            ADD TO REGISTRY
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) || []
            )}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-md my-10">LOADING 12 of 427</p>

            <WhiteThemeButton Text="View more" link="/quick-start-guide" />

            <button className="border-b mx-auto cursor-pointer mb-20 font-bold bg-white text-black px-6 mt-3 text-sm hover:bg-gray-100">
              Back to Top
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#FAF9F6] pt-12 pb-8 mb-[100px]">
        <Heading
          text="we think you’ll love"
          classes={
            'prata text-2xl lg:text-4xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />

        <div className=" relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
          <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
            <div className="swiper-button-prev-prod absolute top-0 left-[0] max-[1601px]:-left-[0%] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
              <img src={nextitem} alt="" className="rotate-180 " />
              <span className="-rotate-90 text-black block tracking-wider max-[1024px]:hidden">
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
                  spaceBetween: 39,
                  centeredSlides: true,
                },
              }}
            >
              {/* slides here */}
              <SwiperSlide>
                <img src={youll1} alt="New Arrival" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  ARKE GLASS BOTTLE FOR CARBONATOR PRO
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll2} alt="Tableware" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  SMEG TOASTER, 2 SLICE
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll3} alt="Staub Cast Iron Q4" className="w-full" />
                <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
                  THE BARISTA TOUCH ESPRESSO MAKER
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll1} alt="New arrivals" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  ARKE GLASS BOTTLE FOR CARBONATOR PRO
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll2} alt="Staub Cast Iron Q4" className="w-full" />
                <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
                  THE BARISTA TOUCH ESPRESSO MAKER
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
            </Swiper>
            <div className="swiper-button-next-prod absolute top-0 right-[0] max-[1601px]:right-0 cursor-pointer  uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px]">
              <span className="rotate-90 text-black block tracking-wider max-[1024px]:hidden">
                more
              </span>
              <img src={nextitem} className="" alt="" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </section>
  );
};

export default DreamFund;

function SidebarFilter() {
    const [openSections, setOpenSections] = useState({
      categories: true,
      brands: true,
      styles: true,
    });
  
    const toggleSection = (section) => {
      setOpenSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };
  
    return (
      <div className="w-full xl:w-3/12 p-6 h-fit bg-[#FAF9F6]">
        <div className="mb-6">
          <h2
            className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('categories')}
          >
            Categories
            <span className="text-lg">
              {openSections.categories ? (
                <img
                  src="/assets/Images/next.png"
                  alt="minus"
                  className="w-3 h-3 rotate-270"
                />
              ) : (
                <img
                  src="/assets/Images/next.png"
                  alt="plus"
                  className="w-3 h-3 rotate-90"
                />
              )}
            </span>
          </h2>
          {openSections.categories && (
            <ul className="space-y-2 text-sm">
              <li>
                <label>
                  <input type="checkbox" className="mr-2" />
                  HONEYMOON
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="mr-2" />
                  HOME
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="mr-2" />
                  DATE NIGHTS
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="mr-2" />
                  LOREM IPSUM
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="mr-2" />
                  LOREM IPSUM
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="mr-2" />
                  LOREM IPSUM
                </label>
              </li>
            </ul>
          )}
        </div>
      </div>
    );
  }


const CASH_FUND_QUERY = `#graphql
query getCashFundsForDreamFund {
  collections(first: 50) {
    nodes {
      id
      title
      handle
      description
      image {
        id
        url
        altText
        width
        height
      }
      metafield(namespace: "custom", key: "cashfund") {
        id
        value
      }
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;