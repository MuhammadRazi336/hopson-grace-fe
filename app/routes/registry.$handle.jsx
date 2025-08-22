import React, { useState, useEffect } from 'react'
import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import Heading from '~/components/Heading'
import lineImghead from '/assets/Images/line.png'
import { useLoaderData, useFetcher, Link } from '@remix-run/react'
import { json } from '@shopify/remix-oxygen'
import WhiteThemeButton from '~/components/WhiteThemeButton'

import { extractShopifyId } from '~/utils/helpers.js'
import Marquee from '~/components/Marquee'
import ButtonComponent from '~/components/Button'
import lineImg4 from '/assets/Images/Vector 14.png';

export async function loader({params, context}) {
  const {handle} = params;
  
  if (!handle) {
    throw new Response('Not Found', { status: 404 });
  }

  try {
    const {collection} = await context.storefront.query(REGISTRY_QUERY, {
      variables: { handle }
    });

    if (!collection) {
      throw new Response('Not Found', { status: 404 });
    }

    // Get registry data from session
    const registry = await context?.session?.get('@Registry');

    // Fetch other ready-made registries (sub-collections) to show below
    const {collections} = await context.storefront.query(OTHER_REGISTRIES_QUERY);
    
    // Filter collections that have ready_made and parent_collection metafields as true
    const otherRegistries = collections?.nodes?.filter(collection => 
      collection.readyMadeMetafield?.value === 'true' && 
      collection.parentCollectionMetafield?.value === 'false'
    ).slice(0, 6) || []; // Limit to 6

    return json({ collection, registry, otherRegistries });
  } catch (error) {
    console.error('Error loading registry:', error);
    throw new Response('Not Found', { status: 404 });
  }
}

export async function action({request, context}) {
  try {
    const body = await request.json();
    const {payload} = body;
    
    const response = await context.ClientPost(
      JSON.parse(payload),
      'registryProducts',
      context,
    );
    
    return json({success: true, response});
  } catch (e) {
    console.error('Action error:', e);
    return json({success: false, error: e.message}, {status: 400});
  }
}

const Registry = () => {
  const { collection, registry, otherRegistries } = useLoaderData();
  const [quantities, setQuantities] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const fetcher = useFetcher();
  
  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        // Success - show green alert
        setAlertMessage('Product has been added to your registry!');
        setAlertType('success');
        setShowAlert(true);
        
        // Hide alert after 3 seconds
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
      } else if (fetcher.data.error) {
        // Error - show red alert
        setAlertMessage(`Failed to add to registry: ${fetcher.data.error}`);
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
      }
    }
  }, [fetcher.data]);
  
  const handleAddToRegistry = async (product, selectedQuantity) => {
    try {
      // Check if user is logged in by looking for token in localStorage
      const token = localStorage.getItem('@token') || localStorage.getItem('@Token');
      
      if (!token) {
        // No token found, redirect to login
        window.location.href = '/login';
        return;
      }

      const firstVariant = product?.variants?.edges?.[0]?.node;
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

      // Check if registry exists and has an ID
      if (!registry || !registry.id) {
        setAlertMessage('Registry not found. Please create a registry first.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }
      
             // Prepare the payload for adding to registry
       const payload = {
         productId: Number(extractShopifyId(product.id)),
         amount: Number(firstVariant.priceV2.amount),
         registryId: Number(registry.id),
         productTypeId: 1,
         quantity: selectedQuantity,
         note: '',
         isGroupGift: false
       };

       // Debug: Log the payload and registry info
       console.log('Adding to registry:', {
         payload,
         registry,
         product: {
           id: product.id,
           extractedId: extractShopifyId(product.id),
           title: product.title,
           price: firstVariant.priceV2.amount
         }
       });

              // Submit to action using fetcher
       fetcher.submit(
         {payload: JSON.stringify(payload)},
         {
           method: 'post',
           encType: 'application/json',
         },
       );
      
    } catch (error) {
      console.error('Error adding to registry:', error);
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
    <section>
        <Header/>
        <div className="w-full h-[2px] bg-black"></div>

        <div className="w-full h-[500px] lg:h-[800px] flex flex-row items-center justify-center">
        <div className="w-[50%] h-full bg-[#F5F2ED] relative">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%]">
            <Heading
              text={collection.title}
              classes={
                'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0 text-black'
              }
              image={lineImghead}
              imageClasses={'w-[150px] lg:w-[330px]'}
            />
            <p className="text-base sm:text-lg lg:text-xl text-black leading-relaxed mx-auto mt-10">
              {collection.description}
            </p>
          </div>
        </div>
        <div className="w-[50%] h-full">
          <img
            src={collection.image?.url || '/assets/Images/dreamFunds.png'}
            className="w-full h-full object-cover"
            alt={collection.image?.altText || collection.title}
          />
        </div>
      </div>

      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-10">
          <SidebarFilter />
                     <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 pt-0 p-4 relative z-0">
             {collection.products?.edges?.map(edge => {
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
                         {collection.title || 'REGISTRY NAME'}
                       </h4>
                       <h3 className="text-sm font-bold uppercase text-left leading-snug">
                         {product.title}
                       </h3>
                       <p className="text-sm mt-2 text-left">${price}</p>
                     </div>

                     <div className="flex items-center justify-between mt-4">
                                               {/* Quantity Controls */}
                        <div className="flex items-center justify-around w-full mb-4">
                          <p className='text-xs font-bold uppercase text-left mb-1'>QTY</p>
                          {/* Quantity Selector */}
                          <div className="flex flex-col items-center">
                            <button 
                              onClick={() => setQuantities(prev => ({
                                ...prev,
                                [product.id]: (prev[product.id] || 1) + 1
                              }))}
                              className="flex items-center justify-center bg-white transition-colors"
                            >
                              <img src="/assets/Images/arrowDown.png" className='w-3 h-3 rotate-180' alt="" />
                            </button>
                            
                            <input
                              value={quantities[product.id] || 1}
                              className="w-16 h-8 text-center border-none outline-none text-sm"
                              readOnly
                            />
                            
                            <button 
                              onClick={() => setQuantities(prev => ({
                                ...prev,
                                [product.id]: Math.max(1, (prev[product.id] || 1) - 1)
                              }))}
                              className="flex items-center justify-center bg-white transition-colors"
                            >
                              <img src="/assets/Images/arrowDown.png" className='w-3 h-3' alt="" />
                            </button>
                          </div>

                                                     {/* Add to Registry Button */}
                           <button 
                             onClick={() => handleAddToRegistry(product, quantities[product.id] || 1)}
                             disabled={fetcher.state === 'submitting'}
                             className={`text-white text-xs font-bold py-4 px-6 ${
                               fetcher.state === 'submitting'
                                 ? 'bg-gray-400 cursor-not-allowed' 
                                 : 'bg-[#446184] hover:bg-[#2c4a6b] transition-colors duration-200'
                             }`}
                           >
                             {fetcher.state === 'submitting' ? (
                               <div className="flex items-center justify-center">
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                 Adding...
                               </div>
                             ) : (
                               'ADD TO REGISTRY'
                             )}
                           </button>
                        </div>
                     </div>
                   </div>
                 </div>
               );
             }) || []}
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

       <section className="bg-[#FAF9F6] py-12  container mx-auto">
      <Heading
        text="explore more registries"
        classes={
          'prata text-2xl lg:text-4xl font-normal text-center max-[1024px]:m-0'
        }
        image={lineImghead}
        imageClasses={'max-[1024px]:max-w-[330px] px-4 '}
      />

             {/* Other registries grid */}
       <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-16 gap-x-6 mt-16 mx-10">
         {otherRegistries.map((registry) => (
           <div key={registry.id} className="text-center">
             <Link to={`/registry/${registry.handle}`}>
               <img 
                 src={registry.image?.url || '/assets/Images/placeholder.png'} 
                 alt={registry.title} 
                 className="w-full h-[500px] object-cover hover:opacity-90 transition-opacity"
               />
               <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                 {registry.title}
               </h3>
             </Link>
           </div>
         ))}
       </div>
    </section>
    <div className='mt-16'></div>

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

         <Footer/>
     </section>
  );
};

export default Registry;

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

const REGISTRY_QUERY = `#graphql
 query getRegistry($handle: String!) {
   collection(handle: $handle) {
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
     products(first: 50) {
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
`;

const OTHER_REGISTRIES_QUERY = `#graphql
 query getOtherRegistries {
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
       readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
         id
         value
       }
       parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {
         id
         value
       }
     }
   }
 }
`;