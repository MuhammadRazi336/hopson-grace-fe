import React, {useState, useCallback} from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/line.png';
import headingBottomCurve from '../assets/Images/heading-bottom-curve.png';
import Heading from '~/components/Heading';
import dreamFunds from '/assets/Images/dreamFunds.png';
import porteTravel from '/assets/Images/porteTravels.png';
import {Swiper, SwiperSlide} from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import youll1 from '/assets/Images/gift-img-collection-1.png';
import youll2 from '/assets/Images/gift-img-collection-2.png';
import youll3 from '/assets/Images/gift-img-collection-3.png';
import {Navigation} from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import {Link, useLoaderData, useFetcher, redirect, json} from '@remix-run/react';
import {formatPrice} from '~/utils/priceFormatter';
import { RECOMMENDED_PRODUCTS_QUERY } from '~/graphql/product-queries';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import AlertPortal from '~/components/AlertPortal';

export async function loader({request, context}) {
  try {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search');
  
  // Get user session if available (optional for non-logged in users)
  const user = context?.session?.get('@User');
  let registry = null;
  let registryId = null;
  
  // Only fetch registry if user is logged in
  if (user && user.user && user.user.id) {
    try {
      registry = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
      registryId = registry?.data?.[0]?.id || null;
    } catch (error) {
      console.log('Error fetching registry:', error);
      // Continue without registry data
    }
  }

  // Fetch collections data for the swiper and products
  let collections = [];
  let allProducts = [];
  try {
    const [{collections: collectionsData}] = await Promise.all([
      context.storefront.query(COLLECTION_QUERY),
    ]);
    collections = collectionsData?.nodes || [];
    
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

  // If there's a search query, filter products
  let filteredProducts = allProducts;
  if (searchQuery) {
    filteredProducts = allProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.collectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  return {
    products: filteredProducts,
    collections,
    searchQuery,
    registryId,
    user: user || null,
    recommendedProducts: recommendedProducts || [],
  };
  } catch (error) {
    console.error('Error in cash-funds loader:', error);
    // Return default values to prevent the page from crashing
    return {
      products: [],
      collections: [],
      searchQuery: null,
      registryId: null,
      user: null,
      recommendedProducts: [],
    };
  }
}

export async function action({request, context}) {
  const formData = await request.formData();

  try {
    const response = await context.ClientPost(
      formData,
      'registryProducts/cash-fund',
      context,
      {
        headers: {
          // Don't set Content-Type header, it will be automatically set with boundary
          // when sending FormData
        },
      },
    );

    if (response && response.data) {
      return {response: response.data, success: true};
    } else {
      return {response: response, success: true};
    }
  } catch (e) {
    return {
      error: e.message || 'Failed to add cash fund to registry',
      success: false,
    };
  }
}


// ProductCard component with Add to Registry functionality - moved outside to prevent recreation
const ProductCard = React.memo(
  ({product, collection, registryId, user, onSuccess, onError}) => {
    const fetcher = useFetcher();
    const hasShownFeedback = React.useRef(false);
    const previousFetcherData = React.useRef(null);

    const firstImage = product.image || '/assets/Images/placeholder.png';
    const price = formatPrice(product.price);

    // Show feedback on fetcher.data change - only when we have meaningful data
    React.useEffect(() => {
      // Only run if we have meaningful fetcher data and haven't shown feedback yet
      if (
        fetcher.data &&
        fetcher.data !== previousFetcherData.current &&
        !hasShownFeedback.current &&
        (fetcher.data.success === true || fetcher.data.error === true)
      ) {
        if (fetcher.data.success === true) {
          onSuccess(`${product.title} has been added to your registry!`);
          hasShownFeedback.current = true;
        } else if (fetcher.data.error === true) {
          onError('There was an error adding the cash fund.');
          hasShownFeedback.current = true;
        }

        // Update the previous data reference AFTER processing
        previousFetcherData.current = fetcher.data;
      }

      // Cleanup function to prevent stale closures
      return () => {
        // Reset feedback flag on cleanup
        hasShownFeedback.current = false;
      };
    }, [fetcher.data]); // Only depend on fetcher.data

    // Reset feedback flag when fetcher state changes to idle (allowing new submissions)
    React.useEffect(() => {
      if (fetcher.state === 'idle') {
        hasShownFeedback.current = false;
      }
    }, [fetcher.state]);

    const handleAddToRegistry = async () => {
      try {
        // Check if user is logged in and has registry
        if (!registryId) {
          // No registry found, redirect to login
          window.location.href = '/login';
          return;
        }

        // Fetch the image from the URL and convert it to a blob
        const imageResponse = await fetch(firstImage);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('name', product.title);
        formData.append('amount', price);
        formData.append('isAnyAmount', 'false');
        formData.append('isFixedAmount', 'true');
        formData.append('isAmountHide', 'false');
        formData.append('registryId', registryId);
        formData.append('note', 'Added from Shopify cash funds');
        formData.append('file', imageBlob, 'product-image.jpg'); // Add the image file

        fetcher.submit(formData, {
          method: 'post',
          encType: 'multipart/form-data',
        });
      } catch (error) {
        // Fallback: submit without image if image fetch fails
        const formData = new FormData();
        formData.append('name', product.title);
        formData.append('amount', price);
        formData.append('isAnyAmount', 'false');
        formData.append('isFixedAmount', 'true');
        formData.append('isAmountHide', 'false');
        formData.append('registryId', registryId);
        formData.append('note', 'Added from Shopify cash funds');

        fetcher.submit(formData, {
          method: 'post',
          encType: 'multipart/form-data',
        });
      }
    };

    return (
      <div key={product.id} className="relative group mb-[4.844vw]">
        {/* Product Image and Info */}
        <div className="p-0 z-10 relative">
          <img
            src={firstImage}
            alt={product.title}
            className="w-full h-[18.75vw] object-cover"
          />
          <h3 className="text-sm font-[500] lg:text-[1.146vw] lg:leading-[1.354vw] uppercase mt-[1.563vw]">
            {product.title}
          </h3>
          <p className="text-sm mt-[0.677vw] lg:text-[1.25vw] lg:leading-[1.25vw]">{price}</p>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute lg:h-[37.5vw] lg:min-h-[490px] inset-0 z-40 bg-[#FAF9F6] px-[2.552vw] py-[2.24vw] flex flex-col shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
          <div>
            <img
              src={firstImage}
              alt={product.title}
              className="w-full rounded-none h-[15.625vw] mx-auto object-cover"
            />
            <h4 className="text-xs font-medium uppercase text-left mt-[1.135vw] mb-[0.781vw]">
              {collection.title || 'BRAND NAME'}
            </h4>
            <h3 className="text-sm font-[500] lg:text-[1.146vw] lg:leading-[1.146vw] line-clamp-1 uppercase text-left leading-snug">
              {product.title}
            </h3>
            <p className="text-sm mt-2 lg:text-[1.25vw] lg:leading-[1.25vw] text-left">{price}</p>
          </div>

          <div className="flex items-center justify-between mt-[2.813vw]">
            <div className="flex flex-col w-full items-center text-xs">
              <Link
                to={`/dashboard/cashfunds/${product.id}`}
                className="w-full"
              >
                <button className="bg-white cursor-pointer w-full lg:h-[4.01vw] lg:mb-[0.729vw] lg:text-[0.833vw] lg:leading-[0.938vw] block text-black uppercase border border-black text-xs font-bold py-2 px-4">
                  personalize fund
                </button>
              </Link>
              <button
                onClick={handleAddToRegistry}
                disabled={fetcher.state === 'submitting'}
                className="bg-[#446184] cursor-pointer uppercase w-full lg:h-[4.01vw] lg:text-[0.833vw] lg:leading-[0.938vw] block text-white text-xs font-bold py-4 px-8 disabled:opacity-50"
              >
                {fetcher.state === 'submitting'
                  ? 'Adding...'
                  : 'Add to registry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const CashFund = () => {
  const {products, collections, searchQuery, registryId, user, recommendedProducts} = useLoaderData();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'
  const [checkedCategories, setCheckedCategories] = useState([]); // ['Honeymoon','Home','Date Night']

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
    return map;
  }, [collections]);

  // Filter products based on selected categories
  let filteredProducts = products;
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

    filteredProducts = products.filter((product) => allowedIds.has(product.collectionId));
  }

  // Alert handlers
  const handleSuccess = useCallback((message) => {
    setAlertMessage(message);
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
  }, []);

  const handleError = useCallback((message) => {
    setAlertMessage(message);
    setAlertType('error');
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
  }, []);

  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit pt-[5.313vw]">
        <Heading
          text={
            searchQuery
              ? `search results for "${searchQuery}"`
              : 'cash & travel funds'
          }
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[3.333vw] font-normal m-0 text-center max-[1024px]:m-0'
          }
          image={headingBottomCurve}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[20.833vw] lg:h-[0.417vw]'}
        />
        {searchQuery && (
          <p className="text-center my-5 text-lg">
            Found {filteredProducts.length} cash fund
            {filteredProducts.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
        <p className="text-center my-[1.875vw] font-[500] text-2xl lg:text-[1.25vw] lg:leading-[1.25vw]">
          ASK FOR WHAT YOU REALLY WANT
        </p>
        <p className="text-center text-2xl lg:text-[1.25vw] lg:leading-[1.667vw] font-normal w-[80%] lg:w-[60%] mx-auto">
          {searchQuery
            ? 'Browse the search results below or use the filters to refine your search.'
            : "From once-in-a-lifetime adventures to future home dreams, our Cash & Travel Funds let you register for the big stuff. Choose a pre-made fund, build your own, or work with Porte Travel to create a custom trip that's so you. Because life together should start with something unforgettable."}
        </p>
      </div>

      {/* No Search Results */}
      {searchQuery && filteredProducts.length === 0 && (
        <section className="container mx-auto py-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">No cash funds found</h3>
          <p className="text-gray-600 mb-8">
            No cash funds match your search for "{searchQuery}". Try different
            keywords or browse our categories below.
          </p>
        </section>
      )}

      {/* Regular Cash Funds Content - Only show when no search query */}
      {!searchQuery && (
        <>
          <div className="w-full flex flex-row justify-center items-center gap-[4.167vw] mt-[3.906vw] mb-[10.833vw] px-4 md:px-16">
            <div className="rounded-full w-[100px] h-[100px] md:w-[200px] md:h-[200px] lg:w-[23.958vw] lg:h-[23.958vw]">
              <Link to="/dream-fund">
                <img
                  src={dreamFunds}
                  className="w-full h-full rounded-full object-fit"
                  alt=""
                />
              </Link>
            </div>
            <div className="rounded-full w-[100px] h-[100px] lg:w-[23.958vw] lg:h-[23.958vw] bg-[#F5F2ED] relative">
              <Link
                to="/dashboard/cashfunds/create-new"
                className="block w-full h-full"
              >
                <img
                  src="/assets/Images/registrylogoSteps.png"
                  alt="Create New Cash Fund"
                  className="max-[1024px]:h-full object-cover object-[80%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            <div className="rounded-full w-[100px] h-[100px] md:w-[200px] md:h-[200px] lg:w-[23.958vw] lg:h-[23.958vw]">
              <Link to="/porte-travel">
                <img
                  src={porteTravel}
                  className="w-full h-full rounded-full object-fit"
                  alt=""
                />
              </Link>
            </div>
          </div>
        </>
      )}

      <section className="px-[8.594vw] mx-auto">
        <div className="flex flex-col md:flex-row gap-[3.75vw] w-full mx-auto">
          <SidebarFilter 
            collections={collections}
            checkedCategories={checkedCategories}
            setCheckedCategories={setCheckedCategories}
          />
          <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2.135vw] pt-0 p-0 relative z-0">
            {filteredProducts.map((product) => {
              // Find the collection for this product
              const collection = collections.find(col => col.id === product.collectionId);
              return (
                <ProductCard
                  key={`${product.id}-${product.collectionId}`}
                  product={product}
                  collection={collection}
                  registryId={registryId}
                  user={user}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              );
            })}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-[18px] leading-[18px] my-[2.083vw] font-[500] tracking-[0.8px] lg:text-[0.938vw] lg:leading-[0.938vw]">LOADING 12 of 427</p>

            <WhiteThemeButton Text="View more" link="/quick-start-guide" />

            <button className="border-b mx-auto cursor-pointer mb-[9.167vw] uppercase font-bold bg-white text-black mt-0 text-[18px] leading-[18px] hover:bg-gray-100">
              Back to Top
            </button>
          </div>
        </div>
      </section>

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
            <div className="swiper-button-prev-prod absolute top-0 left-[0] max-[1601px]:-left-[0%] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
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
              className=""
              breakpoints={{
                345: {
                  spaceBetween: 10,
                },
                475: {
                  spaceBetween: 15,
                },
                768: {
                  spaceBetween: 20,
                },
                1024: {
                  spaceBetween: 30,
                },
                1366: {
                  spaceBetween: 39,
                },
                1600: {
                  spaceBetween: 66,
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
                      <img 
                        src={firstImage?.url || '/assets/Images/placeholder.png'} 
                        alt={productNode.title || 'Product'} 
                        className="w-full rounded-none" 
                      />
                      <h3 className="mt-2.5 lg:mt-[1.25vw] uppercase lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider">
                        {productNode.title}
                      </h3>
                      <p className="lg:text-2xl text-sm">{formatShopifyPrice(price)}</p>
                    </SwiperSlide>
                  );
                })
              ) : (
                // Fallback to static slides if no recommended products
                <>
                  <SwiperSlide>
                    <img src={youll1} alt="New Arrival" className="w-full rounded-none" />
                    <h3 className="mt-2.5  lg:mt-[1.25vw] uppercase lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider">
                      ARKE GLASS BOTTLE FOR CARBONATOR PRO
                    </h3>
                    <p className="lg:text-2xl text-sm">$95.00</p>
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={youll2} alt="Tableware" className="w-full rounded-none" />
                    <h3 className="mt-2.5  lg:mt-[1.25vw] uppercase lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider">
                      SMEG TOASTER, 2 SLICE
                    </h3>
                    <p className="lg:text-2xl text-sm">$95.00</p>
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={youll3} alt="Staub Cast Iron Q4" className="w-full rounded-none" />
                    <h3 className="mt-2.5  uppercase lg:mt-[1.25vw]  lg:text-[1.146vw] mb-[0.521vw] lg:leading-[1.354vw] text-sm font-medium tracking-wider">
                      THE BARISTA TOUCH ESPRESSO MAKER
                    </h3>
                    <p className="lg:text-2xl text-sm">$95.00</p>
                  </SwiperSlide>
                </>
              )}
            </Swiper>
            <div className="swiper-button-next-prod absolute top-0 right-[0] cursor-pointer  uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px]">
              <span className="rotate-90 text-black block lg:text-[1.146vw] tracking-wider max-[1024px]:hidden">
                more
              </span>
              <img src={nextitem} className="rotate-270 lg:w-[1.042vw] lg:h-[1.042vw] xl:w-[1.042vw] xl:h-[1.042vw] 2xl:w-[1.042vw] 2xl:h-[1.042vw]" alt="" />
            </div>
          </div>
        </div>
      </section>

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
    </section>
  );
};

export default CashFund;

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

//   function ProductGrid({products}) {
//     return (
//       <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 pt-0 p-4 relative z-0">
//         {products.map((product) => (
//           <div key={product.id} className="relative group h-[460px]">
//             {/* Product Image and Info */}
//             <div className="p-4 z-10 relative">
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-[300px] object-cover"
//               />
//               <h3 className="text-sm font-semibold uppercase mt-3">
//                 {product.name}
//               </h3>
//               <p className="text-sm mt-1">{product.price}</p>
//             </div>

//             {/* Expanding Overlay */}
//             <div className="absolute inset-0 z-40 bg-[#FAF9F6] py-4 px-12 flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 group-hover:scale-y-115 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
//               <div>
//                 <img
//                   src={product.image}
//                   alt={product.name}
//                   className="w-full h-[220px] mx-auto object-cover mb-2"
//                 />
//                 <h4 className="text-xs font-medium uppercase text-left mb-1">
//                   {product.brand || 'BRAND NAME'}
//                 </h4>
//                 <h3 className="text-sm font-bold uppercase text-left leading-snug">
//                   {product.name}
//                 </h3>
//                 <p className="text-sm mt-2 text-left">{product.price}</p>
//               </div>

//               <div className="flex items-center justify-between mt-4">
//                 {/* Quantity Controls */}
//                 <div className="flex flex-col w-full items-center text-xs">
//                   {/* Add to Registry Button */}
//                   <button className="bg-white w-full block mb-2 text-black uppercase border border-black text-xs font-bold py-4 px-8">
//                     personalize fund
//                   </button>
//                   {/* Add to Registry Button */}
//                   <button className="bg-[#446184] w-full block text-white text-xs font-bold py-4 px-8">
//                     ADD TO REGISTRY
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

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
