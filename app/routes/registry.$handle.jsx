import React, { useState, useEffect, useRef } from 'react'
import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import Heading from '~/components/Heading'
import lineImghead from '/assets/Images/line.png'
import { useLoaderData, useFetcher, Link } from '@remix-run/react'
import { json, redirect } from '@shopify/remix-oxygen'
import WhiteThemeButton from '~/components/WhiteThemeButton'

import { extractShopifyId } from '~/utils/helpers.js'
import Marquee from '~/components/Marquee'
import ButtonComponent from '~/components/Button'
import lineImg4 from '/assets/Images/Vector 14.png';
import {formatPrice} from '~/utils/priceFormatter';
import AlertPortal from '~/components/AlertPortal';

export async function loader({params, context}) {
  const {handle} = params;
  const user = context?.session?.get('@User');
  
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

    // Only fetch registry data if user is logged in
    let registry = null;
    if (user && user.user && user.user.id) {
      try {
        registry = await context.ClientGet(
          `registries/by-userId/${user.user.id}`,
          context,
        );
      } catch (error) {
        console.log('Error fetching registry:', error);
      }
    }

    // Fetch other ready-made registries (sub-collections) to show below
    const {collections} = await context.storefront.query(OTHER_REGISTRIES_QUERY);
    
    // Filter collections that have ready_made and parent_collection metafields as true
    const otherRegistries = collections?.nodes?.filter(collection => 
      collection.readyMadeMetafield?.value === 'true' && 
      collection.parentCollectionMetafield?.value === 'false'
    ).slice(0, 6) || []; // Limit to 6

    // Also fetch all collections and products for category filtering (like dashboard addgifts)
    let allCollections = [];
    let allProducts = [];
    try {
      const [{collections: collectionsData}, {products: productsData}] = await Promise.all([
        context.storefront.query(COLLECTION_QUERY),
        context.storefront.query(PRODUCT_QUERY),
      ]);
      allCollections = collectionsData?.nodes || [];
      allProducts = productsData?.edges || [];
    } catch (error) {
      console.error('Error fetching collections and products for category filtering:', error);
    }

    return json({ collection, registry, otherRegistries, collections: allCollections, products: allProducts, user });
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
  const { collection, registry, otherRegistries, collections, products, user } = useLoaderData();
  const [quantities, setQuantities] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [checkedCollectionIds, setCheckedCollectionIds] = useState([]);
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);
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
  
  // Reset productsToShow when filtered products change (when categories are selected/deselected)
  useEffect(() => {
    setProductsToShow(12);
  }, [checkedCollectionIds]);
  
  // Process products like dashboard addgifts (add collection relationships)
  const processedProducts = React.useMemo(() => {
    const productMap = new Map();
    
    // Get parent collections
    const parentCollections = collections.filter(col => 
      col.parentMetafield?.value === 'true' && 
      col.readyMadeMetafield?.value !== 'true'
    );
    
    
    // Process products from sub-collections (exactly like dashboard addgifts)
    parentCollections.forEach(parentCollection => {
      // Get sub-collection GIDs from the parent's subMetafield
      let subCollectionGids = [];
      if (parentCollection.subMetafield?.value) {
        try {
          subCollectionGids = JSON.parse(parentCollection.subMetafield.value);
        } catch (error) {
          // Handle parsing error silently
        }
      }
      
      // Find sub-collections by GID (exactly like dashboard addgifts)
      const subCollections = collections.filter(
        (col) =>
          col.parentMetafield?.value === 'false' &&
          col.readyMadeMetafield?.value !== 'true' &&
          subCollectionGids.includes(col.id),
      );
      
      // Process products from sub-collections (exactly like dashboard addgifts)
      subCollections.forEach(subCollection => {
        subCollection.products?.edges?.forEach(edge => {
          const product = edge.node;
          const productData = {
            ...product,
            price: product.variants?.edges?.[0]?.node?.priceV2?.amount || '0',
            currencyCode: product.variants?.edges?.[0]?.node?.priceV2?.currencyCode || 'USD',
            availableForSale: product.variants?.edges?.[0]?.node?.availableForSale || false,
            createdAt: product.createdAt,
            collectionId: subCollection.id,
            parentCollectionId: parentCollection.id,
            parentCollectionTitle: parentCollection.title,
          };
          
          if (!productMap.has(product.id)) {
            productMap.set(product.id, productData);
          } else {
            const existingProduct = productMap.get(product.id);
            if (!existingProduct.collectionIds) {
              existingProduct.collectionIds = [existingProduct.collectionId];
            }
            if (!existingProduct.collectionIds.includes(subCollection.id)) {
              existingProduct.collectionIds.push(subCollection.id);
            }
          }
        });
      });
    });
    
    const processedProductsArray = Array.from(productMap.values());
    return processedProductsArray;
  }, [collections]);
  
  // Filter products based on selected collections (like dashboard addgifts)
  const filteredProducts = React.useMemo(() => {
    if (checkedCollectionIds.length === 0) {
      return collection.products?.edges || [];
    }
    
    // Filter processed products based on selected collection IDs (like dashboard addgifts)
    const filtered = processedProducts.filter((product) => {
      // Check if the product's collection is directly selected
      if (checkedCollectionIds.includes(product.collectionId)) {
        return true;
      }

      // Check if the product's parent collection is selected
      if (checkedCollectionIds.includes(product.parentCollectionId)) {
        return true;
      }

      // Check if the product exists in any of the selected collections
      if (product.collectionIds && product.collectionIds.some(id => checkedCollectionIds.includes(id))) {
        return true;
      }

      return false;
    });
    
    return filtered;
  }, [checkedCollectionIds, processedProducts, collection.products?.edges]);
  
  const handleAddToRegistry = async (product, selectedQuantity) => {
    try {
      // Check if user is logged in
      if (!user || !user.user || !user.user.id) {
        // User not logged in, redirect to login
        window.location.href = '/login';
        return;
      }

      // Handle both processed products and edge structure
      const productNode = product.node || product;
      
      // Ensure product has an ID
      if (!productNode || !productNode.id) {
        setAlertMessage('Product ID not found.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      const firstVariant = productNode?.variants?.edges?.[0]?.node;
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
      if (!registry || !registry.data || !registry.data[0] || !registry.data[0].id) {
        setAlertMessage('Registry not found. Please create a registry first.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }
      
      // Extract product ID safely
      const productId = extractShopifyId(productNode.id);
      if (!productId) {
        setAlertMessage('Invalid product ID format.');
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
        productId: Number(productId),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry.data[0].id),
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
          id: productNode.id,
          extractedId: productId,
          title: productNode.title,
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

        <div className="w-full h-[500px] lg:h-[39.58vw] flex flex-row items-center justify-center">
        <div className="w-[50%] h-full bg-[#F5F2ED] relative">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%]">
            <Heading
              text={collection.title}
              classes={
                'prata text-4xl lg:text-[2.29vw] lowercase lg:leading-[1.88vw] font-normal text-center max-[1024px]:m-0 lg:mb-[0.833vw] text-black'
              }
              image={lineImghead}
              imageClasses={'w-[150px] lg:w-[22.14vw]'}
            />
            <p className="text-base lg:w-[28.54vw] lg:max-w-[100%] sm:text-lg lg:text-[1.354vw] lg:leading-[1.98vw] text-black leading-relaxed mx-auto mt-[3.75vw]">
              {collection.description}
            </p>
            <Link to={`#`} className="text-lg tracking-widest font-bold font-bold uppercase mt-14 inline-block p-5 border-black border-2 px-10">
              READ ABOUT THEIR WEDDING
            </Link>
          </div>
        </div>
        <div className="w-[50%] h-full flex items-center justify-center">
          <img
            src={collection.image?.url || '/assets/Images/dreamFunds.png'}
            className="h-full w-full object-cover"
            alt={collection.image?.altText || collection.title}
          />
        </div>
      </div>

      <section className="px-[8.802vw] mx-auto py-[6.302vw]">
        <div className="flex flex-col md:flex-row gap-12">
          <SidebarFilter 
            collections={collections}
            checkedCollectionIds={checkedCollectionIds}
            setCheckedCollectionIds={setCheckedCollectionIds}
          />
                     <div 
                       className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-36 pt-0 p-4 relative z-0"
                       ref={productGridRef}
                     >
             {filteredProducts.slice(0, productsToShow).map((product, index) => {
               // Handle both processed products and edge structure
               const productNode = product.node || product;
               const productId = productNode.id || product.id; // Use productNode.id first, fallback to product.id
               const firstImage = productNode.images?.edges?.[0]?.node?.url || productNode.images?.edges?.[0]?.node?.src || '/assets/Images/placeholder.png';
               const firstVariant = productNode.variants?.edges?.[0]?.node;
               const price = formatPrice(firstVariant?.priceV2?.amount || product.price || productNode.price);
               
               return (
                 <div key={productId} className="pt-0 relative lg:w-[23.43vw] xl:w-[23.43vw] 2xl:w-[23.43vw]">
                  <div className="relative group mb-[4.844vw]">
                   {/* Product Image and Info */}
                   <div className="z-10 relative">
                     <img
                       src={firstImage}
                       alt={productNode.title}
                      className="w-full h-[23.43vw] object-cover max-[1024px]:h-[44vw] max-[475px]:h-[36vw]"
                     />
                     <div className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.354vw] uppercase mt-[1.563vw]">
                       {productNode.title}
                     </div>
                     <p className="text-sm mt-[0.677vw] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw]">{price}</p>
                   </div>

                   {/* Expanding Overlay */}
                <div className="absolute lg:h-[33.5vw] xl:h-[33.5vw] 2xl:h-[37.3vw] lg:min-h-[20vw] xl:min-h-[20vw] 2xl:min-h-[20vw] inset-0 z-40 bg-[#FAF9F6] px-[2.552vw] py-[2.24vw] flex flex-col shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center scale-[1.13]">
                     <div>
                        <Link to={`/dashboard/addgifts/${productNode.handle}`}>
                       <img
                         src={firstImage}
                         alt={productNode.title}
                         className="w-full rounded-none h-[18.223vw] mx-auto object-cover cursor-pointer hover:opacity-80 transition-opacity"
                       />
                       </Link>
                        <Link to={`/dashboard/addgifts/${productNode.handle}`}>
                       <h4 className="text-base font-medium uppercase text-left mt-[1.135vw] mb-[0.781vw]">
                         {product.parentCollectionTitle || collection.title || 'REGISTRY NAME'}
                       </h4>
                       </Link>
                       <Link to={`/dashboard/addgifts/${productNode.handle}`}>
                       <div className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.146vw] uppercase text-left leading-snug cursor-pointer hover:text-gray-600 transition-colors">
                         {productNode.title}
                       </div>
                       </Link>
                       <p className="text-2xl mt-2 text-left">{price}</p>
                     </div>

                  <div className="flex items-center justify-between mt-[2.3vw]">
                    {/* Quantity Controls */}
                      <div className="flex w-full items-center text-xs gap-1.5">
                          <p className='text-[18px] font-semibold uppercase text-left mb-1'>QTY</p>
                          {/* Quantity Selector */}
                          <div className="flex flex-col items-center">
                            <button 
                              onClick={() => setQuantities(prev => ({
                                ...prev,
                                [productId]: (prev[productId] || 1) + 1
                              }))}
                              className="flex items-center justify-center bg-white transition-color"
                            >
                              <img src="/assets/Images/arrowDown.png" 
                              className="w-3 h-3 lg:w-[0.833vw] xl:w-[0.833vw] 2xl:w-[0.833vw] lg:h-[0.833vw] xl:h-[0.833vw] 2xl:h-[0.833vw] rotate-180"
                              alt="" />
                            </button>
                            
                            <input
                              value={quantities[productId] || 1}
                              className="w-16 lg:text-[1.458vw] lg:leading-[1.25vw] lg:h-[1.563vw] relative top-[2px] p-0 mx-0 my-[0.521vw] text-center border-none outline-none text-sm"
                              readOnly
                            />
                            
                            <button 
                              onClick={() => setQuantities(prev => ({
                                ...prev,
                                [productId]: Math.max(1, (prev[productId] || 1) - 1)
                              }))}
                              className="flex items-center justify-center bg-white transition-colors"
                            >
                              <img src="/assets/Images/arrowDown.png" 
                              className="w-3 h-3 lg:w-[0.833vw] xl:w-[0.833vw] 2xl:w-[0.833vw] lg:h-[0.833vw] xl:h-[0.833vw] 2xl:h-[0.833vw]"
                              alt="" />
                            </button>
                          </div>

                                                     {/* Add to Registry Button */}
                           <button 
                             onClick={() => handleAddToRegistry(product, quantities[productId] || 1)}
                             disabled={fetcher.state === 'submitting'}
                             className={`bg-[#446184] cursor-pointer uppercase w-full lg:h-[4.31vw] xl:h-[4.31vw] 2xl:h-[4.31vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] block text-white text-sm font-semibold py-4 disabled:opacity-50 tracking-widest ${
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
                 </div>
               );
             }) || []}
           </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4"> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center mt-36">
            <p className="text-center text-[18px] font-semibold mb-10">
              LOADING {Math.min(productsToShow, filteredProducts.length)} of{' '}
              {filteredProducts.length}
            </p>

            {filteredProducts.length > 12 &&
              productsToShow < filteredProducts.length && (
                <WhiteThemeButton
                  Text="VIEW MORE"
                  buttonClassName="w-[360px] h-[77px] text-[18px] border-3 border-black"
                  link="#"
                  onClick={() =>
                    setProductsToShow((prev) =>
                      Math.min(prev + 12, filteredProducts.length),
                    )
                  }
                />
              )}

            {productsToShow > 12 && (
              <button
                className="border-b mx-auto cursor-pointer mb-20 font-bold bg-white text-black px-6 mt-3 text-sm hover:bg-gray-100"
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

         <Footer/>
     </section>
  );
};

export default Registry;

function SidebarFilter({
  collections,
  checkedCollectionIds,
  setCheckedCollectionIds,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    styles: true,
  });

  // Get parent collections for Product Categories (exactly like dashboard addgifts)
  const parentCollection = collections.filter(
    (col) =>
      col.parentMetafield?.value === 'true' &&
      col.readyMadeMetafield?.value !== 'true',
  );
  

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSidebarCheckbox = (colId) => {
    let newChecked;
    if (checkedCollectionIds.includes(colId)) {
      newChecked = checkedCollectionIds.filter((id) => id !== colId);
    } else {
      newChecked = [...checkedCollectionIds, colId];
    }
    setCheckedCollectionIds(newChecked);
  };

  return (
    <div className="w-[400px] h-fit lg:w-[22.28vw] xl:w-[22.28vw] 2xl:w-[22.28vw]">
      <div className=" bg-[#FAF9F6] px-[1.979vw] pt-[2.865vw] pb-[3.802vw]">
        <h2
            className="text-sm font-bold uppercase mb-[2.344vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
          onClick={() => toggleSection('categories')}
        >
          Product Categories
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
          <ul className="space-y-2 text-sm">
            {parentCollection.map((col) => (
              <li key={col.id} className='mb-[1.69vw]'>
              <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                  <input
                    type="checkbox"
                    className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B] checked:bg-[#000000]"
                    checked={checkedCollectionIds.includes(col.id)}
                    onChange={() => handleSidebarCheckbox(col.id)}
                  />
                  {col.title}
              </label>
            </li>
            ))}
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
     products(first: 250) {
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

const PRODUCT_QUERY = `#graphql
  query {
    products(first: 250) {
      edges {
        node {
          handle
          description
          id
          title
          createdAt
          images(first: 10) {
            edges {
              node {
                id
                src
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
              createdAt
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
  }`;