import {useLoaderData, Link, useFetcher, json} from '@remix-run/react';
import React, {useState, useRef} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import GiftAnyAmount from '~/components/GiftAnyAmount';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-2.png';
import product1 from '/assets/Images/gift-img-collection-3.png';
import product4 from '/assets/Images/gift-img-collection-4.png';
import youll1 from '/assets/Images/zam-zam.jpg';
import youll2 from '/assets/Images/zam-zam.jpg';
import youll3 from '/assets/Images/zam-zam.jpg';
import nextitem from '/assets/Images/next.png';
import {Footer} from '~/components/Footer';
import PreviewRegistry from '~/components/PreviewRegistry';
import {Navigation} from 'swiper/modules';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import headingBottomCurve from '../assets/Images/heading-bottom-curve.png';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { RECOMMENDED_PRODUCTS_QUERY } from '~/graphql/product-queries';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import AlertPortal from '~/components/AlertPortal';

export async function loader({context}) {
  try {
  const user = await context?.session?.get('@User');
  
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );

  if (!registry || !registry.data[0].id) {
    throw new Response('Registry not found in session', {status: 404});
  }

  // Fetch collections data for the swiper and products
  let collections = [];
  let allProducts = [];
  let recommendedProducts = [];
  try {
    const [{collections: collectionsData}, { products: recommendedProductsData }] = await Promise.all([
      context.storefront.query(COLLECTION_QUERY),
      context.storefront.query(RECOMMENDED_PRODUCTS_QUERY, { variables: { first: 8 } })
    ]);
    collections = collectionsData?.nodes || [];
    recommendedProducts = recommendedProductsData?.edges || [];
    
    // Extract products from collections: include cashfund=true OR titles matching categories (Honeymoon/Home/Date Night)
    collections.forEach(collection => {
      const titleLc = (collection?.title || '').trim().toLowerCase();
      const isCategoryMatch = titleLc.includes('honeymoon') || titleLc.includes('home') || titleLc.includes('date night') || titleLc.includes('date nights');
      const includeCollection = collection.cashfundMetafield?.value === 'true' || isCategoryMatch;
      if (includeCollection && collection.products?.edges) {
        collection.products.edges.forEach(edge => {
          const product = edge.node;
          allProducts.push({
            id: product.id,
            title: product.title,
            handle: product.handle,
            description: product.description,
            image: product.images?.edges?.[0]?.node?.url || null,
            price: product.variants?.edges?.[0]?.node?.priceV2?.amount || '0',
            currency: product.variants?.edges?.[0]?.node?.priceV2?.currencyCode || 'USD',
            availableForSale: product.variants?.edges?.[0]?.node?.availableForSale || false,
            collectionId: collection.id, // Add collection ID to track which collection the product belongs to
            collectionTitle: collection.title
          });
        });
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
  }

  return {products: allProducts, registryId: registry?.data[0]?.id, collections, user, recommendedProducts: recommendedProducts || []};
  } catch (error) {
    console.error('Error in dashboard.cashfunds loader:', error);
    // Return default values to prevent the page from crashing
    return {
      products: [],
      collections: [],
      registryId: null,
      user: null,
      recommendedProducts: [],
    };
  }
}

export async function action({request, context}) {
  const formData = await request.formData();
  
  try {
    console.log('Making API call to registryProducts/cash-fund');
    const response = await context.ClientPost(
      formData,
      'registryProducts/cash-fund',
      context,
      {
        headers: {
          // Don't set Content-Type header, it will be automatically set with boundary
          // when sending FormData
        },
      }
    );
    console.log('API response:', response);
    return {response, success: true};
  } catch (e) {
    console.error('API error:', e);
    return {error: e.message, success: false};
  }
}
const CashFunds = () => {
  const {products, registryId, collections, user, recommendedProducts} = useLoaderData();
  // Debug: initial payload
  console.log('[CashFunds] loader data counts', {
    products: products?.length || 0,
    collections: collections?.length || 0,
    hasUser: !!user,
    registryId,
    recommendedProducts: recommendedProducts?.length || 0,
    recommendedProductsData: recommendedProducts,
  });
  const [selectedSwiperCollectionId, setSelectedSwiperCollectionId] = useState(null);
  const [productsToShow, setProductsToShow] = useState(12);
  const [checkedCategories, setCheckedCategories] = useState([]); // ['Honeymoon','Home','Date Night']
  const productGridRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'

  // Build a mapping of category labels to collection IDs (by collection title, fuzzy includes)
  const categoryToCollectionIds = React.useMemo(() => {
    const map = {
      Honeymoon: [],
      Home: [],
      'Date Night': [],
    };
    collections.forEach((c) => {
      const title = (c?.title || '').trim().toLowerCase();
      if (title.includes('honeymoon')) map.Honeymoon.push(c.id);
      if (title.includes('home')) map.Home.push(c.id);
      if (title.includes('date night')) map['Date Night'].push(c.id);
      if (title.includes('date nights')) map['Date Night'].push(c.id);
    });
    console.log('[CashFunds] categoryToCollectionIds map', map);
    return map;
  }, [collections]);

  // Filter products based on selected collection and selected categories
  console.log('[CashFunds] selectedSwiperCollectionId', selectedSwiperCollectionId);
  console.log('[CashFunds] checkedCategories', checkedCategories);
  let filteredProducts = selectedSwiperCollectionId 
    ? products.filter(product => product.collectionId === selectedSwiperCollectionId)
    : products;

  if (checkedCategories.length > 0) {
    // Build strict matching set: exact title match per selected category
    const exactIds = new Set();
    const selectedLower = checkedCategories.map((c) => c.toLowerCase());
    collections.forEach((c) => {
      const title = (c?.title || '').trim().toLowerCase();
      selectedLower.forEach((cat) => {
        if (cat === 'honeymoon' && title === 'honeymoon') exactIds.add(c.id);
        if (cat === 'home' && title === 'home') exactIds.add(c.id);
        if (cat === 'date night' && (title === 'date night' || title === 'date nights')) exactIds.add(c.id);
      });
    });

    // If no exact ids (titles may vary), fall back to fuzzy includes
    const allowedIds = exactIds.size > 0 ? exactIds : new Set(
      checkedCategories.flatMap((label) => categoryToCollectionIds[label] || [])
    );
    console.log('[CashFunds] allowedIds (final)', Array.from(allowedIds));

    const next = filteredProducts.filter((p) => allowedIds.has(p.collectionId));
    filteredProducts = next;
    console.log('[CashFunds] filtered count after categories', filteredProducts.length);
    console.log('[CashFunds] filtered sample', filteredProducts.slice(0,3).map(p => ({title: p.title, collectionTitle: p.collectionTitle, collectionId: p.collectionId})));
  }

  // Sort products and limit display
  const sortedProducts = filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  const displayedProducts = sortedProducts.slice(0, productsToShow);

  const handleButtonClick = (title) => {
    alert(`Button clicked for ${title}`);
  };

  const handleSuccess = (message) => {
    setAlertMessage(message);
    setAlertType('success');
    setShowAlert(true);
    
    // Hide alert after 3 seconds
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
  };

  return (
    <>
      <div className="relative px-4 mt-[5.573vw]">
        <h2 className="mt-0 ivyora lg:text-[2.5vw] text-[24px] tracking-0 prata text-center lg:leading-[3.333vw] font-normal mb-0">
          {selectedSwiperCollectionId ? (
            <span className="prata uppercase">
              {collections.find(col => col.id === selectedSwiperCollectionId)?.title || ''}
            </span>
          ) : (
            <><span className="prata uppercase">ADD CASH</span><span className='mx-2'> or </span><span className="prata uppercase">TRAVEL</span></>
          )}
        </h2>
        <img
          src={headingBottomCurve}
          alt="Couple"
          className="max-w-[630px] lg:w-[39.219vw] lg:h-[0.417vw] mt-[1.771vw] h-auto mx-auto"
        />
        <p className="max-w-[49.01vw] mx-auto text-center text-[24px] lg:text-[1.25vw] lg:leading-[1.667vw] mt-[1.927vw] font-normal leading-relaxed">
          {selectedSwiperCollectionId 
            ? `Browse products from ${collections.find(col => col.id === selectedSwiperCollectionId)?.title || 'this collection'}.`
            : 'Browse honeymoon destinations, pick from curated cash funds, choose a gift card, or create something totally unique—like a spa day on your honeymoon or a wine subscription from your favourite vineyard. Whatever your dream, this is the place to make it happen.'
          }
        </p>
      </div>

      <section className=" ">
        <div className=" relative items-start mt-[3.125vw] mb-0 max-[1024px]:my-10">
          <div className=" ">
            {!selectedSwiperCollectionId && (
              <>
                <div className="z-10 swiper-button-prev-prod absolute  left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase  max-[1601px]:w-[90px] items-center bg-white top-[35%] px-8 py-10  justify-center max-[1024px]:w-[33px]">
                  <img src={nextitem} alt="" className="rotate-90 size-6" />
                </div>

                <Swiper
                  spaceBetween={15}
                  slidesPerView={3.25} // Shows 3 full + a portion of 4th
                  centeredSlides={true} // Enables .5 on both sides
                  loop={true}
                  modules={[Navigation]}
                  navigation={{
                    nextEl: '.swiper-button-next-prod',
                    prevEl: '.swiper-button-prev-prod',
                  }}
                  className="px-[178px]"
                  breakpoints={{
                    345: {
                      slidesPerView: 1.25,
                      spaceBetween: 10,
                      centeredSlides: true,
                    },
                    475: {
                      slidesPerView: 2.25,
                      spaceBetween: 15,
                      centeredSlides: true,
                    },
                    768: {
                      slidesPerView: 2.25,
                      spaceBetween: 20,
                      centeredSlides: true,
                    },
                    1024: {
                      slidesPerView: 2.75,
                      spaceBetween: 30,
                      centeredSlides: true,
                    },
                    1366: {
                      slidesPerView: 3.25,
                      spaceBetween: 37,
                      centeredSlides: true,
                    },
                    1600: {
                      slidesPerView: 3.7,
                      spaceBetween: 37,
                      centeredSlides: true,
                    },
                  }}
                >
                  {/* Static Create Your Own slide */}
                  <SwiperSlide
                    key="create-your-own"
                    onClick={() => {
                      // Navigate to create new cash fund page
                      window.location.href = '/dashboard/cashfunds/create-new';
                    }}
                    style={{ cursor: 'pointer'}}
                  >
                    <Link to="/dashboard/cashfunds/create-new">
                    <div className="w-full h-[440px] overflow-hidden bg-[#F5F2ED] flex items-center justify-center">
                      <img
                        src="/assets/Images/registrylogoSteps.png"
                        alt="Create Your Own Cash Fund"
                        className="object-fit w-[50%] mx-auto"
                      />
                    </div>
                    <h3 className="mt-2.5 text-center lg:mt-[1.927vw] uppercase lg:text-[1.25vw] text-sm font-medium tracking-[0.5px]">
                      CREATE YOUR OWN
                    </h3>
                    </Link>
                  </SwiperSlide>

                  {/* Dynamic slides from Shopify collections with cashfund metafield = true */}
                  {collections
                    .filter((col) => col.cashfundMetafield?.value === 'true')
                    .map((col) => (
                      <SwiperSlide
                        key={col.id}
                        onClick={() => {
                          setSelectedSwiperCollectionId(col.id);
                        }}
                        style={{ cursor: 'pointer'}}
                      >
                        <div className="w-full h-[440px] overflow-hidden">
                          <img
                            src={col.image?.url || '/assets/Images/placeholder.png'}
                            alt={col.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="mt-2.5 text-center lg:mt-[1.927vw] uppercase lg:text-[1.25vw] text-sm font-medium tracking-[0.5px]">
                          {col.title}
                        </h3>
                      </SwiperSlide>
                    ))}
                </Swiper>
                <div className="swiper-button-next-prod absolute  right-[1%] max-[1601px]:-right-[0%] cursor-pointer  uppercase max-[1601px]:w-[90px] items-center bg-white z-10 top-[35%] px-8 py-10  justify-center text-white max-[1024px]:w-[33px]">
                  <img src={nextitem} className="size-6 rotate-270" alt="" />
                </div>
              </>
            )}

            {/* Selected collection image at 100% width */}
            {selectedSwiperCollectionId && (
              <div className="relative">
                <img
                  src={collections.find(col => col.id === selectedSwiperCollectionId)?.image?.url || '/assets/Images/placeholder.png'}
                  alt={collections.find(col => col.id === selectedSwiperCollectionId)?.title}
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-[8.594vw] mx-auto">
        <div className="flex flex-col md:flex-row gap-[3.75vw] pt-[7.083vw]">
          <SidebarFilter 
            collections={collections}
            checkedCategories={checkedCategories}
            setCheckedCategories={(next) => {
              setCheckedCategories(next);
              setProductsToShow(12);
            }}
          />
          <div 
            className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2.135vw] pt-0 p-0 relative z-0"
            ref={productGridRef}
          >
            {displayedProducts.map((card, index) => (
              <Card
                id={card.id}
                key={index}
                image={card.image}
                title={card.title}
                amount={typeof card.price === 'number' ? card.price.toFixed(2) : parseFloat(card.price || 0).toFixed(2)}
                buttonLabel={'Personalize Fund'}
                onButtonClick={() => handleButtonClick(card.title)}
                registryId={registryId}
                price={typeof card.price === 'number' ? card.price.toFixed(2) : parseFloat(card.price || 0).toFixed(2)}
                currency={card.currency}
                handle={card.handle}
                onSuccess={handleSuccess}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-[18px] leading-[18px] my-[2.083vw] font-[500] tracking-[0.8px] lg:text-[0.938vw] lg:leading-[0.938vw]">
              LOADING {Math.min(productsToShow, sortedProducts.length)} of{' '}
              {sortedProducts.length}
            </p>

            {sortedProducts.length > 12 &&
              productsToShow < sortedProducts.length && (
                <WhiteThemeButton
                  Text="VIEW MORE"
                  buttonClassName="border cursor-pointer mb-[2.344vw] lg:w-[18.75vw] xl:w-[18.75vw] 2xl:w-[18.75vw] uppercase text-center justify-center lg:h-[4.01vw] xl:h-[4.01vw] 2xl:h-[4.01vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] font-bold bg-white text-black px-2 mt-0 py-0 text-[18px] leading-[18px] hover:bg-gray-100 flex items-center gap-2"
                  link="#"
                  onClick={() =>
                    setProductsToShow((prev) =>
                      Math.min(prev + 12, sortedProducts.length),
                    )
                  }
                />
              )}

            {productsToShow > 12 && (
              <button 
                className="border-b mx-auto cursor-pointer mb-[9.167vw] uppercase font-bold bg-white text-black mt-0 text-[18px] leading-[18px] hover:bg-gray-100"
                onClick={() => {
                  setProductsToShow(12);
                  if (productGridRef.current) {
                    productGridRef.current.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }}
              >
                Back to Top
              </button>
            )}
          </div>
        </div>
      </section>
      {/* 
      <section className="bg-[#FAF9F6] py-8">
        <Heading
          text="Ready-Made Registries"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <CustomTab tabsData={tabsData} />
        <div className="text-center">
          <ButtonComponent
            text="EXPLORE SAMPLE REGISTRIES"
            className="button-cs text-black border-3 border-black py-4 lg:py-[30px] bg-transparent rounded-none mt-11"
          />
        </div>
      </section> */}

      {/* <section className="py-[70px]  my-12 lg:my-[240px] container">
        <Heading
          text="bestsellers"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={brandline}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <ProductSlider />
        <div className="text-center">
          <ButtonComponent
            text="browse bestsellers"
            className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
          />
        </div>
      </section> */}

      <section className="bg-[#FAF9F6] py-[5.26vw] mb-[9.323vw]">
        <Heading
          text="we think you’ll love"
          classes={
            'prata text-2xl lg:text-[2.083vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={headingBottomCurve}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[25.625vw] lg:h-[0.417vw]'}
        />

        <div className=" relative items-start mt-[5.573vw] max-[1024px]:my-10">
          <div className="lg:w-[77.969vw] max-w-[85%] mx-auto">
            <div className="swiper-button-prev-prod absolute top-0 left-[0] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
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
                    <div className="block cursor-pointer hover:no-underline pointer-events-auto">
                      <img src={product1} alt="New Arrival" className="w-full rounded-none pointer-events-none" />
                      <h3 className="mt-2.5 uppercase lg:mt-[1.25vw] lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider pointer-events-none">
                        ARKE GLASS BOTTLE FOR CARBONATOR PRO
                      </h3>
                      <p className="lg:text-[1.25vw] text-sm py-2 pointer-events-none">$95.00</p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="block cursor-pointer hover:no-underline pointer-events-auto">
                      <img src={product2} alt="Tableware" className="w-full rounded-none pointer-events-none" />
                      <h3 className="mt-2.5 uppercase lg:mt-[1.25vw] lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider pointer-events-none">
                        SMEG TOASTER, 2 SLICE
                      </h3>
                      <p className="lg:text-[1.25vw] text-sm py-2 pointer-events-none">$95.00</p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="block cursor-pointer hover:no-underline pointer-events-auto">
                      <img src={product3} alt="Staub Cast Iron Q4" className="w-full rounded-none pointer-events-none" />
                      <h3 className="mt-2.5 uppercase lg:mt-[1.25vw] lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider pointer-events-none">
                        THE BARISTA TOUCH ESPRESSO MAKER
                      </h3>
                      <p className="lg:text-[1.25vw] text-sm py-2 pointer-events-none">$95.00</p>
                    </div>
                  </SwiperSlide>
                </>
              )}
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

      <GiftAnyAmount />

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

      <Footer />
    </>
  );
};

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
        cashfundMetafield: metafield(namespace: "custom", key: "cashfund") {
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

export default CashFunds;

const Card = ({title, amount, buttonLabel, onButtonClick, id, image, registryId, price, currency, handle, onSuccess}) => {
  const fetcher = useFetcher();

  const handleAddToRegistry = async () => {
    try {
      // Fetch the image from the URL and convert it to a blob
      const imageResponse = await fetch(image);
      const imageBlob = await imageResponse.blob();

      const formData = new FormData();
      formData.append('name', title);
      formData.append('amount', amount);
      formData.append('isAnyAmount', 'false');
      formData.append('isFixedAmount', 'true');
      formData.append('isAmountHide', 'false');
      formData.append('registryId', registryId);
      formData.append('note', 'Added from dashboard cash funds listing');
      formData.append('file', imageBlob, 'product-image.jpg'); // Add the image file

      fetcher.submit(formData, {
        method: 'post',
        encType: 'multipart/form-data',
      });

      // Show success alert
      if (onSuccess) {
        onSuccess(`${title} has been added to your registry!`);
      }
    } catch (error) {
      // Fallback: submit without image if image fetch fails
    const formData = new FormData();
    formData.append('name', title);
    formData.append('amount', amount);
    formData.append('isAnyAmount', 'false');
    formData.append('isFixedAmount', 'true');
    formData.append('isAmountHide', 'false');
    formData.append('registryId', registryId);
      formData.append('note', 'Added from dashboard cash funds listing');

    fetcher.submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    });

      // Show success alert
      if (onSuccess) {
        onSuccess(`${title} has been added to your registry!`);
      }
    }
  };

  return (
    <div className="relative group mb-[4.844vw]">
      {/* Product Image and Info */}
      <div className="p-0 z-10 relative">
        {image ? (
          <img
            src={image}
            alt="Cash Fund"
            className="w-full h-[18.75vw] object-cover"
          />
        ) : (
          <div className="w-full h-[300px] flex items-center justify-center bg-gray-200 text-gray-400">
            No Image
          </div>
        )}
        <h3 className="text-sm font-[500] lg:text-[1.146vw] lg:leading-[1.354vw] uppercase mt-[1.563vw]">
          {title}
        </h3>
        <p className="text-sm mt-[0.677vw] lg:text-[1.25vw] lg:leading-[1.25vw]">${amount}</p>
      </div>

      {/* Expanding Overlay */}
      <div className="absolute lg:h-[37.5vw] lg:min-h-[490px] inset-0 z-40 bg-[#FAF9F6] px-[2.552vw] py-[2.24vw] flex flex-col shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
        <div>
          {image ? (
            <img
              src={image}
              alt="Cash Fund"
              className="w-full rounded-none h-[15.625vw] mx-auto object-cover"
            />
          ) : (
            <div className="w-full h-[220px] flex items-center justify-center bg-gray-200 text-gray-400 mb-2">
              No Image
            </div>
          )}
          <h4 className="text-xs font-medium uppercase text-left mt-[1.135vw] mb-[0.781vw]">
            CASH FUND
          </h4>
          <h3 className="text-sm font-[500] lg:text-[1.146vw] lg:leading-[1.146vw] line-clamp-1 uppercase text-left leading-snug">
            {title}
          </h3>
          <p className="text-sm mt-2 lg:text-[1.25vw] lg:leading-[1.25vw] text-left">${amount}</p>
        </div>

        <div className="flex items-center justify-between mt-[2.813vw]">
          <div className="flex flex-col w-full items-center text-xs">
            <Link to={`/dashboard/cashfunds/create-new`} className='w-full'>
              <button className="bg-white cursor-pointer w-full lg:h-[4.01vw] lg:mb-[0.729vw] lg:text-[0.833vw] lg:leading-[0.938vw] block text-black uppercase border border-black text-xs font-bold py-2 px-4">
                personalize fund
              </button>
            </Link>
            <button 
              onClick={handleAddToRegistry}
              disabled={fetcher.state === 'submitting'}
              className="bg-[#446184] cursor-pointer uppercase w-full lg:h-[4.01vw] lg:text-[0.833vw] lg:leading-[0.938vw] block text-white text-xs font-bold py-4 px-8 disabled:opacity-50"
            >
              {fetcher.state === 'submitting' ? 'Adding...' : 'Add to registry'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

function SidebarFilter({collections = [], checkedCategories = [], setCheckedCategories}) {
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
    <div className="w-full lg:w-[17.031vw] py-[2.865vw] px-[1.979vw] h-fit bg-[#FAF9F6]">
      <div className="mb-6">
        <h2
          className="text-[18px] lg:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
          onClick={() => toggleSection('categories')}
        >
          Categories
          <span className="text-lg relative -top-[3px]">
            {openSections.categories ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-[0.833vw] h-[0.833vw] rotate-180"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-[0.833vw] h-[0.833vw]"
              />
            )}
          </span>
        </h2>
        {openSections.categories && (
          <ul className="space-y-2 text-[16px]">
            {['Honeymoon','Home','Date Night'].map((label) => (
              <li key={label}>
                <label className='flex items-center'>
                  <input 
                    type="checkbox" 
                    className="mr-2 lg:mr-[0.885vw] lg:w-[1.25vw] lg:h-[1.25vw]" 
                    checked={checkedCategories.includes(label)}
                    onChange={(e) => {
                      if (!setCheckedCategories) return;
                      const next = e.target.checked 
                        ? [...checkedCategories, label]
                        : checkedCategories.filter((l) => l !== label);
                      setCheckedCategories(next);
                    }}
                  />
                  {label.toUpperCase()}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProductGrid({products}) {
  return (
    <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2.135vw] pt-0 p-0 relative z-0">
      {products.map((product) => (
        <div key={product.id} className="relative group mb-[4.844vw]">
          {/* Product Image and Info */}
          <div className="p-4 z-10 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-[360px] h-[360px] object-cover"
            />
            <h3 className="text-[22px] font-semibold uppercase mt-3">
              {product.name}
            </h3>
            <p className="text-[24px] mt-1">{product.price}</p>
          </div>

          {/* Expanding Overlay */}
          <div className="absolute inset-0 z-40 bg-[#FAF9F6] py-4 px-12 flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 group-hover:scale-y-115 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[220px] mx-auto object-cover mb-2"
              />
              <h4 className="text-xs font-medium uppercase text-left mb-1">
                {product.brand || 'BRAND NAME'}
              </h4>
              <h3 className="text-sm font-bold uppercase text-left leading-snug">
                {product.name}
              </h3>
              <p className="text-sm mt-2 text-left">{product.price}</p>
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
      ))}
    </div>
  );
}

