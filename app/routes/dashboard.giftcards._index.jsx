import React from 'react'
import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import PreviewRegistry from '~/components/PreviewRegistry'
import GiftCardBg from '/assets/Images/giftCardBg.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
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

import { useLoaderData, Link } from '@remix-run/react';
import ExploreCategories from '~/components/ExploreCategories';
import { RECOMMENDED_PRODUCTS_QUERY } from '~/graphql/product-queries';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import AlertPortal from '~/components/AlertPortal';

export async function loader(args) {
  const {request, context} = args;
  const {collections} = await loadCollectionData({context});
  const {giftCards} = await loadGiftCardData({context});
  const user = await context?.session?.get('@User');
  
  // Only fetch registry if user is logged in
  let registry = null;
  if (user && user.user && user.user.id) {
    try {
      registry = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
    } catch (error) {
      console.log('Error fetching registry:', error);
      // Continue without registry data
    }
  }
  
  // Fetch recommended products
  let recommendedProducts = [];
  try {
    const { products: recommendedProductsData } = await context.storefront.query(RECOMMENDED_PRODUCTS_QUERY, { 
      variables: { first: 8 } 
    });
    recommendedProducts = recommendedProductsData?.edges || [];
  } catch (error) {
    console.error('Error loading recommended products:', error);
  }
  
  return json({collections, giftCards, registry, user, recommendedProducts});
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
    const filteredCollections = collections.nodes.filter(collection => 
      collection.parentMetafield?.value === 'true' && collection.readyMadeMetafield?.value !== 'true'
    );
    return {
      collections: filteredCollections,
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
  const {collections, giftCards, registry, user, recommendedProducts} = useLoaderData();
  const fetcher = useFetcher();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  console.log('Gift Cards Data:', giftCards);
  console.log('Collections Data:', collections);
  console.log('Collections count:', collections?.length || 0);
  if (collections && collections.length > 0) {
    console.log('First collection sample:', collections[0]);
    console.log('Collections with parentMetafield:', collections.filter(col => col.parentMetafield?.value === 'true'));
  }

  const handleAddToRegistry = (giftCard, quantity) => {
    try {
      // Check if user is logged in
      if (!user || !user.user || !user.user.id) {
        // User not logged in, redirect to login
        window.location.href = '/login';
        return;
      }

      // Check if registry exists and has an id
      if (!registry || !registry.data[0].id) {
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
        registryId: Number(registry.data[0].id),
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
        className="w-full h-[520px] lg:h-[520px] object-cover"
      />
    </section>

    {/* Gift Cards Grid Section */}
    {giftCards.length > 0 && (
      <section className="w-[81.25vw] mx-auto py-12">        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2.083vw] mt-12">
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
                registryId={registry?.data[0]?.id}
                user={user}
                onAddToRegistry={(quantity) => handleAddToRegistry(giftCard, quantity)}
              />
            );
          })}
        </div>
      </section>
    )}

    <div className="py-[6.771vw] px-0">
          <ExploreCategories collections={collections} />
        </div>

    <section className="bg-[#FAF9F6] pt-[5.26vw] pb-8 mb-[100px]">
        <Heading
          text="we think you'll love"
          classes={
            'prata text-2xl lg:text-[2.083vw] lg:leading-[2.083vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[25.625vw]'}
        />

        <div className=" relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
          <div className="lg:max-w-[81.25vw] max-w-[85%] mx-auto">
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
                  spaceBetween: 66,
                  centeredSlides: true,
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
                    <SwiperSlide key={productNode.id}>
                      <Link to={`/dashboard/addgifts/${productNode.handle}`} className="block cursor-pointer hover:no-underline pointer-events-auto">
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
                })
              ) : (
                // Fallback to static slides if no recommended products
                <>
                  <SwiperSlide>
                    <img src={youll1} alt="New Arrival" className="w-full" />
                    <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-[1.146vw] mb-[0.677vw] text-sm font-medium tracking-wider">
                      ARKE GLASS BOTTLE FOR CARBONATOR PRO
                    </h3>
                    <p className="lg:text-2xl text-sm">$95.00</p>
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={youll2} alt="Tableware" className="w-full" />
                    <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-[1.146vw] mb-[0.677vw] text-sm font-medium tracking-wider">
                      SMEG TOASTER, 2 SLICE
                    </h3>
                    <p className="lg:text-2xl text-sm">$95.00</p>
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={youll3} alt="Staub Cast Iron Q4" className="w-full" />
                    <h3 className="mt-2.5  uppercase lg:mt-[30px] lg:text-[1.146vw] mb-[0.677vw] text-sm font-medium tracking-wider">
                      THE BARISTA TOUCH ESPRESSO MAKER
                    </h3>
                    <p className="lg:text-2xl text-sm">$95.00</p>
                  </SwiperSlide>
                </>
              )}
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
    
    {/* Alert Component - Rendered outside app-scale via portal */}
    {showAlert && (
      <AlertPortal>
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
      </AlertPortal>
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

const GiftCard = ({id, image, title, price, registryId, user, onAddToRegistry}) => {
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
      <div className="relative group h-[460px] lg:h-[31.313vw]">
        {/* Gift Card Image and Info */}
        <div className="relative">
          <img
            src={image}
            alt={title}
            className="w-full h-[300px] lg:h-[18.75vw] object-contain bg-[#446184]"
          />
          <h3 className="text-[18px] font-semibold uppercase mt-3">
            {title}
          </h3>
          <p className="text-sm mt-1">
            {price ? `$${parseFloat(price.amount).toFixed(2)}` : 'Price not available'}
          </p>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute inset-0 z-40 bg-[#FAF9F6] py-[2vw] px-[2.24vw] flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
          <div>
            <img
              src={image}
              alt={title}
              className="w-full h-[200px] lg:h-[13.542vw] mx-auto object-contain mb-[20px] bg-[#446184]"
            />
            <h4 className="text-[16px] lg:text-[0.833vw] leading-[16px] lg:leading-[0.833vw] font-normal uppercase text-left m-0 mb-[10px]">
              GIFT CARD
            </h4>
            <h3 className="text-[20px] lg:text-[1.146vw] lg:leading-[1.146vw] font-[500] uppercase text-left leading-[22px] m-0">
              {title}
            </h3>
            <p className="text-[20px] lg:text-[1.25vw] leading-[20px] lg:leading-[1.25vw] mt-[22px] text-left">
              {price ? `$${parseFloat(price.amount).toFixed(2)}` : 'Price not available'}
            </p>
          </div>

          <div className="flex flex-col w-full items-center text-xs">
            {/* Quantity Selector and Add to Registry Button in same line */}
            <div className="flex items-center justify-around w-full mb-4">
              <p className='text-[18px] lg:text-[0.938vw] font-[500] uppercase text-left mb-1'>QTY</p>
              {/* Quantity Selector */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={incrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img src="/assets/Images/arrowDown.png" className='w-3 h-3 lg:w-[0.833vw] lg:h-[0.833vw] rotate-180' alt="" />
                </button>
                
                <input
                  value={quantity}
                  className="w-16 lg:text-[1.458vw] lg:leading-[1.25vw] lg:h-[1.563vw] relative top-[2px] p-0 mx-0 my-[0.521vw] text-center border-none outline-none text-sm"
                  readOnly
                />
                
                <button 
                  onClick={decrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img src="/assets/Images/arrowDown.png" className='w-3 h-3 lg:w-[0.833vw] lg:h-[0.833vw]' alt="" />
                </button>
              </div>

              {/* Add to Registry Button */}
              <button 
                onClick={() => onAddToRegistry(quantity)}
                className="bg-[#446184] text-white text-[14px] leading-[20px] font-bold py-4 px-6 lg:px-0 lg:py-0 lg:text-[0.729vw] lg:leading-[1.042vw] lg:w-[10.156vw] lg:h-[4.01vw]"
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
  collections(first: 250) {
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
    collections(first: 250) {
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
          readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
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