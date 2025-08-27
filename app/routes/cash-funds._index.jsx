import React, { useState, useCallback } from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/line.png';
import Heading from '~/components/Heading';
import dreamFunds from '/assets/Images/dreamFunds.png';
import porteTravel from '/assets/Images/porteTravels.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import youll1 from '/assets/Images/zam-zam.jpg';
import youll2 from '/assets/Images/zam-zam.jpg';
import youll3 from '/assets/Images/zam-zam.jpg';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import { Link, useLoaderData, useFetcher, redirect } from '@remix-run/react';

export async function loader({request, context}) {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search');
    const user = context?.session?.get('@User');
    const registry = context?.session?.get('@Registry');

    // Check for user/token authentication
    if (!user || !user.accessToken) {
        return redirect('/login');
    }

    if (!registry || !registry.id) {
        throw new Response('Registry not found in session', {status: 404});
    }

    const cashFunds = await loadCashFunds({context});
    
    // If there's a search query, filter cash funds
    let filteredCashFunds = cashFunds;
    if (searchQuery) {
        filteredCashFunds = cashFunds.filter(collection => 
            collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            collection.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            collection.products?.edges?.some(edge => 
                edge.node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                edge.node.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }
    
    return {
        cashFunds: filteredCashFunds, 
        searchQuery,
        registryId: registry?.id,
        user
    };
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
            }
        );
        
        if (response && response.data) {
            return {response: response.data, success: true};
        } else {
            return {response: response, success: true};
        }
    } catch (e) {
        return {error: e.message || 'Failed to add cash fund to registry', success: false};
    }
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
        throw error;
    }
}

// ProductCard component with Add to Registry functionality - moved outside to prevent recreation
  const ProductCard = React.memo(({product, collection, registryId, onSuccess, onError}) => {
    const fetcher = useFetcher();
    const hasShownFeedback = React.useRef(false);
    const previousFetcherData = React.useRef(null);

    const firstImage = product.images?.edges?.[0]?.node?.url || '/assets/Images/placeholder.png';
    const firstVariant = product.variants?.edges?.[0]?.node;
    const price = firstVariant?.priceV2?.amount || 'N/A';

        // Show feedback on fetcher.data change - only when we have meaningful data
    React.useEffect(() => {
      // Only run if we have meaningful fetcher data and haven't shown feedback yet
      if (fetcher.data && 
          fetcher.data !== previousFetcherData.current &&
          !hasShownFeedback.current &&
          (fetcher.data.success === true || fetcher.data.error === true)) {
        
        // Debug logging only when we actually process data
        console.log('ProductCard processing fetcher data:', {
          productTitle: product.title,
          fetcherData: fetcher.data,
          fetcherState: fetcher.state,
          hasShownFeedback: hasShownFeedback.current
        });
        
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
            <div className="flex flex-col w-full items-center text-xs">
              <Link to={`/dashboard/cashfunds/${product.id}`}>
                <button className="bg-white w-full block mb-2 text-black uppercase border border-black text-xs font-bold py-4 px-8">
                  personalize fund
                </button>
              </Link>
              <button 
                onClick={handleAddToRegistry}
                disabled={fetcher.state === 'submitting'}
                className="bg-[#446184] uppercase w-full block text-white text-xs font-bold py-4 px-8 disabled:opacity-50"
              >
                {fetcher.state === 'submitting' ? 'Adding...' : 'Add to registry'}
              </button>
            </div>
          </div>
        </div>


      </div>
    );
   });

const CashFund = () => {
    const {cashFunds, searchQuery, registryId} = useLoaderData();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success'); // 'success' or 'error'
    
    // Ensure cashFunds is an array
    const safeCashFunds = Array.isArray(cashFunds) ? cashFunds : [];
    
    // Get all products from all collections for search results
    const allProducts = safeCashFunds.flatMap(collection => 
        collection.products?.edges?.map(edge => ({
            ...edge.node,
            collectionTitle: collection.title,
            collectionHandle: collection.handle
        })) || []
    );

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

      <div className="w-full h-fit pt-[100px]">
        <Heading
          text={searchQuery ? `Search Results for "${searchQuery}"` : "cash & travel funds"}
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        {searchQuery && (
          <p className="text-center my-5 text-lg">
            Found {allProducts.length} cash fund{allProducts.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
        <p className="text-center my-10 font-semibold text-2xl lg:text-3xl">
          ASK FOR WHAT YOU REALLY WANT
        </p>
        <p className="text-center text-2xl lg:text-3xl font-normal w-[80%] lg:w-[60%] mx-auto">
          {searchQuery 
            ? "Browse the search results below or use the filters to refine your search."
            : "From once-in-a-lifetime adventures to future home dreams, our Cash & Travel Funds let you register for the big stuff. Choose a pre-made fund, build your own, or work with Porte Travel to create a custom trip that's so you. Because life together should start with something unforgettable."
          }
        </p>
      </div>

      {/* No Search Results */}
      {searchQuery && allProducts.length === 0 && (
        <section className="container mx-auto py-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">No cash funds found</h3>
          <p className="text-gray-600 mb-8">
            No cash funds match your search for "{searchQuery}". Try different keywords or browse our categories below.
          </p>
        </section>
      )}

      {/* Regular Cash Funds Content - Only show when no search query */}
      {!searchQuery && (
        <>
          <div className='w-full flex flex-row justify-around items-center gap-4 md:gap-10 my-8 md:my-16 px-4 md:px-16'>
            <div className='rounded-full w-[100px] h-[100px] md:w-[200px] md:h-[200px] lg:w-[500px] lg:h-[500px]'>
                <Link to="/dream-fund">
                <img src={dreamFunds} className='w-full h-full rounded-full object-fit' alt="" />
                </Link>
            </div>
            <div className='rounded-full w-[100px] h-[100px] md:w-[200px] md:h-[200px] lg:w-[500px] lg:h-[500px] bg-[#F5F2ED] relative'>
            <img
              src="/assets/Images/registrylogoSteps.png"
              alt="Image Banner"
              className="max-[1024px]:h-full object-cover object-[80%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            </div>
            <div className='rounded-full w-[100px] h-[100px] md:w-[200px] md:h-[200px] lg:w-[500px] lg:h-[500px]'>
                <Link to="/porte-travel">
                <img src={porteTravel} className='w-full h-full rounded-full object-fit' alt="" />
                </Link>
            </div>
          </div>
        </>
      )}

      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-10">
          <SidebarFilter />
          <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 pt-0 p-4 relative z-0">
            {safeCashFunds.flatMap(collection => 
              collection.products?.edges?.map(edge => {
                const product = edge.node;
                return (
                                     <ProductCard 
                     key={`${product.id}-${collection.id}`}
                     product={product}
                     collection={collection}
                     registryId={registryId}
                     onSuccess={handleSuccess}
                     onError={handleError}
                   />
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

       <Footer />
     </section>
   );
 };

export default CashFund;


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

  const CASH_FUND_QUERY = `#graphql
query getCashFundsForCashFunds {
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