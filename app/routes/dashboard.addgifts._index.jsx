import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import React, {useState, useEffect, useRef} from 'react';
import {Link, useFetcher, useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {requireAuth} from '~/utils/auth-guard.js';
import {extractShopifyId} from '~/utils/helpers.js';
import PreviewRegistry from '~/components/PreviewRegistry';
import {Swiper, SwiperSlide} from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import newArrivals from '/assets/Images/newArrivals.png';
import bestSellers from '/assets/Images/bestSellers.png';
import giftCards from '/assets/Images/giftCard.png';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-2.png';
import product1 from '/assets/Images/gift-img-collection-3.png';
import product4 from '/assets/Images/gift-img-collection-4.png';
import youll1 from '/assets/Images/youll-1.png';
import youll2 from '/assets/Images/youll-2.png';
import youll3 from '/assets/Images/youll-3.png';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import headingBottomCurve from '/assets/Images/heading-small-line.png';
import giftBottomCurve from '/assets/Images/gifts-bottom-line.png';
import CustomTab from '~/components/CustomTab';
import brandline from '/assets/Images/brandline.png';
import ProductSlider from '~/components/ProductSlider';
import {Footer} from '~/components/Footer';
import {Navigation} from 'swiper/modules';
import arrowDown from '/assets/Images/arrowDown.png';
import {RECOMMENDED_PRODUCTS_QUERY} from '~/graphql/product-queries';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import WeThinkYoullLove from '~/components/WeThinkYoullLove';
import BestsellersSection from '~/components/BestsellersSection';
import BackToTop from '~/components/BackToTop';

export async function loader({request, context}) {
  try {
    // Run all independent async operations in parallel to avoid I/O context issues
    const [productsData, collectionsData, user] = await Promise.all([
      loadCriticalData({context}),
      loadCollectionData({context}),
      requireAuth(context),
    ]);

    const {products} = productsData;
    const {collections} = collectionsData;

    // Fetch registry and userData in parallel
    const [registry, userData] = await Promise.all([
      context.ClientGet(`registries/by-userId/${user.user.id}`, context),
      context?.ClientGet(`users/${user?.user?.id}`, context),
    ]);

    // Fetch ready-made registries using the same pattern as home index
    let featuredRegistryData = null;
    try {
      const {collections: readyMadeCollections} =
        await context.storefront.query(READY_MADE_REGISTRIES_QUERY);

      // Log metafield values for debugging
      if (readyMadeCollections?.nodes) {
        readyMadeCollections.nodes.forEach((collection, index) => {});
      }

      // Filter collections that have both readyMadeMetafield AND parentCollectionMetafield set to true
      const filteredReadyMadeCollections =
        readyMadeCollections?.nodes?.filter(
          (collection) =>
            collection.readyMadeMetafield?.value === 'true' &&
            collection.parentCollectionMetafield?.value === 'true',
        ) || [];

      // Categorize collections by type
      const realRegistries = filteredReadyMadeCollections.filter(
        (collection) => {
          const title = collection.title?.toLowerCase() || '';
          const description = collection.description?.toLowerCase() || '';

          // Include collections with real/authentic terms
          const realTerms = ['real', 'authentic', 'couple', 'wedding'];
          const hasRealTerms = realTerms.some(
            (term) => title.includes(term) || description.includes(term),
          );

          // Exclude themed and lorem collections
          const excludeTerms = ['themed', 'minimalist', 'lorem'];
          const hasExcludeTerms = excludeTerms.some(
            (term) => title.includes(term) || description.includes(term),
          );

          return hasRealTerms && !hasExcludeTerms;
        },
      );

      const themedRegistries = filteredReadyMadeCollections.filter(
        (collection) => {
          const title = collection.title?.toLowerCase() || '';
          const description = collection.description?.toLowerCase() || '';

          return title.includes('themed') || description.includes('themed');
        },
      );

      // Select the best collection for each type
      let realRegistriesCollection =
        realRegistries.find((col) =>
          col.title?.toLowerCase().includes('real'),
        ) || realRegistries[0];

      let themedRegistriesCollection =
        themedRegistries.find((col) =>
          col.title?.toLowerCase().includes('themed'),
        ) || themedRegistries[0];

      // Helper function to fetch sub-collections for a given parent collection
      const fetchSubCollections = async (parentCollection) => {
        if (!parentCollection) return [];

        const subCollections = [];
        const subCollectionMetafield = parentCollection.subCollectionMetafield;

        if (subCollectionMetafield?.value) {
          let subCollectionIds = [];

          try {
            // Try to parse as JSON first
            if (typeof subCollectionMetafield.value === 'string') {
              subCollectionIds = JSON.parse(subCollectionMetafield.value);
            } else if (Array.isArray(subCollectionMetafield.value)) {
              subCollectionIds = subCollectionMetafield.value;
            }

            if (!Array.isArray(subCollectionIds)) {
              subCollectionIds = [subCollectionIds];
            }
          } catch (error) {
            // Fallback to comma split
            if (typeof subCollectionMetafield.value === 'string') {
              subCollectionIds = subCollectionMetafield.value
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id.length > 0);
            }
          }

          // Fetch all sub-collections in parallel to avoid I/O context issues
          if (subCollectionIds.length > 0) {
            try {
              const subCollectionPromises = subCollectionIds.map(
                async (subCollectionId) => {
                  try {
                    const subCollectionData = await context.storefront.query(
                      SUB_COLLECTION_QUERY,
                      {
                        variables: {id: subCollectionId},
                      },
                    );
                    return subCollectionData?.collection || null;
                  } catch (error) {
                    console.error(
                      'Error fetching sub-collection:',
                      subCollectionId,
                      error,
                    );
                    return null;
                  }
                },
              );

              const subCollectionResults = await Promise.all(
                subCollectionPromises,
              );
              subCollections.push(...subCollectionResults.filter(Boolean));
            } catch (error) {
              console.error(
                'Error fetching sub-collections in parallel:',
                error,
              );
            }
          }
        }

        return subCollections;
      };

      // Fetch sub-collections for each type in parallel
      const [realSubCollections, themedSubCollections] = await Promise.all([
        fetchSubCollections(realRegistriesCollection),
        fetchSubCollections(themedRegistriesCollection),
      ]);

      // Structure the data with registry types
      if (realRegistriesCollection || themedRegistriesCollection) {
        featuredRegistryData = {
          real: {
            parentCollection: realRegistriesCollection,
            subCollections: realSubCollections,
          },
          themed: {
            parentCollection: themedRegistriesCollection,
            subCollections: themedSubCollections,
          },
        };
      }

      // If no ready-made registries found, try to use regular collections as fallback
      if (
        !featuredRegistryData ||
        (!featuredRegistryData.real?.subCollections?.length &&
          !featuredRegistryData.themed?.subCollections?.length)
      ) {
        // Use the first few collections as a fallback
        const fallbackCollections = collections?.slice(0, 3) || [];
        if (fallbackCollections.length > 0) {
          featuredRegistryData = {
            real: {
              parentCollection: {title: 'Fallback Collections'},
              subCollections: fallbackCollections,
            },
            themed: {
              parentCollection: {title: 'Fallback Collections'},
              subCollections: [],
            },
          };
        }
      }
    } catch (error) {
      // Handle any errors in fetching ready-made registries
      console.error('Error fetching ready-made registries:', error);
      console.error('Error stack:', error.stack);

      // Try fallback with regular collections
      const fallbackCollections = collections?.slice(0, 3) || [];
      if (fallbackCollections.length > 0) {
        featuredRegistryData = {
          real: {
            parentCollection: {title: 'Fallback Collections'},
            subCollections: fallbackCollections,
          },
          themed: {
            parentCollection: {title: 'Fallback Collections'},
            subCollections: [],
          },
        };
      }
    }

    // Extract products only from parent collections (parentMetafield.value === 'true' and readyMadeMetafield.value !== 'true', or title includes FUNDS e.g. CASH FUNDS, TRAVEL FUNDS)
    let allProducts = [];
    const productMap = new Map(); // Use Map to track unique products by ID

    const isExcludedFundsCollection = (col) => {
      const t = (col.title && String(col.title).toUpperCase().trim()) || '';
      return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
    };

    const isParentForSlides = (col) =>
      col.parentMetafield?.value === 'true' &&
      col.readyMadeMetafield?.value !== 'true' &&
      !isExcludedFundsCollection(col);

    try {
      // First, find all parent collections (exclude CASH FUNDS and TRAVEL FUNDS)
      const parentCollections = collections.filter(isParentForSlides);

      // Process all parent collections synchronously (no async operations here)
      for (const parentCollection of parentCollections) {
        // Get sub-collection GIDs from the parent's subCollectionMetafield (Collection type) or subMetafield (JSON string)
        let subCollectionGids = [];
        let subCollections = [];

        // First, try to get from the new Collection type metafield (references)
        if (parentCollection.subCollectionMetafield?.references?.edges) {
          subCollections =
            parentCollection.subCollectionMetafield.references.edges.map(
              (edge) => edge.node,
            );
          subCollectionGids = subCollections.map((sub) => sub.id);
        } else if (parentCollection.subMetafield?.value) {
          // Fallback to old JSON string format
          try {
            subCollectionGids = JSON.parse(parentCollection.subMetafield.value);
            // Find sub-collections by GID
            subCollections = collections.filter(
              (col) =>
                col.parentMetafield?.value === 'false' &&
                col.readyMadeMetafield?.value !== 'true' &&
                subCollectionGids.includes(col.id),
            );
          } catch (error) {
            // Handle any errors in parsing subMetafield
            console.error('Error parsing subMetafield:', error);
          }
        }

        // Extract products from sub-collections (synchronous operation)
        for (const subCollectionRef of subCollections) {
          // Find the full collection data from the main collections array
          const subCollection =
            collections.find((col) => col.id === subCollectionRef.id) ||
            subCollectionRef; // Fallback to reference if not found

          if (subCollection.products?.edges) {
            for (const edge of subCollection.products.edges) {
              const product = edge.node;

              // Only add product if it hasn't been added before (deduplication)
              if (!productMap.has(product.id)) {
                const productData = {
                  id: product.id,
                  title: product.title,
                  handle: product.handle,
                  description: product.description,
                  image: product.images?.edges?.[0]?.node?.url || null,
                  price:
                    product.variants?.edges?.[0]?.node?.priceV2?.amount || '0',
                  currency:
                    product.variants?.edges?.[0]?.node?.priceV2?.currencyCode ||
                    'USD',
                  availableForSale:
                    product.variants?.edges?.[0]?.node?.availableForSale ||
                    false,
                  createdAt: product.createdAt,
                  style: product.styleMetafield?.value || null, // Modern, Classic, Eclectic
                  collectionId: subCollection.id, // Use sub-collection ID
                  parentCollectionId: parentCollection.id, // Also track parent collection ID
                  parentCollectionTitle: parentCollection.title, // Track parent collection title
                };

                productMap.set(product.id, productData);
                allProducts.push(productData);
              } else {
                // If product already exists, update the collection info to include this sub-collection
                const existingProduct = productMap.get(product.id);
                if (existingProduct) {
                  // Add this sub-collection info to the existing product
                  if (!existingProduct.collectionIds) {
                    existingProduct.collectionIds = [
                      existingProduct.collectionId,
                    ];
                  }
                  if (
                    !existingProduct.collectionIds.includes(subCollection.id)
                  ) {
                    existingProduct.collectionIds.push(subCollection.id);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // Handle any errors in extracting products from collections
      console.error('Error extracting products from collections:', error);
    }

    // Log deduplication results

    // Fetch bestseller, new-arrivals and recommended products in parallel
    let bestsellerProducts = [];
    let specialBestsellerProducts = [];
    let specialNewArrivalProducts = [];
    let specialGiftCardProducts = [];
    let recommendedProducts = [];

    try {
      const [bestsellerResult, newArrivalsResult, recommendedResult] = await Promise.all([
        context.storefront.query(BESTSELLER_PRODUCTS_QUERY).catch((error) => {
          console.error('Error fetching bestseller products:', error);
          return {products: {edges: []}};
        }),
        context.storefront
          .query(NEW_ARRIVALS_PRODUCTS_QUERY)
          .catch((error) => {
            console.error('Error fetching new arrivals products:', error);
            return {products: {edges: []}};
          }),
        context.storefront
          .query(RECOMMENDED_PRODUCTS_QUERY, {
            variables: {first: 8},
          })
          .catch((error) => {
            console.error('Error loading recommended products:', error);
            return {products: {edges: []}};
          }),
      ]);

      bestsellerProducts =
        bestsellerResult?.products?.edges?.map((edge) => ({
          node: {
            id: edge.node.id,
            title: edge.node.title,
            handle: edge.node.handle,
            description: edge.node.description,
            images: edge.node.images,
            priceRange: edge.node.priceRange,
            variants: edge.node.variants,
          },
        })) || [];

      specialBestsellerProducts =
        bestsellerResult?.products?.edges?.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          description: edge.node.description,
          image: edge.node.images?.edges?.[0]?.node?.url || null,
          price:
            edge.node.variants?.edges?.[0]?.node?.priceV2?.amount ||
            edge.node.priceRange?.minVariantPrice?.amount ||
            '0',
          currency:
            edge.node.variants?.edges?.[0]?.node?.priceV2?.currencyCode ||
            edge.node.priceRange?.minVariantPrice?.currencyCode ||
            'USD',
          availableForSale:
            edge.node.variants?.edges?.[0]?.node?.availableForSale || false,
          createdAt: edge.node.createdAt || null,
          style: null,
          collectionId: SPECIAL_PRODUCT_TYPE_IDS.BESTSELLERS,
          parentCollectionId: null,
          parentCollectionTitle: 'BESTSELLERS',
        })) || [];

      specialNewArrivalProducts =
        newArrivalsResult?.products?.edges?.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          description: edge.node.description,
          image: edge.node.images?.edges?.[0]?.node?.url || null,
          price:
            edge.node.variants?.edges?.[0]?.node?.priceV2?.amount ||
            edge.node.priceRange?.minVariantPrice?.amount ||
            '0',
          currency:
            edge.node.variants?.edges?.[0]?.node?.priceV2?.currencyCode ||
            edge.node.priceRange?.minVariantPrice?.currencyCode ||
            'USD',
          availableForSale:
            edge.node.variants?.edges?.[0]?.node?.availableForSale || false,
          createdAt: edge.node.createdAt || null,
          style: null,
          collectionId: SPECIAL_PRODUCT_TYPE_IDS.NEW_ARRIVALS,
          parentCollectionId: null,
          parentCollectionTitle: 'NEW IN',
        })) || [];

      specialGiftCardProducts = (collections || [])
        .filter((collection) => collection.giftCardMetafield?.value === 'true')
        .flatMap(
          (collection) =>
            collection.products?.edges?.map((edge) => ({
              id: edge.node.id,
              title: edge.node.title,
              handle: edge.node.handle,
              description: edge.node.description,
              image: edge.node.images?.edges?.[0]?.node?.url || null,
              price: edge.node.variants?.edges?.[0]?.node?.priceV2?.amount || '0',
              currency:
                edge.node.variants?.edges?.[0]?.node?.priceV2?.currencyCode ||
                'USD',
              availableForSale:
                edge.node.variants?.edges?.[0]?.node?.availableForSale || false,
              createdAt: edge.node.createdAt || null,
              style: null,
              collectionId: SPECIAL_PRODUCT_TYPE_IDS.GIFT_CARDS,
              parentCollectionId: null,
              parentCollectionTitle: collection.title || 'GIFT CARDS',
            })) || [],
        );

      recommendedProducts = recommendedResult?.products?.edges || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      bestsellerProducts = [];
      specialBestsellerProducts = [];
      specialNewArrivalProducts = [];
      specialGiftCardProducts = [];
      recommendedProducts = [];
    }

    const returnData = {
      products: allProducts,
      collections,
      user,
      registry,
      userData,
      readyMadeRegistries: featuredRegistryData,
      bestsellerProducts,
      specialProducts: {
        bestsellers: specialBestsellerProducts,
        newArrivals: specialNewArrivalProducts,
        giftCards: specialGiftCardProducts,
      },
      recommendedProducts,
    };

    return json(returnData);
  } catch (error) {
    console.error('Error in dashboard.addgifts loader:', error);
    // Return minimal data to prevent page crash
    return json({
      products: [],
      collections: [],
      user: null,
      registry: null,
      userData: null,
      readyMadeRegistries: null,
      bestsellerProducts: [],
      specialProducts: {
        bestsellers: [],
        newArrivals: [],
        giftCards: [],
      },
      recommendedProducts: [],
      error: error.message,
    });
  }
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

async function loadCriticalData({context}) {
  const token =
    process.env.PUBLIC_STOREFRONT_API_TOKEN ||
    context.env?.PUBLIC_STOREFRONT_API_TOKEN;
  try {
    const [{products}] = await Promise.all([
      context.storefront.query(PRODUCT_QUERY),
    ]);
    return {
      products: products?.edges || [],
    };
  } catch (error) {
    throw error;
  }
}

async function loadCollectionData({context}) {
  try {
    const [{collections}] = await Promise.all([
      context.storefront.query(COLLECTION_QUERY),
    ]);
    return {
      collections: collections?.nodes || [],
    };
  } catch (error) {
    throw error;
  }
}

const STYLE_OPTIONS = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'eclectic', label: 'Eclectic' },
  { id: 'shopAll', label: 'Shop All' },
];

const SPECIAL_PRODUCT_TYPE_IDS = {
  BESTSELLERS: '__BESTSELLERS__',
  NEW_ARRIVALS: '__NEW_ARRIVALS__',
  GIFT_CARDS: '__GIFT_CARDS__',
};

function SidebarFilter({
  collections,
  checkedCollectionIds,
  setCheckedCollectionIds,
  selectedSwiperCollectionId,
  selectedSubCollections,
  selectedHeroCollection,
  shopAllChecked,
  setShopAllChecked,
  registry,
  checkedStyles,
  onStyleCheckbox,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    styles: true,
    productType: true,
  });

  const isExcludedFundsCollection = (col) => {
    const t = (col.title && String(col.title).toUpperCase().trim()) || '';
    return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
  };

  const isParentForSlides = (col) =>
    col.parentMetafield?.value === 'true' &&
    col.readyMadeMetafield?.value !== 'true' &&
    !isExcludedFundsCollection(col);

  // Get parent collections for the swiper and Product Categories
  const parentCollection = collections.filter(isParentForSlides);

  // Get sub-collections for Shop by Style (these are the ones that actually contain products)
  const baseSubCollection = collections.filter(
    (col) =>
      col.parentMetafield?.value === 'false' &&
      col.readyMadeMetafield?.value !== 'true',
  );

  // When a parent collection is selected in the swiper, show only its sub-collections in "Shop by Style"
  const subCollection =
    selectedSwiperCollectionId && selectedSubCollections?.length > 0
      ? selectedSubCollections
      : baseSubCollection;

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
        {!selectedSwiperCollectionId && (
          <div className="mb-[3.438vw]">
            <h2
              className="text-sm font-bold uppercase mb-[2.344vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
              onClick={() => toggleSection('categories')}
            >
              Product Types
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
                <li className="mb-[1.69vw]">
                  <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                    <input
                      type="checkbox"
                      className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                      checked={checkedCollectionIds.includes(
                        SPECIAL_PRODUCT_TYPE_IDS.BESTSELLERS,
                      )}
                      onChange={() =>
                        handleSidebarCheckbox(SPECIAL_PRODUCT_TYPE_IDS.BESTSELLERS)
                      }
                    />
                    BESTSELLERS
                  </label>
                </li>
                {parentCollection.map((col) => (
                  <li key={col.id} className="mb-[1.69vw]">
                    <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
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
                <li className="mb-[1.69vw]">
                  <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                    <input
                      type="checkbox"
                      className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                      checked={checkedCollectionIds.includes(
                        SPECIAL_PRODUCT_TYPE_IDS.NEW_ARRIVALS,
                      )}
                      onChange={() =>
                        handleSidebarCheckbox(SPECIAL_PRODUCT_TYPE_IDS.NEW_ARRIVALS)
                      }
                    />
                    NEW IN
                  </label>
                </li>
                <li className="mb-[1.69vw]">
                  <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                    <input
                      type="checkbox"
                      className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                      checked={checkedCollectionIds.includes(
                        SPECIAL_PRODUCT_TYPE_IDS.GIFT_CARDS,
                      )}
                      onChange={() =>
                        handleSidebarCheckbox(SPECIAL_PRODUCT_TYPE_IDS.GIFT_CARDS)
                      }
                    />
                    GIFT CARDS
                  </label>
                </li>
              </ul>
            )}
          </div>
        )}

        {/* When a parent collection is selected: optionally Product Type + Style */}
        {selectedSwiperCollectionId && (
          <>
            {/* Hide Product Type when a specific sub-collection is selected in the hero */}
            {!selectedHeroCollection && (
              <div className="mb-[3.438vw]">
                <h2
                  className="text-sm font-bold uppercase mb-[2.344vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
                  onClick={() => toggleSection('productType')}
                >
                  Product Type
                  <span className="text-lg relative -top-[3px]">
                    {openSections.productType ? (
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
                {openSections.productType && (
                  <ul className="space-y-2 text-sm">
                    {(selectedSubCollections || []).map((col) => (
                      <li key={col.id} className="mb-[1.69vw]">
                        <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
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
            )}
            <div>
              <h2
                className="text-sm font-bold uppercase mb-[2.344vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
                onClick={() => toggleSection('styles')}
              >
                Style
                <span className="text-lg relative -top-[3px]">
                  {openSections.styles ? (
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
              {openSections.styles && (
                <ul className="space-y-2 text-sm">
                  {STYLE_OPTIONS.map((opt) => (
                    <li key={opt.id} className="mb-[1.69vw]">
                      <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                        <input
                          type="checkbox"
                          className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                          checked={checkedStyles?.[opt.id]}
                          onChange={() => onStyleCheckbox?.(opt.id)}
                        />
                        {opt.label}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* When no collection selected: Style section with hardcoded Modern, Classic, Eclectic, Shop All (Shop All at lowest) */}
        {!selectedSwiperCollectionId && (
          <div>
            <h2
              className="text-sm font-bold uppercase mb-[2.344vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
              onClick={() => toggleSection('styles')}
            >
              Style
              <span className="text-lg relative -top-[3px]">
                {openSections.styles ? (
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
            {openSections.styles && (
              <ul className="space-y-2 text-sm">
                {STYLE_OPTIONS.filter((o) => o.id !== 'shopAll').map((opt) => (
                  <li key={opt.id} className="mb-[1.69vw]">
                    <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                      <input
                        type="checkbox"
                        className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                        checked={checkedStyles?.[opt.id]}
                        onChange={() => onStyleCheckbox?.(opt.id)}
                      />
                      {opt.label}
                    </label>
                  </li>
                ))}
                <li className="mb-[1.69vw]">
                  <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                    <input
                      type="checkbox"
                      className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                      checked={checkedStyles?.shopAll}
                      onChange={() => onStyleCheckbox?.('shopAll')}
                    />
                    Shop All
                  </label>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
      <Link to={`/couple/single/${registry?.data?.[0]?.userId}`}>
        <div className="bg-[#446184] z-10 max-[1024px]:w-full mt-4 py-6">
          <div className="w-full mx-auto flex justify-center items-center gap-6 h-full">
            <img
              src="/assets/Images/share-icon.png"
              alt="preview"
              className="w-[36px] filter brightness-100"
            />
            <h2 className="text-white text-sm text-center font-bold m-0 lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw]">
              PREVIEW PAGE
            </h2>
          </div>
        </div>
      </Link>
      {/* Show PreviewRegistry only after a parent collection is selected */}
      {/* {selectedSwiperCollectionId && (
        <div className="mt-6">
          <PreviewRegistry useAbsolutePosition={false} />
        </div>
      )} */}
    </div>
  );
}

export default function AddGifts() {
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [dateSort, setDateSort] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const topRef = useRef(null);

  const loaderData = useLoaderData();
  const {
    products,
    collections,
    user,
    registry,
    userData,
    readyMadeRegistries,
    bestsellerProducts,
    specialProducts,
    recommendedProducts,
  } = loaderData;

  if (
    readyMadeRegistries &&
    readyMadeRegistries.subCollections &&
    readyMadeRegistries.subCollections.length > 0
  )
    if (!loaderData || !products || !collections) {
      // Show loading state if data is not yet available
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Loading dashboard...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      );
    }

  // Get all products from all collections for search results
  const allProducts = collections.flatMap(
    (collection) =>
      collection.products?.edges?.map((edge) => ({
        ...edge.node,
        collectionTitle: collection.title,
        collectionHandle: collection.handle,
      })) || [],
  );

  const fetcher = useFetcher();
  const navigate = useNavigate();

  // Static tabsData like in home index file
  const tabsData = [
    {
      label: 'REAL REGISTRIES',
      value: 1,
      route: 'realregistries',
    },
    {
      label: 'THEMED REGISTRIES',
      value: 2,
      route: 'themedregistries',
    },
  ];

  // State for checked collections and displayed products
  const [checkedCollectionIds, setCheckedCollectionIds] = useState([]);
  const [selectedSwiperCollectionId, setSelectedSwiperCollectionId] =
    useState(null);
  const [selectedSubCollections, setSelectedSubCollections] = useState([]);
  const [selectedHeroCollection, setSelectedHeroCollection] = useState(null);
  const [shopAllChecked, setShopAllChecked] = useState(false);
  const [checkedStyles, setCheckedStyles] = useState(() =>
    STYLE_OPTIONS.reduce((acc, o) => ({ ...acc, [o.id]: false }), {}),
  );
  const handleStyleCheckbox = (id) => {
    setCheckedStyles((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [addingProductId, setAddingProductId] = useState(null);
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);

  useEffect(() => {
    if (fetcher.state === 'idle') setAddingProductId(null);
  }, [fetcher.state]);

  // Filter products based on selected collections, Product Type, and Style (metafield)
  const filteredProducts = (() => {
    let list = products;
    const effectiveCheckedCollectionIds = checkedCollectionIds.filter(
      (id) => !Object.values(SPECIAL_PRODUCT_TYPE_IDS).includes(id),
    );
    const selectedSpecialTypeIds = checkedCollectionIds.filter((id) =>
      Object.values(SPECIAL_PRODUCT_TYPE_IDS).includes(id),
    );

    // When a parent collection is selected: show only that parent's products, filtered by Product Type (sub-collection) checkboxes
    if (selectedSwiperCollectionId) {
      list = products.filter(
        (product) =>
          product.parentCollectionId === selectedSwiperCollectionId,
      );
      if (effectiveCheckedCollectionIds.length > 0) {
        list = list.filter((product) => {
          if (effectiveCheckedCollectionIds.includes(product.collectionId))
            return true;
          if (
            product.collectionIds &&
            product.collectionIds.some((id) =>
              effectiveCheckedCollectionIds.includes(id),
            )
          ) {
            return true;
          }
          return false;
        });
      }

      // Style filter (when parent selected): filter by style metafield (Modern, Classic, Eclectic)
      const selectedStyleIds = STYLE_OPTIONS.filter(
        (o) => o.id !== 'shopAll' && checkedStyles[o.id],
      ).map((o) => o.id);
      if (selectedStyleIds.length > 0) {
        list = list.filter((product) => {
          const productStyle = (product.style || '').trim().toLowerCase();
          if (!productStyle) return false;
          return selectedStyleIds.some((id) => productStyle === id);
        });
      }
      return list;
    }

    // No parent selected: use Product Categories (parent checkboxes), then apply Style filter (Modern/Classic/Eclectic/Shop All)
    if (selectedSpecialTypeIds.length > 0) {
      const specialBuckets = {
        [SPECIAL_PRODUCT_TYPE_IDS.BESTSELLERS]: specialProducts?.bestsellers || [],
        [SPECIAL_PRODUCT_TYPE_IDS.NEW_ARRIVALS]: specialProducts?.newArrivals || [],
        [SPECIAL_PRODUCT_TYPE_IDS.GIFT_CARDS]: specialProducts?.giftCards || [],
      };
      const mergedSpecialProducts = selectedSpecialTypeIds.flatMap(
        (id) => specialBuckets[id] || [],
      );
      const dedupedSpecialProducts = Array.from(
        new Map(mergedSpecialProducts.map((product) => [product.id, product])).values(),
      );
      return dedupedSpecialProducts;
    }

    if (shopAllChecked) {
      list = products;
    } else if (effectiveCheckedCollectionIds.length > 0) {
      list = products.filter((product) => {
        if (effectiveCheckedCollectionIds.includes(product.collectionId))
          return true;
        if (effectiveCheckedCollectionIds.includes(product.parentCollectionId))
          return true;
        if (
          product.collectionIds &&
          product.collectionIds.some((id) =>
            effectiveCheckedCollectionIds.includes(id),
          )
        ) {
          return true;
        }
        return false;
      });
    } else {
      list = products;
    }
    // Style filter when no parent selected: same as when parent selected (by style metafield)
    const selectedStyleIds = STYLE_OPTIONS.filter(
      (o) => o.id !== 'shopAll' && checkedStyles?.[o.id],
    ).map((o) => o.id);
    if (selectedStyleIds.length > 0) {
      list = list.filter((product) => {
        const productStyle = (product.style || '').trim().toLowerCase();
        if (!productStyle) return false;
        return selectedStyleIds.some((id) => productStyle === id);
      });
    }
    return list;
  })();

  // Sort products based on selected sort option
  const sortedProducts = React.useMemo(() => {
    if ((!priceSort && !dateSort) || filteredProducts.length === 0) {
      return filteredProducts;
    }

    return [...filteredProducts].sort((a, b) => {
      if (priceSort === 'low-to-high') {
        const priceA = parseFloat(a.price || 0);
        const priceB = parseFloat(b.price || 0);
        return priceA - priceB;
      } else if (priceSort === 'high-to-low') {
        const priceA = parseFloat(a.price || 0);
        const priceB = parseFloat(b.price || 0);
        return priceB - priceA;
      } else if (dateSort === 'newest') {
        const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return createdAtB - createdAtA;
      } else if (dateSort === 'oldest') {
        const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return createdAtA - createdAtB;
      }
      return 0;
    });
  }, [filteredProducts, priceSort, dateSort]);

  // Browser console: show products and filtered products
  useEffect(() => {
    console.log('Add Gifts – products:', products);
    console.log('Add Gifts – filteredProducts:', filteredProducts);
  }, [products, filteredProducts]);

  const handleAddtoRegistry = (product, quantity = 1, isGroupGift = false) => {
    try {
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

      const payload = {
        productId: Number(extractShopifyId(product.id)),
        amount: Number(product.price),
        registryId: Number(registry.data[0].id),
        productTypeId: 1,
        quantity: quantity || 1,
        isGroupPayment: isGroupGift || false,
        ...(product.parentCollectionId && {parentCollectionId: product.parentCollectionId}),
      };

      setAddingProductId(product.id);
      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );
    } catch (error) {
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!selectedSwiperCollectionId) setShopAllChecked(false);
  }, [selectedSwiperCollectionId]);

  const isExcludedFundsCollection = (col) => {
    const t = (col.title && String(col.title).toUpperCase().trim()) || '';
    return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
  };

  const isParentForSlides = (col) =>
    col.parentMetafield?.value === 'true' &&
    col.readyMadeMetafield?.value !== 'true' &&
    !isExcludedFundsCollection(col);

  const parentCollection = collections.filter(isParentForSlides);

  return (
    <>
      {selectedSwiperCollectionId ? (
        <></>
      ) : (
        <div className="pt-[3.75vw] relative px-4">
          <h2 className="mt-0 ivyora lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] text-[24px] prata text-center lg:leading-[3.333vw] xl:leading-[3.333vw] 2xl:leading-[3.333vw] font-normal mb-1">
            <span className="prata">gifts</span>
          </h2>
          <img
            src={headingBottomCurve}
            alt="Couple"
            className="w-[9.375vw] h-[6px] mt-2 mx-auto"
          />
          <p className="w-[46.771vw] max-w-full mx-auto text-center text-[1.25vw] leading-[1.667vw] mt-[1.771vw] mb-[4.583vw] font-normal">
            Browse by category, filter by price, or get inspired with our
            curated edits.
            <br className="max-[1024px]:hidden" />
            Add, update, or switch things up whenever you like.
          </p>
        </div>
      )}

      <section className="">
        <div className=" relative items-start mb-10 max-[1024px]:my-10">
          <div className="flex flex-row items-center justify-center">
            {!selectedSwiperCollectionId && (
              <>
                <div className="z-10 mb-8 swiper-button-prev-prod absolute left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase  max-[1601px]:w-[90px] items-center bg-white top-[38%] px-8 py-10 justify-center max-[1024px]:w-[33px] max-[1024px]:h-[33px] max-[1024px]:p-0 flex">
                  <img
                    src={nextitem}
                    alt=""
                    className="rotate-90 size-6 max-[1024px]:size-2"
                  />
                </div>

                <Swiper
                  spaceBetween={15}
                  slidesPerView={3.5} // Shows 3 full + a portion of 4th
                  centeredSlides={true} // Enables .5 on both sides
                  loop={true}
                  modules={[Navigation]}
                  navigation={{
                    nextEl: '.swiper-button-next-prod',
                    prevEl: '.swiper-button-prev-prod',
                  }}
                  className=""
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
                      spaceBetween: 39,
                      centeredSlides: true,
                    },
                    1600: {
                      slidesPerView: 3.5,
                      spaceBetween: 39,
                      centeredSlides: true,
                    },
                  }}
                >
                  <SwiperSlide
                    key="special-bestsellers"
                    onClick={() => navigate('/products/bestsellers')}
                    style={{cursor: 'pointer'}}
                  >
                    <img
                      src={bestSellers}
                      alt="BESTSELLERS"
                      className="w-full h-[440px] max-[1024px]:h-[32vw] max-[475px]:h-[44vw] object-cover"
                    />
                    <h3 className="mt-[1.927vw] text-center uppercase text-[1.25vw] leading-[1.667vw] text-sm font-medium tracking-wider">
                      BESTSELLERS
                    </h3>
                  </SwiperSlide>

                  {/* Dynamic slides from Shopify collections */}
                  {collections
                    .filter((col) => isParentForSlides(col))
                    .map((col) => (
                      <SwiperSlide
                        key={col.id}
                        onClick={() => {
                          // Get sub-collections from the Collection type metafield references
                          let subCollections = [];
                          let subCollectionGids = [];

                          // First, try to get from the new Collection type metafield (references)
                          if (col.subCollectionMetafield?.references?.edges) {
                            subCollections =
                              col.subCollectionMetafield.references.edges.map(
                                (edge) => edge.node,
                              );
                            subCollectionGids = subCollections.map(
                              (sub) => sub.id,
                            );
                          } else if (col.subMetafield?.value) {
                            // Fallback to old JSON string format
                            try {
                              subCollectionGids = JSON.parse(
                                col.subMetafield.value,
                              );
                              // Find sub-collections from collections array
                              subCollections = collections.filter((c) =>
                                subCollectionGids.includes(c.id),
                              );
                            } catch (error) {
                              // Handle any errors in parsing subMetafield
                            }
                          }

                          // Parent selected: show its sub-collections in sidebar but do not pre-select any Product Type
                          setCheckedCollectionIds([]);
                          setSelectedSubCollections(subCollections);
                          setSelectedSwiperCollectionId(col.id);
                          setShopAllChecked(true);
                        }}
                        style={{cursor: 'pointer'}}
                      >
                        <img
                          src={
                            col.image?.url || '/assets/Images/placeholder.png'
                          }
                          alt={col.title}
                          className="w-full h-[440px] max-[1024px]:h-[32vw] max-[475px]:h-[44vw] object-cover"
                        />
                        <h3 className="mt-[1.927vw] text-center uppercase text-[1.25vw] leading-[1.667vw] text-sm font-medium tracking-wider">
                          {col.title}
                        </h3>
                      </SwiperSlide>
                    ))}

                  <SwiperSlide
                    key="special-new-in"
                    onClick={() => navigate('/products/new-arrivals')}
                    style={{cursor: 'pointer'}}
                  >
                    <img
                      src={newArrivals}
                      alt="NEW IN"
                      className="w-full h-[440px] max-[1024px]:h-[32vw] max-[475px]:h-[44vw] object-cover"
                    />
                    <h3 className="mt-[1.927vw] text-center uppercase text-[1.25vw] leading-[1.667vw] text-sm font-medium tracking-wider">
                      NEW IN
                    </h3>
                  </SwiperSlide>

                  <SwiperSlide
                    key="special-gift-cards"
                    onClick={() => navigate('/dashboard/giftcards')}
                    style={{cursor: 'pointer'}}
                  >
                    <div className="w-full h-[440px] max-[1024px]:h-[32vw] max-[475px]:h-[44vw] bg-[#446184] flex items-center justify-center p-4">
                      <img
                        src={giftCards}
                        alt="GIFT CARDS"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="mt-[1.927vw] text-center uppercase text-[1.25vw] leading-[1.667vw] text-sm font-medium tracking-wider">
                      GIFT CARDS
                    </h3>
                  </SwiperSlide>
                </Swiper>
                <div className="swiper-button-next-prod absolute right-[1%] max-[1601px]:-right-[0%] cursor-pointer uppercase max-[1601px]:w-[90px] items-center bg-white z-10 top-[38%] px-8 py-10  justify-center text-white max-[1024px]:w-[33px] max-[1024px]:h-[33px] max-[1024px]:p-0 flex">
                  <img
                    src={nextitem}
                    className="size-6 rotate-270 max-[1024px]:size-2"
                    alt=""
                  />
                </div>
              </>
            )}

            {/* Selected collection image at 100% width */}
            {selectedSwiperCollectionId && (
              <div className="relative w-full">
                {/* <button
                  onClick={() => {
                    setSelectedSwiperCollectionId(null);
                    setSelectedSubCollections([]);
                    setCheckedCollectionIds([]);
                  }}
                  className="absolute top-4 left-4 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 px-4 py-2 rounded-sm text-sm font-medium uppercase tracking-wider transition-all shadow-sm"
                >
                  ← Back
                </button> */}
                {/* <img
                  src={
                    collections.find(
                      (col) => col.id === selectedSwiperCollectionId,
                    )?.image?.url || '/assets/Images/placeholder.png'
                  }
                  alt={
                    collections.find(
                      (col) => col.id === selectedSwiperCollectionId,
                    )?.title
                  }
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                /> */}

                {/* Hero section: parent vs selected sub-collection */}
                {selectedSubCollections && selectedSubCollections.length > 0 && (
                  <div className="flex items-center bottom-0 left-0 right-0 bg-[#F5F2ED] h-[27.083vw] pl-[7.396vw] relative gap-[8.698vw] w-full overflow-hidden">
                    {/* If a sub-collection is selected for hero, match Bestsellers hero style */}
                    {selectedHeroCollection ? (
                      <>
                        <div className="relative p-4 w-[30%]">
                          <h2 className="text-[2.5vw] leading-[1.875vw] text-center font-normal lowercase prata">
                            {selectedHeroCollection.title?.toLowerCase() ||
                              'collection'}
                          </h2>
                          <img
                            src="/assets/Images/gifts-bottom-line.png"
                            alt="collection divider"
                            className="w-[14.375vw] h-[6px] mt-[1.198vw] mx-auto object-contain"
                          />
                        </div>
                        <img
                          src={
                            selectedHeroCollection.image?.url ||
                            '/assets/Images/placeholder.png'
                          }
                          alt={selectedHeroCollection.title}
                          className="w-[70%] h-full object-cover"
                        />
                      </>
                    ) : (
                      // Default: parent collection title on left, sub-collections swiper on right
                      <div className="flex items-center gap-[8.698vw] w-full">
                        <h3 className="text-[2.5vw] leading-[1.875vw] text-center font-normal lowercase prata w-[276px]">
                          {collections
                            .find(
                              (col) => col.id === selectedSwiperCollectionId,
                            )
                            ?.title?.toLowerCase() || 'collection'}
                          <img
                            src={giftBottomCurve}
                            alt="Couple"
                            className="w-[14.375vw] h-[6px] mt-[1.198vw] mx-auto"
                          />
                        </h3>

                        <div className="relative flex-1 min-w-0">
                          <div className="z-20 mb-8 swiper-button-prev-sub absolute left-[35px] cursor-pointer text-white uppercase items-center bg-white top-[43%] translate-y-[-50%] px-8 py-10 justify-center max-[1024px]:w-[33px] flex">
                            <img
                              src={nextitem}
                              alt=""
                              className="rotate-90 size-6"
                            />
                          </div>

                          <Swiper
                            spaceBetween={18}
                            slidesPerView={5}
                            loop={false}
                            modules={[Navigation]}
                            navigation={{
                              nextEl: '.swiper-button-next-sub',
                              prevEl: '.swiper-button-prev-sub',
                            }}
                            className="relative w-full"
                            breakpoints={{
                              345: {
                                slidesPerView: 1.25,
                                spaceBetween: 10,
                              },
                              475: {
                                slidesPerView: 2.25,
                                spaceBetween: 15,
                              },
                              768: {
                                slidesPerView: 2.25,
                                spaceBetween: 18,
                              },
                              1024: {
                                slidesPerView: 3,
                                spaceBetween: 18,
                              },
                              1025: {
                                slidesPerView: 4,
                                spaceBetween: 18,
                              },
                              1365: {
                                slidesPerView: 5,
                                spaceBetween: 18,
                              },
                            }}
                          >
                            {selectedSubCollections.map((subCol) => (
                              <SwiperSlide
                                key={subCol.id}
                                onClick={() => {
                                  setCheckedCollectionIds([subCol.id]);
                                  setSelectedHeroCollection(subCol);
                                }}
                                className="cursor-pointer group"
                              >
                                <div className="relative overflow-hidden bg-white rounded-sm shadow-sm">
                                  <img
                                    src={
                                      subCol.image?.url ||
                                      '/assets/Images/placeholder.png'
                                    }
                                    alt={subCol.title}
                                    className="w-full h-[180px] lg:h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <h4 className="mt-3 text-center uppercase text-xs lg:text-sm font-medium tracking-wider text-black">
                                  {subCol.title}
                                </h4>
                              </SwiperSlide>
                            ))}
                          </Swiper>

                          <div className="swiper-button-next-sub absolute right-[35px] cursor-pointer uppercase items-center bg-white z-20 top-[43%] translate-y-[-50%] px-8 py-10 justify-center text-white max-[1024px]:w-[33px] flex">
                            <img
                              src={nextitem}
                              className="size-6 rotate-270"
                              alt=""
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <div ref={topRef} className="lg:scroll-mt-[92px] scroll-mt-[60px]"></div>
      <section className="px-[9.896vw]">
        <div className="flex flex-col gap-[2.99vw] md:flex-row pt-10">
          <SidebarFilter
            collections={collections}
            checkedCollectionIds={checkedCollectionIds}
            setCheckedCollectionIds={setCheckedCollectionIds}
            selectedSwiperCollectionId={selectedSwiperCollectionId}
            selectedSubCollections={selectedSubCollections}
            selectedHeroCollection={selectedHeroCollection}
            shopAllChecked={shopAllChecked}
            setShopAllChecked={setShopAllChecked}
            registry={registry}
            checkedStyles={checkedStyles}
            onStyleCheckbox={handleStyleCheckbox}
          />
          <div className="flex flex-col lg:w-[75.52vw] xl:w-[75.52vw] 2xl:w-[75.52vw]">
            {/* Sort Filter */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-4 ml-auto">
                  <span className="text-sm font-semibold">SORT BY:</span>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-sm focus:outline-none"
                    >
                      <span className="pr-3 uppercase">
                        {priceSort === '' && dateSort === '' && 'Default'}
                        {priceSort === 'low-to-high' && 'Price: Low to High'}
                        {priceSort === 'high-to-low' && 'Price: High to Low'}
                        {dateSort === 'newest' && 'Date: Newest First'}
                        {dateSort === 'oldest' && 'Date: Oldest First'}
                      </span>
                      <img
                        src={arrowDown}
                        alt="dropdown"
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-100 min-w-[200px] max-[1024px]:min-w-unset">
                        <button
                          onClick={() => {
                            setPriceSort('');
                            setDateSort('');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            priceSort === '' && dateSort === ''
                              ? 'bg-gray-100'
                              : ''
                          }`}
                        >
                          Default
                        </button>
                        <button
                          onClick={() => {
                            setPriceSort('low-to-high');
                            setDateSort('');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            priceSort === 'low-to-high' ? 'bg-gray-100' : ''
                          }`}
                        >
                          Price: Low to High
                        </button>
                        <button
                          onClick={() => {
                            setPriceSort('high-to-low');
                            setDateSort('');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            priceSort === 'high-to-low' ? 'bg-gray-100' : ''
                          }`}
                        >
                          Price: High to Low
                        </button>
                        <button
                          onClick={() => {
                            setPriceSort('');
                            setDateSort('newest');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            dateSort === 'newest' ? 'bg-gray-100' : ''
                          }`}
                        >
                          Date: Newest First
                        </button>
                        <button
                          onClick={() => {
                            setPriceSort('');
                            setDateSort('oldest');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            dateSort === 'oldest' ? 'bg-gray-100' : ''
                          }`}
                        >
                          Date: Oldest First
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div
              className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[2.60vw] gap-y-[2.2vw] mt-10 "
              ref={productGridRef}
            >
              {(() => {
                if (sortedProducts.length === 0) {
                  return (
                    <div className="col-span-3 text-center text-gray-400">
                      No products found. Please check your collection filters.
                    </div>
                  );
                }

                const productNodes = sortedProducts
                  .slice(0, productsToShow)
                  .map((product) => {
                    const firstImage =
                      product.image || '/assets/Images/placeholder.jpg';
                    return (
                      <RegistryProduct
                        key={product.id}
                        id={product.id}
                        image={firstImage}
                        productName={product.title}
                        price={product.price}
                        description={product.description}
                        productHandle={product.handle}
                        onAddToRegistry={(quantity, isGroupGift) =>
                          handleAddtoRegistry(product, quantity, isGroupGift)
                        }
                        isLoggedIn={user && user.user && user.user.id}
                        isAddingToRegistry={addingProductId === product.id}
                      />
                    );
                  });

                return productNodes;
              })()}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center mt-[150px]">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-[18px] font-semibold mb-10">
              LOADING {Math.min(productsToShow, sortedProducts.length)} of{' '}
              {sortedProducts.length}
            </p>

            {sortedProducts.length > 12 &&
              productsToShow < sortedProducts.length && (
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

            {/* {productsToShow <= 12 && ( */}
            {/* <button
                className="border-b mx-auto cursor-pointer uppercase font-bold bg-white text-black mt-0 text-[18px] leading-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] tracking-[0.075vw] hover:bg-gray-100 max-[767px]:text-[14px] max-[767px]:leading-[14px] max-[767px]:mt-[10px] max-[767px]:mb-[50px]"
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
              </button> */}
            <BackToTop topRef={topRef} className={'mb-0'} />
          </div>
        </div>
      </section>

      {selectedSwiperCollectionId ? (
        <></>
      ) : (
        // <section className="bg-[#FFFFFF] pt-16 mt-[7.813vw]">
        //   <Heading
        //     text="ready-made registriesss"
        //     classes={
        //       'prata text-[2.5vw] leading-[3.542vw] mb-1 font-normal text-center max-[1024px]:m-0'
        //     }
        //     image={lineImghead}
        //     imageClasses={'max-[1024px]:max-w-[330px] w-[20.521vw] mb-[2.188vw]'}
        //   />

        //   <p className="text-center text-[1.354vw] leading-[1.979vw] w-[50vw] max-w-full mx-auto mb-[1.667vw] font-normal text-gray-500">From real couples to curated style edits, our ready-made registries are personal, shoppable, and designed to make choosing easy.</p>

        //   {/* Always render CustomTab - let it handle the data validation internally */}
        //   <CustomTab
        //     tabsData={[
        //       {
        //         label: 'REAL REGISTRIES',
        //         value: 1,
        //         route: 'realregistries',
        //       },
        //       {
        //         label: 'THEMED REGISTRIES',
        //         value: 2,
        //         route: 'themedregistries',
        //       }
        //     ]}
        //     featuredRegistryData={readyMadeRegistries}
        //     user={user}
        //   />
        //   <div className="text-center">
        //     <Link to="/ready-made-registries">
        //       <ButtonComponent
        //         text="EXPLORE READY-MADE REGISTRIES"
        //         className="button-cs text-[18px] text-black border-3 w-[380px] border-black py-4 lg:py-[30px] bg-transparent rounded-none mt-[2.083vw]"
        //       />
        //     </Link>
        //   </div>
        // </section>
        <></>
      )}

      <BestsellersSection
        bestsellerProducts={bestsellerProducts}
        title={
          selectedSwiperCollectionId
            ? `bestsellers in ${
                collections
                  .find((col) => col.id === selectedSwiperCollectionId)
                  ?.title?.toLowerCase() || 'collection'
              }`
            : 'bestsellers'
        }
        buttonText="browse bestsellers"
        sectionClassName=" my-12 lg:my-[240px] pb-[2.552vw]"
        headingClasses="prata text-[2.292vw] leading-[1.875vw] font-normal text-center max-[1024px]:m-0"
        imageClasses={
          selectedSwiperCollectionId
            ? 'w-[33.281vw] max-[1024px]:max-w-[286px]'
            : 'w-[14.896vw] max-[1024px]:max-w-[286px]'
        }
        buttonClassName="button-cs text-[18px] w-[360px] text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
      />

      {/* Other Collections Carousel - Only shows when a parent collection is selected */}
      {selectedSwiperCollectionId && (
        <section className="mb-[7.813vw]">
          <Heading
            text="explore more categories"
            classes={
              'prata text-[2.292vw] leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
            }
            image={brandline}
            imageClasses="w-[33.021vw] max-w-[100%]"
          />
          <div className="relative items-start mt-[4.01vw] mb-10 max-[1024px]:my-10">
            <div className="flex flex-row items-center justify-center">
              <div className="z-10 mb-8 swiper-button-prev-other absolute left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase max-[1601px]:w-[90px] items-center bg-white top-[38%] px-8 py-10 justify-center max-[1024px]:w-[33px] flex">
                <img src={nextitem} alt="" className="rotate-90 size-6" />
              </div>

              <Swiper
                spaceBetween={15}
                slidesPerView={4} // Shows 4 full slides
                centeredSlides={false}
                loop={true}
                modules={[Navigation]}
                navigation={{
                  nextEl: '.swiper-button-next-other',
                  prevEl: '.swiper-button-prev-other',
                }}
                className=""
                breakpoints={{
                  345: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                    centeredSlides: true,
                  },
                  475: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                    centeredSlides: true,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    centeredSlides: true,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                    centeredSlides: false,
                  },
                  1366: {
                    slidesPerView: 4,
                    spaceBetween: 39,
                    centeredSlides: false,
                  },
                  1600: {
                    slidesPerView: 4,
                    spaceBetween: 39,
                    centeredSlides: false,
                  },
                }}
              >
                {/* Dynamic slides from Shopify collections - excluding current selected collection */}
                {collections
                  .filter(
                    (col) =>
                      isParentForSlides(col) &&
                      col.id !== selectedSwiperCollectionId, // Exclude current parent collection
                  )
                  .map((col) => (
                    <SwiperSlide
                      key={col.id}
                      onClick={() => {
                        // Get sub-collections from the Collection type metafield references
                        let subCollections = [];
                        let subCollectionGids = [];

                        // First, try to get from the new Collection type metafield (references)
                        if (col.subCollectionMetafield?.references?.edges) {
                          subCollections =
                            col.subCollectionMetafield.references.edges.map(
                              (edge) => edge.node,
                            );
                          subCollectionGids = subCollections.map(
                            (sub) => sub.id,
                          );
                        } else if (col.subMetafield?.value) {
                          // Fallback to old JSON string format
                          try {
                            subCollectionGids = JSON.parse(
                              col.subMetafield.value,
                            );
                            // Find sub-collections from collections array
                            subCollections = collections.filter((c) =>
                              subCollectionGids.includes(c.id),
                            );
                          } catch (error) {
                            // Handle any errors in parsing subMetafield
                          }
                        }

                        // Parent selected: show its sub-collections in sidebar but do not pre-select any Product Type
                        setCheckedCollectionIds([]);
                        setSelectedSubCollections(subCollections);
                        setSelectedSwiperCollectionId(col.id);
                        setShopAllChecked(true);
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      <img
                        src={col.image?.url || '/assets/Images/placeholder.png'}
                        alt={col.title}
                        className="w-full h-[440px] object-cover"
                      />
                      <h3 className="mt-[1.927vw] text-center uppercase text-[1.25vw] leading-[1.667vw] text-sm font-medium tracking-wider">
                        {col.title}
                      </h3>
                    </SwiperSlide>
                  ))}
              </Swiper>
              <div className="swiper-button-next-other absolute right-[1%] max-[1601px]:-right-[0%] cursor-pointer uppercase max-[1601px]:w-[90px] items-center bg-white z-10 top-[38%] px-8 py-10 justify-center text-white max-[1024px]:w-[33px] flex">
                <img src={nextitem} className="size-6 rotate-270" alt="" />
              </div>
            </div>
          </div>
        </section>
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* <WeThinkYoullLove recommendedProducts={recommendedProducts} /> */}
      <Footer />
    </>
  );
}

const PRODUCT_QUERY = `#graphql
  query {
    products(first: 10) {
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
        subCollectionMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
          references(first: 20) {
            edges {
              node {
                ... on Collection {
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
                }
              }
            }
          }
        }
        readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
          id
          value
        }
        giftCardMetafield: metafield(namespace: "custom", key: "giftcard") {
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
              styleMetafield: metafield(namespace: "custom", key: "style") {
                id
                value
              }
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

const READY_MADE_REGISTRIES_QUERY = `#graphql
  query getRealRegistries {
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
        subCollectionMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
        }
      }
    }
  }`;

const BESTSELLER_PRODUCTS_QUERY = `#graphql
  query getBestsellerProducts {
    products(first: 20, query: "tag:bestseller") {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
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
  }`;

const NEW_ARRIVALS_PRODUCTS_QUERY = `#graphql
  query getNewArrivalsProducts {
    products(first: 250, query: "tag:new-arrival", sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          createdAt
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
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
  }`;

const SUB_COLLECTION_QUERY = `#graphql
  query getDashboardSubCollection($id: ID!) {
    collection(id: $id) {
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
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            createdAt
            styleMetafield: metafield(namespace: "custom", key: "style") {
              id
              value
            }
            images(first: 1) {
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
  }`;

// Export metadata for Remix
export const meta = () => {
  return [
    {title: 'Add Gifts to Registry'},
    {name: 'description', content: 'Add gifts to your registry'},
  ];
};

// Export handle for Remix
export const handle = {
  hydrate: true,
};
