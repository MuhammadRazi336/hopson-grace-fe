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
import ExploreMoreRegistriesSlider from '~/components/ExploreMoreRegistriesSlider'
import BackToTop from '~/components/BackToTop'

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
    const user = context?.session?.get('@User');
    if (!user?.user?.id) {
      return redirect('/login');
    }

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
  const [addingProductId, setAddingProductId] = useState(null);
  const [addedProducts, setAddedProducts] = useState({});
  const [checkedCollectionIds, setCheckedCollectionIds] = useState([]);
  const [shopAllChecked, setShopAllChecked] = useState(false);
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);
  const topRef = useRef(null);
  const fetcher = useFetcher();

  // Browser console: ready made registries only
  useEffect(() => {
    console.log('Ready made registries:', otherRegistries);
  }, [otherRegistries]);

  // Browser console: registry query result (collection with blog_link metafield, etc.)
  useEffect(() => {
    console.log('Registry query (collection):', collection);
  }, [collection]);

  // Hold "ADDED!" briefly after successful submit.
  useEffect(() => {
    if (fetcher.state !== 'idle') return undefined;
    if (!addingProductId) return undefined;

    if (fetcher.data?.success) {
      const currentProductId = addingProductId;
      setAddedProducts((prev) => ({...prev, [currentProductId]: true}));
      setAddingProductId(null);
      const timer = setTimeout(() => {
        setAddedProducts((prev) => ({...prev, [currentProductId]: false}));
      }, 3000);
      return () => clearTimeout(timer);
    }

    setAddingProductId(null);
    return undefined;
  }, [fetcher.state, fetcher.data, addingProductId]);
  
  // Reset productsToShow when filtered products change (when categories are selected/deselected)
  useEffect(() => {
    setProductsToShow(12);
  }, [checkedCollectionIds, shopAllChecked]);
  
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
  
  // Filter products based on selected collections (like dashboard addgifts / bestsellers)
  const filteredProducts = React.useMemo(() => {
    if (shopAllChecked || checkedCollectionIds.length === 0) {
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
  }, [
    shopAllChecked,
    checkedCollectionIds,
    processedProducts,
    collection.products?.edges,
  ]);
  
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
        console.error('Product ID not found.');
        return;
      }

      const firstVariant = productNode?.variants?.edges?.[0]?.node;
      if (!firstVariant) {
        console.error('Product variant not found.');
        return;
      }

      // Check if registry exists and has an ID
      if (!registry || !registry.data || !registry.data[0] || !registry.data[0].id) {
        console.error('Registry not found. Please create a registry first.');
        return;
      }
      
      // Extract product ID safely
      const productId = extractShopifyId(productNode.id);
      if (!productId) {
        console.error('Invalid product ID format.');
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
      setAddingProductId(productNode.id);
      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );
      
    } catch (error) {
      console.error('Error adding to registry:', error);
      setAddingProductId(null);
    }
  };

  const displayedProducts = filteredProducts.slice(0, productsToShow);

  return (
    <section>
        <Header/>
        <div ref={topRef} className="lg:scroll-mt-[92px] scroll-mt-[60px]" />

        <div className="w-full h-[500px] lg:h-[39.58vw] flex flex-row items-center justify-center max-[768px]:flex-col-reverse max-[768px]:h-auto">
          <div className="w-[50%] h-full bg-[#F5F2ED] relative max-[768px]:w-full max-[768px]:h-auto">
            <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%] max-[768px]:w-full max-[768px]:text-center max-[768px]:static max-[768px]:translate-[initial] max-[768px]:p-5 max-[768px]:py-10">
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
              {collection.blogLinkMetafield?.value && collection.blogLinkMetafield.value.trim() !== '' && (
                <Link
                  to={collection.blogLinkMetafield.value}
                  className="text-lg tracking-widest font-bold uppercase mt-14 inline-block p-5 border-black border-2 px-10 max-[768px]:text-base max-[768px]:px-5 max-[768px]:py-2.5 max-[768px]:mt-5 max-[1025px]:text-sm max-[476px]:text-sm max-[476px]:px-0 max-[476px]:w-full"
                >
                  READ ABOUT THEIR WEDDING
                </Link>
              )}
         
            </div>
          </div>
          <div className="w-[50%] h-full flex items-center justify-center max-[768px]:w-full">
            <img
              src={collection.image?.url || '/assets/Images/dreamFunds.png'}
              className="h-full w-full object-cover"
              alt={collection.image?.altText || collection.title}
            />
          </div>
        </div>

      <section className="px-[8.802vw] mx-auto py-[6.302vw] max-[1025px]:px-5">
        <div className="flex flex-row gap-[3.75vw] w-full mx-auto max-[1025px]:gap-2.5 max-[1025px]:flex-col">
          <SidebarFilter
            collections={collections}
            checkedCollectionIds={checkedCollectionIds}
            setCheckedCollectionIds={setCheckedCollectionIds}
            shopAllChecked={shopAllChecked}
            setShopAllChecked={setShopAllChecked}
          />
            <div className="w-full xl:w-9/12 grid max-[600px]:grid-cols-1 max-[992px]:grid-cols-2 grid-cols-3 gap-[2.135vw] pt-0 p-0 relative z-0 mb-[4.844vw]"
            ref={productGridRef}
          >
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product, index) => {
               // Handle both processed products and edge structure
               const productNode = product.node || product;
               const productId = productNode.id || product.id; // Use productNode.id first, fallback to product.id
               const firstImage = productNode.images?.edges?.[0]?.node?.url || productNode.images?.edges?.[0]?.node?.src || '/assets/Images/placeholder.png';
               const firstVariant = productNode.variants?.edges?.[0]?.node;
               const price = formatPrice(firstVariant?.priceV2?.amount || product.price || productNode.price);
               const isSubmittingCurrent =
                 addingProductId === productNode.id && fetcher.state !== 'idle';
               const isAddedCurrent = Boolean(addedProducts[productNode.id]);
               const showAdded = isSubmittingCurrent || isAddedCurrent;

               // Derive brand name: among this product's collections, find a collection marked as a brand
               let brandName = productNode.vendor || '';
               if (!brandName && Array.isArray(collections)) {
                 for (const col of collections) {
                   const isBrand = col.brandMetafield?.value === 'true';
                   if (!isBrand) continue;
                   const hasProduct =
                     col.products?.edges?.some(
                       (edge) => edge?.node?.id === productNode.id,
                     ) || false;
                   if (hasProduct) {
                     brandName = col.title || '';
                     break;
                   }
                 }
               }
               
               return (
                 <div key={productId} className="pt-0 relative w-[23.43vw] max-[1025px]:w-full max-[1025px]:h-auto max-[1025px]:z-1">
                    <div className="relative group mb-[1.844vw] max-[1025px]:mb-0 max-[1025px]:h-full max-[1025px]:w-full">
                    {/* Product Image and Info */}
                   <div className="relative z-0 max-[1025px]:hidden">
                     <img
                       src={firstImage}
                       alt={productNode.title}
                      className="w-full object-cover aspect-square"
                     />
                     <div className="text-[18px] font-semibold uppercase mt-3">
                       {productNode.title}
                     </div>
                     <p className="text-sm mt-1">{price}</p>
                   </div>

                   {/* Expanding Overlay */}
                   <div className="absolute h-[35.313vw] inset-0 z-40 bg-[#FAF9F6] py-[2vw] px-[2.24vw] flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center max-[1025px]:opacity-100 max-[1025px]:h-full max-[1025px]:z-10 max-[1025px]:static max-[1025px]:border-gray-300 max-[768px]:p-5 max-[1025px]:h-auto">
                   <div>
                        <Link to={`/dashboard/addgifts/${productNode.handle}`}  className="block cursor-pointer">
                       <img
                         src={firstImage}
                         alt={productNode.title}
                         className="w-full mx-auto object-cover aspect-square mb-[20px]"
                         />
                       </Link>
                       <Link to={`/dashboard/addgifts/${productNode.handle}`}>
                       <h4 className="text-[16px] lg:text-[0.833vw] leading-[16px] lg:leading-[0.833vw] font-normal uppercase text-left m-0 mb-[10px]">
                        {brandName || 'BRAND NAME'}
                       </h4>
                       </Link>
                       <Link to={`/dashboard/addgifts/${productNode.handle}`}>
                       <div className="text-[20px] lg:text-[1.146vw] lg:leading-[1.146vw] font-[500] uppercase text-left leading-[22px] m-0 max-[1025px]:text-lg">
                       {productNode.title}
                       </div>
                       </Link>
                       <p className="text-2xl mt-2 text-left">{price}</p>
                     </div>

                     <div className="flex flex-col w-full items-center text-xs">
                     {/* Quantity Controls */}
                     <div className="flex items-center justify-around w-full mb-4 max-[1025px]:mt-4 max-[1025px]:mb-0 max-[1025px]:flex-wrap max-[1025px]:justify-center">
                     <p className="text-[18px] font-[500] uppercase text-left mb-1">
                     QTY
                     </p>
                          {/* Quantity Selector */}
                          <div className="flex flex-col items-center">
                          <button 
                              onClick={() => setQuantities(prev => ({
                                ...prev,
                                [productId]: (prev[productId] || 1) + 1
                              }))}
                              className="flex items-center justify-center bg-white transition-colors"
                              >
                              <img src="/assets/Images/arrowDown.png" 
                              className="w-3 h-3 lg:w-[0.833vw] lg:h-[0.833vw] rotate-180"
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
                                className="w-3 h-3 lg:w-[0.833vw] lg:h-[0.833vw]"
                                alt="" />
                            </button>
                          </div>

                                                     {/* Add to Registry Button */}
                           <button 
                             onClick={() => handleAddToRegistry(product, quantities[productId] || 1)}
                             disabled={showAdded}
                             className={`cursor-pointer uppercase w-full lg:h-[4.31vw] xl:h-[4.31vw] 2xl:h-[4.31vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] block text-white text-sm font-semibold py-4 tracking-widest max-[1025px]:mt-5 ${
                               showAdded
                                 ? 'bg-[#1F1D1B] cursor-default'
                                 : 'bg-[#446184] hover:bg-[#2c4a6b] transition-colors duration-200'
                             }`}
                           >
                             {showAdded ? 'ADDED!' : 'ADD TO REGISTRY'}
                           </button>
                        </div>
                     </div>
                    </div>
                  </div>
                 </div>
               );
             })
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No products found for selected filters.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full flex flex-col items-center">
            <p className="text-center text-[18px] leading-[18px] mt-[6vw] mb-[2.083vw] font-[500] tracking-[0.075vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] max-[767px]:text-[14px] max-[767px]:leading-[14px] max-[767px]:mt-[40px] max-[767px]:mb-[20px]">
              LOADING {Math.min(productsToShow, filteredProducts.length)} of{' '}
              {filteredProducts.length}
            </p>

            {filteredProducts.length > 12 &&
              productsToShow < filteredProducts.length && (
                <WhiteThemeButton
                  Text="View more"
                  onClick={() =>
                    setProductsToShow((prev) =>
                      Math.min(prev + 12, filteredProducts.length),
                    )
                  }
                />
              )}

            <BackToTop topRef={topRef} />
          </div>
        </div>
       </section>

       <ExploreMoreRegistriesSlider otherRegistries={otherRegistries} className={''} />

    <div className='mt-16'></div>

         <Footer/>
     </section>
  );
};

export default Registry;

const isExcludedFundsCollection = (col) => {
  const t = (col.title && String(col.title).toUpperCase().trim()) || '';
  return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
};

const isParentForSidebar = (col) =>
  col.parentMetafield?.value === 'true' &&
  col.readyMadeMetafield?.value !== 'true' &&
  !isExcludedFundsCollection(col);

const STYLE_ORDER = ['MODERN', 'CLASSIC', 'ECLECTIC'];

function SidebarFilter({
  collections,
  checkedCollectionIds,
  setCheckedCollectionIds,
  shopAllChecked,
  setShopAllChecked,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    styles: true,
  });

  const parentCollections = collections.filter(isParentForSidebar);
  const subCollections = STYLE_ORDER.map((styleTitle) =>
    collections.find(
      (col) =>
        col.parentMetafield?.value === 'false' &&
        col.readyMadeMetafield?.value !== 'true' &&
        String(col.title || '').toUpperCase().trim() === styleTitle,
    ),
  ).filter(Boolean);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSidebarCheckbox = (colId) => {
    setShopAllChecked(false);
    if (checkedCollectionIds.includes(colId)) {
      setCheckedCollectionIds((prev) => prev.filter((id) => id !== colId));
      return;
    }
    setCheckedCollectionIds((prev) => [...prev, colId]);
  };

  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [filterOpen]);

  const filterPanelClasses =
    'w-full py-[2.865vw] px-[1.979vw] h-fit bg-[#FAF9F6] max-[768px]:p-5';

  const filterInner = (
    <>
      <div className="mb-6">
        <h2
          className="text-[18px] min-[1025px]:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] min-[1025px]:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
          onClick={() => toggleSection('categories')}
        >
          Product Categories
          <span className="text-lg relative -top-[3px]">
            {openSections.categories ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-[0.833vw] h-[0.833vw] rotate-180 max-[768px]:w-[8px] max-[768px]:h-[8px] max-[768px]:ml-2.5"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-[0.833vw] h-[0.833vw] max-[768px]:w-[8px] max-[768px]:h-[8px] max-[768px]:ml-2.5"
              />
            )}
          </span>
        </h2>
        {openSections.categories && (
          <ul className="space-y-2 text-sm">
            {parentCollections.map((col) => (
              <li key={col.id} className="mb-[1.69vw] max-[768px]:mb-2.5">
                <label className="uppercase flex items-center gap-[1.10vw] min-[1025px]:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                  <input
                    type="checkbox"
                    className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
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

      <div>
        <h2
          className="text-[18px] min-[1025px]:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] min-[1025px]:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
          onClick={() => toggleSection('styles')}
        >
          Shop by Style
          <span className="text-lg relative -top-[3px]">
            {openSections.styles ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-[0.833vw] h-[0.833vw] rotate-180 max-[768px]:w-[8px] max-[768px]:h-[8px] max-[768px]:ml-2.5"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-[0.833vw] h-[0.833vw] max-[768px]:w-[8px] max-[768px]:h-[8px] max-[768px]:ml-2.5"
              />
            )}
          </span>
        </h2>
        {openSections.styles && (
          <ul className="space-y-2 text-sm">
            {subCollections.map((col) => (
              <li key={col.id} className="mb-[1.69vw] max-[768px]:mb-2.5">
                <label className="uppercase flex items-center gap-[1.10vw] min-[1025px]:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                  <input
                    type="checkbox"
                    className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                    checked={checkedCollectionIds.includes(col.id)}
                    onChange={() => handleSidebarCheckbox(col.id)}
                  />
                  {col.title}
                </label>
              </li>
            ))}
            <li className="mb-[1.69vw] max-[768px]:mb-2.5">
              <label className="uppercase flex items-center gap-[1.10vw] min-[1025px]:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                <input
                  type="checkbox"
                  className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                  checked={shopAllChecked}
                  onChange={() => {
                    setShopAllChecked((prev) => !prev);
                    setCheckedCollectionIds([]);
                  }}
                />
                Shop All
              </label>
            </li>
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="w-full min-[1025px]:w-[19.031vw] shrink-0">
      <div className="min-[1025px]:hidden my-4">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="uppercase font-semibold text-sm tracking-wider"
        >
          Show Filter
        </button>
      </div>

      <div className={`hidden min-[1025px]:block ${filterPanelClasses}`}>
        {filterInner}
      </div>

      <div
        className={`min-[1025px]:hidden fixed inset-0 z-[100] transition-opacity duration-300 ease-out ${
          filterOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!filterOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Close filters"
          onClick={() => setFilterOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 z-10 flex w-[min(100%,22rem)] max-w-[90vw] flex-col bg-[#FAF9F6] shadow-xl transition-transform duration-300 ease-out ${
            filterOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[#E8E6E3] px-5 py-4 max-[1025px]:justify-end">
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="text-[13px] font-bold uppercase tracking-wide text-[#1F1D1B] underline underline-offset-2"
            >
              Close
            </button>
          </div>
          <div className={`min-h-0 flex-1 overflow-y-auto ${filterPanelClasses}`}>
            {filterInner}
          </div>
        </div>
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
     blogLinkMetafield: metafield(namespace: "custom", key: "blog_link") {
       id
       value
     }
     products(first: 250) {
       edges {
         node {
           id
           title
           handle
           description
           vendor
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
   collections(first: 250, sortKey: UPDATED_AT, reverse: true) {
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
    collections(first: 250, sortKey: UPDATED_AT, reverse: true) {
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
        brandMetafield: metafield(namespace: "custom", key: "brand") {
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
              vendor
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