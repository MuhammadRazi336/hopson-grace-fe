import React from 'react'
import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import PreviewRegistry from '~/components/PreviewRegistry'
import GiftCardBg from '/assets/Images/giftCardBg.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import youll1 from '/assets/Images/youll-1.png';
import youll2 from '/assets/Images/youll-2.png';
import youll3 from '/assets/Images/youll-3.png';
import { Navigation } from 'swiper/modules';
import { useState } from 'react';
import {useFetcher} from '@remix-run/react';
import { extractShopifyId } from '~/utils/helpers.js';
import { json } from '@shopify/remix-oxygen';
import 'swiper/css';
import 'swiper/css/navigation';
import { defer } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import ExploreCategories from '~/components/ExploreCategories';

export async function loader(args) {
  const {request, context} = args;
  const {collections} = await loadCollectionData({context});
  const {giftCards} = await loadGiftCardData({context});
  const registry = context?.session?.get('@Registry');
  return defer({collections, giftCards, registry});
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(
      JSON.parse(payload),
      'registryProducts',
      context,
    );
    return json({success: true, response});
  } catch (e) {
    return json({success: false, error: e.message}, {status: 400});
  }
}

async function loadCollectionData({context}) {
    const [{collections}] = await Promise.all([
      context.storefront.query(COLLECTION_QUERY),
      // Add other queries here, so that they are loaded in parallel
    ]);
    return {
      collections: collections.nodes,
    };
  }

async function loadGiftCardData({context}) {
  try {
    const [{collections}] = await Promise.all([
      context.storefront.query(GIFT_CARD_QUERY),
    ]);
    
    // Filter collections that have the giftcard metafield
    const giftCardCollections = collections?.nodes?.filter(collection => 
      collection.metafield?.value === 'true'
    ) || [];
    
    // Extract products from gift card collections
    const giftCards = giftCardCollections.flatMap(collection => 
      collection.products?.edges?.map(edge => ({
        ...edge.node,
        collectionTitle: collection.title
      })) || []
    );
    
    return {
      giftCards,
    };
  } catch (error) {
    console.error('Error loading gift cards:', error);
    return {
      giftCards: [],
    };
  }
}

const GiftCards = () => {
  const {collections, giftCards, registry} = useLoaderData();
  const fetcher = useFetcher();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  console.log('Gift Cards Data:', giftCards);

  const handleAddToRegistry = (giftCard, quantity) => {
    try {
      // Check if registry exists and has an id
      if (!registry || !registry.id) {
        setAlertMessage('Registry not found. Please try again.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      const firstVariant = giftCard?.variants?.edges?.[0]?.node;
      if (!firstVariant) {
        setAlertMessage('Product variant not found.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      const payload = {
        productId: Number(extractShopifyId(giftCard.id)),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry.id),
        productTypeId: 1,
        quantity: quantity,
      };

      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );

      // Show success alert
      setAlertMessage(`${giftCard.title} has been added to your registry!`);
      setAlertType('success');
      setShowAlert(true);
      
      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    } catch (error) {
      setAlertMessage('Failed to add to registry. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    }
  };
  
  return (
    <>
    <div className="pt-[100px] relative p-4">
        <h2 className="mt-0 prata lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
            gift cards
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />

        {/* <PreviewRegistry /> */}
    </div>

    <section className='my-16'>
    <img
        src={GiftCardBg}
        alt=""
        className="w-full h-[510px] lg:h-[800px] object-cover"
      />
    </section>

    {/* Gift Cards Grid Section */}
    {giftCards.length > 0 && (
      <section className="container mx-auto py-12">        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 px-6">
          {giftCards.map((giftCard, index) => {
            const price = giftCard.variants?.edges?.[0]?.node?.priceV2;
            const image = giftCard.images?.edges?.[0]?.node?.url;
            
            return (
              <GiftCard
                key={giftCard.id || index}
                id={giftCard.id}
                image={image}
                title={giftCard.title}
                price={price}
                registryId={registry?.id}
                onAddToRegistry={(quantity) => handleAddToRegistry(giftCard, quantity)}
              />
            );
          })}
        </div>
      </section>
    )}

    <div className="py-[120px] px-12">
          <ExploreCategories/>
        </div>

    <section className="bg-[#FAF9F6] pt-12 pb-8 mb-[100px]">
        <Heading
          text="we think you'll love"
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
    
    {/* Alert Component */}
    {showAlert && (
      <div
        className={`fixed top-4 right-4 ${
          alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}
      >
        <div className="flex items-center">
          {alertType === 'success' && (
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
          {alertType === 'error' && (
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )}
          <span>{alertMessage}</span>
        </div>
      </div>
    )}
    <style jsx>{`
      @keyframes fadeInOut {
        0% {
          opacity: 0;
          transform: translateY(-20px);
        }
        10% {
          opacity: 1;
          transform: translateY(0);
        }
        90% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
      .animate-fade-in-out {
        animation: fadeInOut 3s ease-in-out;
      }
    `}</style>
    </>
  )
}

export default GiftCards

const GiftCard = ({id, image, title, price, registryId, onAddToRegistry}) => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="pt-0 relative z-0">
      <div className="relative group h-[460px]">
        {/* Gift Card Image and Info */}
        <div className="p-4 z-10 relative">
          <img
            src={image}
            alt={title}
            className="w-full h-[300px] object-fill bg-[#446184]"
          />
          <h3 className="text-[18px] font-semibold uppercase mt-3">
            {title}
          </h3>
          <p className="text-sm mt-1">
            {price ? `$${parseFloat(price.amount).toFixed(2)}` : 'Price not available'}
          </p>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute inset-0 z-40 bg-[#FAF9F6] py-4 px-12 flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 group-hover:scale-y-115 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
          <div>
            <img
              src={image}
              alt={title}
              className="w-full h-[220px] mx-auto object-fill mb-2 bg-[#446184]"
            />
            <h4 className="text-xs font-medium uppercase text-left mb-1">
              GIFT CARD
            </h4>
            <h3 className="text-sm font-bold uppercase text-left leading-snug">
              {title}
            </h3>
            <p className="text-sm mt-2 text-left">
              {price ? `$${parseFloat(price.amount).toFixed(2)}` : 'Price not available'}
            </p>
          </div>

          <div className="flex flex-col w-full items-center text-xs">
            {/* Quantity Selector and Add to Registry Button in same line */}
            <div className="flex items-center justify-around w-full mb-4">
              <p className='text-xs font-bold uppercase text-left mb-1'>QTY</p>
              {/* Quantity Selector */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={incrementQuantity}
                  className=" flex items-center justify-center bg-white transition-colors"
                >
                  <img src="/assets/Images/arrowDown.png" className='w-3 h-3 rotate-180' alt="" />
                </button>
                
                <input
                  value={quantity}
                  className="w-16 h-8 text-center border-none outline-none text-sm"
                  readOnly
                />
                
                <button 
                  onClick={decrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img src="/assets/Images/arrowDown.png" className='w-3 h-3' alt="" />
                </button>
              </div>

              {/* Add to Registry Button */}
              <button 
                onClick={() => onAddToRegistry(quantity)}
                className="bg-[#446184] text-white text-xs font-bold py-4 px-6"
              >
                ADD TO REGISTRY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GIFT_CARD_QUERY = `#graphql
query getGiftCards {
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
      metafield(namespace: "custom", key: "giftcard") {
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

const COLLECTION_QUERY = `#graphql
    query {
    collections(first: 50) {
      nodes {
        description
        title
        id
        image {
          id
          url
          altText
          width
          height
        }
        parentMetafield: metafield(namespace: "parent", key: "collection") {
          id
          value
        }
        subMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
        }
        products(first: 10){
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