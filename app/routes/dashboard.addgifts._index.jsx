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
import { RECOMMENDED_PRODUCTS_QUERY } from '~/graphql/product-queries';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import AlertPortal from '~/components/AlertPortal';

export async function loader({request, context}) {
  const {products} = await loadCriticalData({context});
  const {collections} = await loadCollectionData({context});
  const user = await requireAuth(context);
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );
  const userData = await context?.ClientGet(`users/${user?.user?.id}`, context);

  // Fetch ready-made registries using the same pattern as home index
  let featuredRegistryData = null;
  try {
    console.log('Starting to fetch ready-made registries...');
    const {collections: readyMadeCollections} = await context.storefront.query(
      READY_MADE_REGISTRIES_QUERY,
    );

    console.log('All collections from query:', readyMadeCollections?.nodes);
    console.log('Collections count:', readyMadeCollections?.nodes?.length || 0);

    // Log metafield values for debugging
    if (readyMadeCollections?.nodes) {
      readyMadeCollections.nodes.forEach((collection, index) => {
        console.log(`Collection ${index + 1} (${collection.title}):`, {
          readyMadeMetafield: collection.readyMadeMetafield?.value,
          parentCollectionMetafield:
            collection.parentCollectionMetafield?.value,
          subCollectionMetafield: collection.subCollectionMetafield?.value,
        });
      });
    }

    // Filter collections that have both readyMadeMetafield AND parentCollectionMetafield set to true
    const filteredReadyMadeCollections =
      readyMadeCollections?.nodes?.filter(
        (collection) =>
          collection.readyMadeMetafield?.value === 'true' &&
          collection.parentCollectionMetafield?.value === 'true',
      ) || [];

    console.log(
      'Filtered ready-made parent collections:',
      filteredReadyMadeCollections,
    );
    console.log(
      'Filtered collections count:',
      filteredReadyMadeCollections.length,
    );

    // Categorize collections by type
    const realRegistries = filteredReadyMadeCollections.filter((collection) => {
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
    });

    const themedRegistries = filteredReadyMadeCollections.filter(
      (collection) => {
        const title = collection.title?.toLowerCase() || '';
        const description = collection.description?.toLowerCase() || '';

        return title.includes('themed') || description.includes('themed');
      },
    );

    console.log('Real registries:', realRegistries);
    console.log('Themed registries:', themedRegistries);

    // Select the best collection for each type
    let realRegistriesCollection =
      realRegistries.find((col) => col.title?.toLowerCase().includes('real')) ||
      realRegistries[0];

    let themedRegistriesCollection =
      themedRegistries.find((col) =>
        col.title?.toLowerCase().includes('themed'),
      ) || themedRegistries[0];

    console.log('Selected collections:', {
      real: realRegistriesCollection?.title,
      themed: themedRegistriesCollection?.title,
    });

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

        // Fetch each sub-collection
        for (const subCollectionId of subCollectionIds) {
          try {
            const subCollectionData = await context.storefront.query(
              SUB_COLLECTION_QUERY,
              {
                variables: {id: subCollectionId},
              },
            );

            if (subCollectionData?.collection) {
              subCollections.push(subCollectionData.collection);
            }
          } catch (error) {
            console.error(
              'Error fetching sub-collection:',
              subCollectionId,
              error,
            );
          }
        }
      }

      return subCollections;
    };

    // Fetch sub-collections for each type
    const realSubCollections = await fetchSubCollections(
      realRegistriesCollection,
    );
    const themedSubCollections = await fetchSubCollections(
      themedRegistriesCollection,
    );

    console.log('Fetched sub-collections:', {
      real: realSubCollections.length,
      themed: themedSubCollections.length,
    });

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
      console.log(
        'Structured featuredRegistryData with registry types:',
        featuredRegistryData,
      );
    }

    console.log(
      'Final featuredRegistryData before fallback check:',
      featuredRegistryData,
    );
    console.log(
      'Final featuredRegistryData type:',
      typeof featuredRegistryData,
    );
    console.log(
      'Final featuredRegistryData has subCollections:',
      !!featuredRegistryData?.subCollections,
    );

    // If no ready-made registries found, try to use regular collections as fallback
    if (
      !featuredRegistryData ||
      (!featuredRegistryData.real?.subCollections?.length &&
        !featuredRegistryData.themed?.subCollections?.length)
    ) {
      console.log(
        'No ready-made registries found, trying fallback with regular collections',
      );

      // Use the first few collections as a fallback
      const fallbackCollections = collections?.slice(0, 3) || [];
      if (fallbackCollections.length > 0) {
        console.log('Using fallback collections:', fallbackCollections);
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
    console.log('Trying fallback with regular collections due to error');
    const fallbackCollections = collections?.slice(0, 3) || [];
    if (fallbackCollections.length > 0) {
      console.log(
        'Using fallback collections after error:',
        fallbackCollections,
      );
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

  // Extract products only from parent collections (parentMetafield.value === 'true' and readyMadeMetafield.value !== 'true')
  let allProducts = [];
  const productMap = new Map(); // Use Map to track unique products by ID
  
  try {
    // First, find all parent collections
    const parentCollections = collections.filter(
      (col) =>
        col.parentMetafield?.value === 'true' &&
        col.readyMadeMetafield?.value !== 'true',
    );

    // For each parent collection, get products from its sub-collections
    parentCollections.forEach((parentCollection) => {
      // Get sub-collection GIDs from the parent's subCollectionMetafield (Collection type) or subMetafield (JSON string)
      let subCollectionGids = [];
      let subCollections = [];
      
      // First, try to get from the new Collection type metafield (references)
      if (parentCollection.subCollectionMetafield?.references?.edges) {
        subCollections = parentCollection.subCollectionMetafield.references.edges.map(
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
        }
      }

      // Extract products from sub-collections
      subCollections.forEach((subCollectionRef) => {
        // Find the full collection data from the main collections array
        const subCollection = collections.find(
          (col) => col.id === subCollectionRef.id,
        ) || subCollectionRef; // Fallback to reference if not found
        
        if (subCollection.products?.edges) {
          subCollection.products.edges.forEach((edge) => {
            const product = edge.node;
            
            // Only add product if it hasn't been added before (deduplication)
            if (!productMap.has(product.id)) {
              const productData = {
                id: product.id,
                title: product.title,
                handle: product.handle,
                description: product.description,
                image: product.images?.edges?.[0]?.node?.url || null,
                price: product.variants?.edges?.[0]?.node?.priceV2?.amount || '0',
                currency:
                  product.variants?.edges?.[0]?.node?.priceV2?.currencyCode ||
                  'USD',
                availableForSale:
                  product.variants?.edges?.[0]?.node?.availableForSale || false,
                createdAt: product.createdAt,
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
                  existingProduct.collectionIds = [existingProduct.collectionId];
                }
                if (!existingProduct.collectionIds.includes(subCollection.id)) {
                  existingProduct.collectionIds.push(subCollection.id);
                }
              }
            }
          });
        }
      });
    });
  } catch (error) {
    // Handle any errors in extracting products from collections
    console.error('Error extracting products from collections:', error);
  }

  // Log deduplication results
  console.log('Product deduplication results:', {
    totalProductsBeforeDedup: productMap.size,
    totalProductsAfterDedup: allProducts.length,
    uniqueProductIds: Array.from(productMap.keys()),
    duplicateProducts: allProducts.filter((product, index, self) => 
      self.findIndex(p => p.id === product.id) !== index
    ).length
  });

  // Fetch bestseller products
  let bestsellerProducts = [];
  try {
    const {products: bestsellerData} = await context.storefront.query(BESTSELLER_PRODUCTS_QUERY);
    bestsellerProducts = bestsellerData?.edges?.map(edge => ({
      node: {
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description,
        images: edge.node.images,
        priceRange: edge.node.priceRange,
        variants: edge.node.variants,
      }
    })) || [];
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    bestsellerProducts = [];
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

  console.log('Loader returning data:', {
    productsLength: allProducts?.length || 0,
    collectionsLength: collections?.length || 0,
    user: !!user,
    registry: !!registry,
    userData: !!userData,
    readyMadeRegistriesStructure: {
      hasData: !!featuredRegistryData,
      hasSubCollections: !!featuredRegistryData?.subCollections,
      subCollectionsCount: featuredRegistryData?.subCollections?.length || 0,
      parentCollection: featuredRegistryData?.parentCollection?.title || 'None',
    },
  });

  console.log('About to return featuredRegistryData:', featuredRegistryData);
  console.log(
    'About to return featuredRegistryData type:',
    typeof featuredRegistryData,
  );
  console.log(
    'About to return featuredRegistryData === null:',
    featuredRegistryData === null,
  );
  console.log(
    'About to return readyMadeRegistries in json:',
    featuredRegistryData,
  );
  console.log(
    'About to return featuredRegistryData.subCollections:',
    featuredRegistryData?.subCollections,
  );
  console.log(
    'About to return featuredRegistryData.parentCollection:',
    featuredRegistryData?.parentCollection,
  );

  const returnData = {
    products: allProducts,
    collections,
    user,
    registry,
    userData,
    readyMadeRegistries: featuredRegistryData,
    bestsellerProducts,
    recommendedProducts,
  };

  console.log('Final return data:', returnData);
  console.log(
    'Final return data readyMadeRegistries:',
    returnData.readyMadeRegistries,
  );

  return json(returnData);
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

function SidebarFilter({
  collections,
  checkedCollectionIds,
  setCheckedCollectionIds,
  selectedSwiperCollectionId,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    styles: true,
  });

  // Get parent collections for the swiper and Product Categories
  const parentCollection = collections.filter(
    (col) =>
      col.parentMetafield?.value === 'true' &&
      col.readyMadeMetafield?.value !== 'true',
  );

  // Get sub-collections for Shop by Style (these are the ones that actually contain products)
  const subCollection = collections.filter(
    (col) =>
      col.parentMetafield?.value === 'false' &&
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
    <div className="w-[400px] h-fit">
      <div className=" bg-[#FAF9F6] p-6">
        <div className="mb-6">
          <h2
            className="text-sm font-bold uppercase mb-[2.031vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
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
                <li key={col.id}>
                  <label className="uppercase">
                    <input
                      type="checkbox"
                      className="mr-2"
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

        <div className="mb-6">
          <h2
            className="text-sm font-bold uppercase mb-[2.031vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
            onClick={() => toggleSection('brands')}
          >
            Our Brands
            <span className="text-lg relative -top-[3px]">
              {openSections.brands ? (
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
          {openSections.brands && (
            <p className="text-sm text-gray-500 italic">No data</p>
          )}
        </div>

        <div>
          <h2
            className="text-sm font-bold uppercase mb-[2.031vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
            onClick={() => toggleSection('styles')}
          >
            Shop by Style
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
              {subCollection.map((col) => (
                <li key={col.id}>
                  <label className="uppercase">
                    <input
                      type="checkbox"
                      className="mr-2"
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
      {/* Show PreviewRegistry only after a parent collection is selected */}
      {selectedSwiperCollectionId && (
        <div className="mt-6">
          <PreviewRegistry useAbsolutePosition={false} />
        </div>
      )}
    </div>
  );
}

export default function AddGifts() {
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [dateSort, setDateSort] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loaderData = useLoaderData();
  const { products, collections, user, registry, userData, readyMadeRegistries, bestsellerProducts, recommendedProducts } = loaderData;
  console.log('Raw loaderData received:', loaderData);
  console.log('Raw loaderData keys:', Object.keys(loaderData || {}));

  // Debug logging for ready-made registries
  console.log('Dashboard addgifts received loaderData:', loaderData);
  console.log(
    'Dashboard addgifts received readyMadeRegistries:',
    readyMadeRegistries,
  );

  if (
    readyMadeRegistries &&
    readyMadeRegistries.subCollections &&
    readyMadeRegistries.subCollections.length > 0
  ) {
    console.log(
      'First ready-made registry sample:',
      readyMadeRegistries.subCollections[0],
    );
  }

  // Show loading state if data is not yet available
  if (!loaderData || !products || !collections) {
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
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);

  // Filter products based on selected collections
  const filteredProducts =
    checkedCollectionIds.length > 0
      ? products.filter((product) => {
          // Check if the product's collection is directly selected
          if (checkedCollectionIds.includes(product.collectionId)) {
            return true;
          }

          // Check if the product's parent collection is selected
          if (checkedCollectionIds.includes(product.parentCollectionId)) {
            return true;
          }

          // Check if the product exists in any of the selected collections (for products in multiple collections)
          if (product.collectionIds && product.collectionIds.some(id => checkedCollectionIds.includes(id))) {
            return true;
          }

          return false;
        })
      : products;

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

  const handleAddtoRegistry = (product) => {
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
        quantity: 1,
      };

      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );

      // Show success alert
      setAlertMessage(`${product.title} has been added to your registry!`);
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

  const parentCollection = collections.filter(
    (col) =>
      col.parentMetafield?.value === 'true' &&
      col.readyMadeMetafield?.value !== 'true',
  );

  return (
    <>
    {selectedSwiperCollectionId ? (
      <></>  
    ) : (
      <div className="pt-[3.75vw] relative px-4">
        <h2 className="mt-0 ivyora lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] text-[24px] prata text-center lg:leading-[3.333vw] xl:leading-[3.333vw] 2xl:leading-[3.333vw] font-normal mb-1">
          <span className="prata">
            gifts
          </span>
        </h2>
        <img
          src={headingBottomCurve}
          alt="Couple"
          className="w-[9.375vw] h-[6px] mt-2 mx-auto"
        />
        <p className="max-w-xl mx-auto text-center text-[1.25vw] leading-[1.667vw] mt-[1.771vw] mb-[4.583vw] font-normal leading-relaxed">
          Browse by category, filter by price, or get inspired with our curated edits. Add, update, or switch things up whenever you like.
        </p>
      </div>
      )}

      <section className="">
        <div className=" relative items-start mb-10 max-[1024px]:my-10">
          <div className="flex flex-row items-center justify-center">
            {!selectedSwiperCollectionId && (
              <>
                <div className="z-10 mb-8 swiper-button-prev-prod absolute left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase  max-[1601px]:w-[90px] items-center bg-white top-[38%] px-8 py-10 justify-center max-[1024px]:w-[33px] max-[1024px]:h-[33px] max-[1024px]:p-0 flex">
                  <img src={nextitem} alt="" className="rotate-90 size-6 max-[1024px]:size-2" />
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
                  {/* Dynamic slides from Shopify collections */}
                  {collections
                    .filter(
                      (col) =>
                        col.parentMetafield?.value === 'true' &&
                        col.readyMadeMetafield?.value !== 'true',
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
                            subCollections = col.subCollectionMetafield.references.edges.map(
                              (edge) => edge.node,
                            );
                            subCollectionGids = subCollections.map((sub) => sub.id);
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

                          // Set the checked collection IDs to all sub-collections of this parent
                          setCheckedCollectionIds(subCollectionGids);
                          setSelectedSubCollections(subCollections);
                          setSelectedSwiperCollectionId(col.id);
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
                </Swiper>
                <div className="swiper-button-next-prod absolute right-[1%] max-[1601px]:-right-[0%] cursor-pointer uppercase max-[1601px]:w-[90px] items-center bg-white z-10 top-[38%] px-8 py-10  justify-center text-white max-[1024px]:w-[33px] max-[1024px]:h-[33px] max-[1024px]:p-0 flex">
                  <img src={nextitem} className="size-6 rotate-270 max-[1024px]:size-2" alt="" />
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
                
                {/* Sub-collections carousel */}
                {selectedSubCollections && selectedSubCollections.length > 0 && (
                  <div className="flex items-center bottom-0 left-0 right-0 bg-[#F5F2ED] h-[27.083vw] pl-[7.396vw] relative">
                    <div className="flex items-center gap-[8.698vw] w-full">
                      <h3 className="text-[2.5vw] leading-[1.875vw] text-center font-normal lowercase prata w-[276px]">
                        {collections.find(
                          (col) => col.id === selectedSwiperCollectionId,
                        )?.title?.toLowerCase() || 'collection'}
                        <img
                          src={giftBottomCurve}
                          alt="Couple"
                          className="w-[14.375vw] h-[6px] mt-[1.198vw] mx-auto"
                        />
                      </h3>
                      
                      <div className="relative">
                        <div className="z-10 mb-8 swiper-button-prev-sub absolute left-[35px] cursor-pointer text-white uppercase items-center bg-white top-[43%] translate-y-[-50%] px-8 py-10 justify-center max-[1024px]:w-[33px]">
                          <img src={nextitem} alt="" className="rotate-90 size-6" />
                        </div>

                        <Swiper
                          spaceBetween={18}
                          slidesPerView={5} // Shows 3 full + a portion of 4th
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
                              }}
                              className="cursor-pointer group min-w-[13.542vw] max-w-[13.542vw]"
                            >
                              <div className="relative overflow-hidden bg-white rounded-sm shadow-sm">
                                <img
                                  src={
                                    subCol.image?.url || '/assets/Images/placeholder.png'
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

                        <div className="swiper-button-next-sub absolute right-[50px] cursor-pointer uppercase items-center bg-white z-10 top-[43%] translate-y-[-50%] px-8 py-10 justify-center text-white max-[1024px]:w-[33px]">
                          <img src={nextitem} className="size-6 rotate-270" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-10">
          <SidebarFilter
            collections={collections}
            checkedCollectionIds={checkedCollectionIds}
            setCheckedCollectionIds={setCheckedCollectionIds}
            selectedSwiperCollectionId={selectedSwiperCollectionId}
          />
          <div className="flex flex-col">
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
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[200px] max-[1024px]:min-w-unset">
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 mt-10"
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
                        onAddToRegistry={() => handleAddtoRegistry(product)}
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

      {selectedSwiperCollectionId ? (
        <></>
      ):(
        <section className="bg-[#FFFFFF] pt-16 mt-[7.813vw]">
          <Heading
            text="ready-made registries"
            classes={
              'prata text-[2.5vw] leading-[3.542vw] mb-1 font-normal text-center max-[1024px]:m-0'
            }
            image={lineImghead}
            imageClasses={'max-[1024px]:max-w-[330px] w-[20.521vw] mb-[2.188vw]'}
          />

          <p className="text-center text-[1.354vw] leading-[1.979vw] w-[50vw] max-w-full mx-auto mb-[1.667vw] font-normal text-gray-500">From real couples to curated style edits, our ready-made registries are personal, shoppable, and designed to make choosing easy.</p>

          {/* Always render CustomTab - let it handle the data validation internally */}
          <CustomTab
            tabsData={[
              {
                label: 'REAL REGISTRIES',
                value: 1,
                route: 'realregistries',
              },
              {
                label: 'THEMED REGISTRIES',
                value: 2,
                route: 'themedregistries',
              }
            ]}
            featuredRegistryData={readyMadeRegistries}
            user={user}
          />
          <div className="text-center">
            <Link to="/ready-made-registries">
              <ButtonComponent
                text="EXPLORE READY-MADE REGISTRIES"
                className="button-cs text-[18px] text-black border-3 w-[380px] border-black py-4 lg:py-[30px] bg-transparent rounded-none mt-[2.083vw]"
              />
            </Link>
          </div>
        </section>
      )}
      
      <section className="pt-[9.01vw]  my-12 lg:my-[240px] container pb-[12.552vw]">
        <Heading
          text={
            selectedSwiperCollectionId
              ? `bestsellers in ${collections.find((col) => col.id === selectedSwiperCollectionId)?.title?.toLowerCase() || 'collection'}`
              : 'bestsellers'
          }
          classes={
            'prata text-[2.292vw] leading-[1.875vw] font-normal text-center  max-[1024px]:m-0'
          }
          image={brandline}
          imageClasses={
            selectedSwiperCollectionId
              ? 'w-[33.281vw] max-[1024px]:max-w-[286px]'
              : 'w-[14.896vw] max-[1024px]:max-w-[286px]'
          }
        />
        <ProductSlider products={bestsellerProducts} />
        <div className="text-center">
          <ButtonComponent
            text="browse bestsellers"
            className="button-cs text-[18px] w-[360px] text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
          />
        </div>
      </section>

      {selectedSwiperCollectionId ? (
        <section className="bg-[#FAF9F6] py-[3.906vw] pl-[4.688vw] mb-[11.25vw] flex items-center justify-center gap-[5.521vw]">
          <Heading
            text={<>we think <span className='ivyora'>you'll love</span></>}
            classes={
              'prata text-[2.083vw] leading-[1.875vw] font-normal text-center'
            }
            image={brandline}
            imageClasses={'max-[1024px]:max-w-[330px] w-[14.271vw] h-[6px]'}
          />

          <div className=" relative items-start w-[76vw]">
            <div className="mx-auto">
              <div className="z-10 mb-8 swiper-button-prev-prod absolute left-[35px] cursor-pointer text-white uppercase items-center bg-white top-[43%] translate-y-[-50%] px-8 py-10 justify-center max-[1024px]:w-[33px] swiper-button-lock swiper-button-disabled">
                <img src={nextitem} alt="" className="rotate-90 size-6" />
              </div>

              <Swiper
                spaceBetween={15}
                slidesPerView={3.5}
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
                    slidesPerView: 1.5,
                  },
                  475: {
                    spaceBetween: 15,
                    slidesPerView: 1.5,
                  },
                  768: {
                    spaceBetween: 20,
                    slidesPerView: 2.5,
                  },
                  1024: {
                    spaceBetween: 30,
                    slidesPerView: 3.5,
                  },
                  1366: {
                    spaceBetween: 39,
                    slidesPerView: 3.5,
                  },
                  1600: {
                    spaceBetween: 39,
                    slidesPerView: 3.5,
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
                      <SwiperSlide key={productNode.id} className='max-w-[18.75vw]'>
                        <Link to={`/dashboard/addgifts/${productNode.handle}`} className="cursor-pointer">
                          <img 
                            src={firstImage?.url || '/assets/Images/placeholder.png'} 
                            alt={productNode.title || 'Product'} 
                            className="w-full h-[18.75vw] hover:opacity-80 transition-opacity" 
                          />
                          <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-[22px] text-sm font-medium tracking-wider hover:text-gray-600 transition-colors">
                            {productNode.title}
                          </h3>
                          <p className="lg:text-[24px] text-sm py-2">{formatShopifyPrice(price)}</p>
                        </Link>
                      </SwiperSlide>
                    );
                  })
                ) : (
                  // Fallback to static slides if no recommended products
                  <>
                    <SwiperSlide className='w-[18.75vw]'>
                      <img src={youll1} alt="New Arrival" className="w-full h-[18.75vw]" />
                      <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-[22px] text-sm font-medium tracking-wider">
                        ARKE GLASS BOTTLE FOR CARBONATOR PRO
                      </h3>
                      <p className="lg:text-[24px] text-sm py-2">$95.00</p>
                    </SwiperSlide>
                    <SwiperSlide className='w-[18.75vw]'>
                      <img src={youll2} alt="Tableware" className="w-full h-[18.75vw]" />
                      <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-[22px] text-sm font-medium tracking-wider">
                        SMEG TOASTER, 2 SLICE
                      </h3>
                      <p className="lg:text-[24px] text-sm py-2">$95.00</p>
                    </SwiperSlide>
                    <SwiperSlide className='w-[18.75vw]'>
                      <img src={youll3} alt="Staub Cast Iron Q4" className="w-full h-[18.75vw]" />
                      <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-[22px] text-sm font-medium tracking-wider">
                        THE BARISTA TOUCH ESPRESSO MAKER
                      </h3>
                      <p className="lg:text-[24px] text-sm py-2">$95.00</p>
                    </SwiperSlide>
                    <SwiperSlide className='w-[18.75vw]'>
                      <img src={youll3} alt="Staub Cast Iron Q4" className="w-full h-[18.75vw]" />
                      <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-[22px] text-sm font-medium tracking-wider">
                        THE BARISTA TOUCH ESPRESSO MAKER
                      </h3>
                      <p className="lg:text-[24px] text-sm py-2">$95.00</p>
                    </SwiperSlide>
                  </>
                )}
              </Swiper>
              <div className="swiper-button-next-prod absolute right-[50px] cursor-pointer uppercase items-center bg-white z-10 top-[43%] translate-y-[-50%] px-8 py-10 justify-center text-white max-[1024px]:w-[33px] swiper-button-lock swiper-button-disabled">
                <img src={nextitem} className="size-6 rotate-270" alt="" />
              </div>
            </div>
          </div>
        </section>
        ):(
        <></>
      )}

      {/* Other Collections Carousel - Only shows when a parent collection is selected */}
      {selectedSwiperCollectionId && (
        <section className="mb-[7.813vw]">
          <Heading
            text='explore more categories'
            classes={
              'prata text-[2.292vw] leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
            }
            image={brandline}
            imageClasses='w-[33.021vw] max-w-[100%]'
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
                      col.parentMetafield?.value === 'true' &&
                      col.readyMadeMetafield?.value !== 'true' &&
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
                          subCollections = col.subCollectionMetafield.references.edges.map(
                            (edge) => edge.node,
                          );
                          subCollectionGids = subCollections.map((sub) => sub.id);
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

                        // Set the checked collection IDs to all sub-collections of this parent
                        setCheckedCollectionIds(subCollectionGids);
                        setSelectedSubCollections(subCollections);
                        setSelectedSwiperCollectionId(col.id);
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      <img
                        src={
                          col.image?.url || '/assets/Images/placeholder.png'
                        }
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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

const READY_MADE_REGISTRIES_QUERY = `#graphql
  query getRealRegistries {
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
