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
import CustomTab from '~/components/CustomTab';
import brandline from '/assets/Images/brandline.png';
import ProductSlider from '~/components/ProductSlider';
import {Footer} from '~/components/Footer';
import {Navigation} from 'swiper/modules';
import arrowDown from '/assets/Images/arrowDown.png';

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
    const { collections: readyMadeCollections } = await context.storefront.query(READY_MADE_REGISTRIES_QUERY);
    
    console.log('All collections from query:', readyMadeCollections?.nodes);
    console.log('Collections count:', readyMadeCollections?.nodes?.length || 0);
    
    // Log metafield values for debugging
    if (readyMadeCollections?.nodes) {
      readyMadeCollections.nodes.forEach((collection, index) => {
        console.log(`Collection ${index + 1} (${collection.title}):`, {
          readyMadeMetafield: collection.readyMadeMetafield?.value,
          parentCollectionMetafield: collection.parentCollectionMetafield?.value,
          subCollectionMetafield: collection.subCollectionMetafield?.value
        });
      });
    }
    
    // Filter collections that have both readyMadeMetafield AND parentCollectionMetafield set to true
    const filteredReadyMadeCollections = readyMadeCollections?.nodes?.filter(
      (collection) => 
        collection.readyMadeMetafield?.value === 'true' && 
        collection.parentCollectionMetafield?.value === 'true'
    ) || [];
    
    console.log('Filtered ready-made parent collections:', filteredReadyMadeCollections);
    console.log('Filtered collections count:', filteredReadyMadeCollections.length);

    // Filter for "real" registries (parent collections)
    const realRegistries = filteredReadyMadeCollections.filter((collection) => {
      const title = collection.title?.toLowerCase() || '';
      const description = collection.description?.toLowerCase() || '';
      
      // Exclude specific unwanted collections
      const unwantedTerms = ['kyle', 'erik', 'themed', 'minimalist', 'lorem'];
      const hasUnwantedTerms = unwantedTerms.some(term => 
        title.includes(term) || description.includes(term)
      );
      
      // Include collections with preferred terms
      const preferredTerms = ['real', 'authentic', 'couple', 'wedding'];
      const hasPreferredTerms = preferredTerms.some(term => 
        title.includes(term) || description.includes(term)
      );
      
      return !hasUnwantedTerms && hasPreferredTerms;
    });

    console.log('Real registries after filtering:', realRegistries);
    console.log('Real registries count:', realRegistries.length);

    // Priority-based collection selection
    let realRegistriesCollection = null;
    
    // Priority 1: Collections with "real" in title
    realRegistriesCollection = realRegistries.find(col => 
      col.title?.toLowerCase().includes('real')
    );
    
    if (!realRegistriesCollection) {
      // Priority 2: Collections with "authentic" in title
      realRegistriesCollection = realRegistries.find(col => 
        col.title?.toLowerCase().includes('authentic')
      );
    }
    
    if (!realRegistriesCollection) {
      // Priority 3: Collections with "couple" or "wedding" in title
      realRegistriesCollection = realRegistries.find(col => 
        col.title?.toLowerCase().includes('couple') || 
        col.title?.toLowerCase().includes('wedding')
      );
    }
    
    if (!realRegistriesCollection) {
      // Priority 4: Any collection that is NOT themed/minimalist
      realRegistriesCollection = realRegistries.find(col => {
        const title = col.title?.toLowerCase() || '';
        return !title.includes('themed') && !title.includes('minimalist');
      });
    }
    
    if (!realRegistriesCollection && realRegistries.length > 0) {
      // Fallback: use first available collection
      realRegistriesCollection = realRegistries[0];
    }

    console.log('Selected real registries collection:', realRegistriesCollection);
    console.log('Selection reason:', realRegistriesCollection ? 'Found matching collection' : 'No matching collection found');

    // Initialize as empty array for sub-collections
    let subCollections = [];
    
    if (realRegistriesCollection) {
      console.log('Processing real registries collection:', realRegistriesCollection.title);
      try {
        // Parse sub-collection IDs from the subCollectionMetafield
        const subCollectionMetafield = realRegistriesCollection.subCollectionMetafield;
        
        console.log('Sub-collection metafield:', subCollectionMetafield);
        console.log('Sub-collection metafield value type:', typeof subCollectionMetafield?.value);
        console.log('Sub-collection metafield value:', subCollectionMetafield?.value);
        
        if (subCollectionMetafield?.value) {
          let subCollectionIds = [];
          
          try {
            // Try to parse as JSON first (like home index does)
            if (typeof subCollectionMetafield.value === 'string') {
              subCollectionIds = JSON.parse(subCollectionMetafield.value);
            } else if (Array.isArray(subCollectionMetafield.value)) {
              // If it's already an array, use it directly
              subCollectionIds = subCollectionMetafield.value;
            }
            
            // Ensure we have an array
            if (!Array.isArray(subCollectionIds)) {
              console.log('Sub-collection IDs is not an array, converting to array');
              subCollectionIds = [subCollectionIds];
            }
          } catch (error) {
            console.log('Error parsing subCollectionMetafield as JSON, trying comma split:', error);
            // Fallback to comma split if JSON parsing fails
            if (typeof subCollectionMetafield.value === 'string') {
              subCollectionIds = subCollectionMetafield.value
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);
            }
          }

          console.log('Parsed sub-collection IDs:', subCollectionIds);

          // Fetch each sub-collection individually
          for (const subCollectionId of subCollectionIds) {
            try {
              console.log('Fetching sub-collection with ID:', subCollectionId);
              const subCollectionData = await context.storefront.query(SUB_COLLECTION_QUERY, {
                variables: { id: subCollectionId }
              });
              
              console.log('Sub-collection data received:', subCollectionData);
              
              if (subCollectionData?.collection) {
                 subCollections.push(subCollectionData.collection);
                 console.log('Added sub-collection to subCollections');
              }
            } catch (error) {
              console.error('Error fetching sub-collection:', subCollectionId, error);
              // Continue with other sub-collections if one fails
            }
          }
          
                     // Structure the data like home index does
           if (subCollections.length > 0) {
             featuredRegistryData = {
               parentCollection: realRegistriesCollection,
               subCollections: subCollections
             };
             console.log('Structured featuredRegistryData like home index:', featuredRegistryData);
           } else {
             console.log('No sub-collections were successfully fetched');
           }
        } else {
          console.log('No sub-collection metafield value found');
        }
      } catch (error) {
        // Handle any errors in parsing or fetching sub-collections
        console.error('Error fetching sub-collections:', error);
      }
    } else {
      console.log('No real registries collection found to process');
    }
    
    console.log('Final featuredRegistryData before fallback check:', featuredRegistryData);
    console.log('Final featuredRegistryData type:', typeof featuredRegistryData);
    console.log('Final featuredRegistryData has subCollections:', !!featuredRegistryData?.subCollections);
    
    // If no ready-made registries found, try to use regular collections as fallback
    if (!featuredRegistryData || (featuredRegistryData.subCollections && featuredRegistryData.subCollections.length === 0)) {
      console.log('No ready-made registries found, trying fallback with regular collections');
      
      // Use the first few collections as a fallback
      const fallbackCollections = collections?.slice(0, 3) || [];
      if (fallbackCollections.length > 0) {
        console.log('Using fallback collections:', fallbackCollections);
        featuredRegistryData = {
          parentCollection: { title: 'Fallback Collections' },
          subCollections: fallbackCollections
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
      console.log('Using fallback collections after error:', fallbackCollections);
      featuredRegistryData = {
        parentCollection: { title: 'Fallback Collections' },
        subCollections: fallbackCollections
      };
    }
  }

  // Extract products only from parent collections (parentMetafield.value === 'true' and readyMadeMetafield.value !== 'true')
  let allProducts = [];
  try {
    // First, find all parent collections
    const parentCollections = collections.filter(
      (col) => col.parentMetafield?.value === 'true' && col.readyMadeMetafield?.value !== 'true'
    );
    
    // For each parent collection, get products from its sub-collections
    parentCollections.forEach(parentCollection => {
      // Get sub-collection GIDs from the parent's subMetafield
      let subCollectionGids = [];
      if (parentCollection.subMetafield?.value) {
        try {
          subCollectionGids = JSON.parse(parentCollection.subMetafield.value);
        } catch (error) {
          // Handle any errors in parsing subMetafield
        }
      }
      
      // Find sub-collections by GID
      const subCollections = collections.filter(
        (col) => col.parentMetafield?.value === 'false' && 
                  col.readyMadeMetafield?.value !== 'true' &&
                  subCollectionGids.includes(col.id)
      );
      
      // Extract products from sub-collections
      subCollections.forEach(subCollection => {
        if (subCollection.products?.edges) {
          subCollection.products.edges.forEach(edge => {
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
              collectionId: subCollection.id, // Use sub-collection ID
              parentCollectionId: parentCollection.id, // Also track parent collection ID
              parentCollectionTitle: parentCollection.title // Track parent collection title
            });
          });
        }
      });
    });
  } catch (error) {
    // Handle any errors in extracting products from collections
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
      parentCollection: featuredRegistryData?.parentCollection?.title || 'None'
    }
  });
  
  console.log('About to return featuredRegistryData:', featuredRegistryData);
  console.log('About to return featuredRegistryData type:', typeof featuredRegistryData);
  console.log('About to return featuredRegistryData === null:', featuredRegistryData === null);
  console.log('About to return readyMadeRegistries in json:', featuredRegistryData);
  console.log('About to return featuredRegistryData.subCollections:', featuredRegistryData?.subCollections);
  console.log('About to return featuredRegistryData.parentCollection:', featuredRegistryData?.parentCollection);
  
  const returnData = {
    products: allProducts, 
    collections, 
    user, 
    registry, 
    userData, 
    readyMadeRegistries: featuredRegistryData
  };
  
  console.log('Final return data:', returnData);
  console.log('Final return data readyMadeRegistries:', returnData.readyMadeRegistries);
  
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
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    styles: true,
  });

  // Get parent collections for the swiper and Product Categories
  const parentCollection = collections.filter(
    (col) => col.parentMetafield?.value === 'true' && col.readyMadeMetafield?.value !== 'true',
  );

  // Get sub-collections for Shop by Style (these are the ones that actually contain products)
  const subCollection = collections.filter(
    (col) => col.parentMetafield?.value === 'false' && col.readyMadeMetafield?.value !== 'true',
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
    <div className="w-full xl:w-1/4 p-6 h-fit bg-[#FAF9F6]">
      <div className="mb-6">
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('categories')}
        >
          Product Categories
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
            {parentCollection.map((col) => (
              <li key={col.id}>
                <label>
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
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('brands')}
        >
          Our Brands
          <span className="text-lg">
            {openSections.brands ? (
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
        {openSections.brands && (
          <p className="text-sm text-gray-500 italic">No data</p>
        )}
      </div>

      <div>
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('styles')}
        >
          Shop by Style
          <span className="text-lg">
            {openSections.styles ? (
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
        {openSections.styles && (
          <ul className="space-y-2 text-sm">
            {subCollection.map((col) => (
              <li key={col.id}>
                <label>
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
  console.log('Raw loaderData received:', loaderData);
  console.log('Raw loaderData keys:', Object.keys(loaderData || {}));
  
  const {products, collections, registry, user, userData, readyMadeRegistries} = loaderData || {};
  
  // Debug logging for ready-made registries
  console.log('Dashboard addgifts received loaderData:', loaderData);
  console.log('Dashboard addgifts received readyMadeRegistries:', readyMadeRegistries);
  console.log('Ready-made registries structure:', {
    hasData: !!readyMadeRegistries,
    hasSubCollections: !!readyMadeRegistries?.subCollections,
    subCollectionsCount: readyMadeRegistries?.subCollections?.length || 0,
    parentCollection: readyMadeRegistries?.parentCollection?.title || 'None'
  });
  if (readyMadeRegistries && readyMadeRegistries.subCollections && readyMadeRegistries.subCollections.length > 0) {
    console.log('First ready-made registry sample:', readyMadeRegistries.subCollections[0]);
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
    {
      label: 'LOREM IPSUM',
      value: 3,
      route: 'lorem',
    },
  ];

  // State for checked collections and displayed products
  const [checkedCollectionIds, setCheckedCollectionIds] = useState([]);
  const [selectedSwiperCollectionId, setSelectedSwiperCollectionId] = useState(null);
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);

  // Filter products based on selected collections
  const filteredProducts = checkedCollectionIds.length > 0 
    ? products.filter(product => {
        // Check if the product's collection is directly selected
        if (checkedCollectionIds.includes(product.collectionId)) {
          return true;
        }
        
        // Check if the product's parent collection is selected
        if (checkedCollectionIds.includes(product.parentCollectionId)) {
          return true;
        }
        
        return false;
      })
    : products;

  // Sort products based on selected sort option
  const sortedProducts = React.useMemo(() => {
    if (!priceSort && !dateSort || filteredProducts.length === 0) {
      return filteredProducts;
    }

    return [...filteredProducts].sort((a, b) => {
      const priceA = parseFloat(a.price || 0);
      const priceB = parseFloat(b.price || 0);
      const createdAtA = new Date(a.createdAt || 0).getTime();
      const createdAtB = new Date(b.createdAt || 0).getTime();
      
      if (priceSort === 'low-to-high') {
        return priceA - priceB;
      } else if (priceSort === 'high-to-low') {
        return priceB - priceA;
      } else if (dateSort === 'newest') {
        return createdAtB - createdAtA;
      } else if (dateSort === 'oldest') {
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
    (col) => col.parentMetafield?.value === 'true' && col.readyMadeMetafield?.value !== 'true',
  );

  return (
    <>
      <div className="pt-[80px] relative p-4 mt-[80px]">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          {selectedSwiperCollectionId ? (
            <>
              <span className="prata uppercase">
                {collections.find(col => col.id === selectedSwiperCollectionId)?.title || ''}
              </span>
            </>
          ) : (
            <span className="prata uppercase">Add or edit gifts</span>
          )}
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />
        <p className="max-w-xl mx-auto text-center  my-5 font-normal leading-relaxed">
          {selectedSwiperCollectionId 
            ? `Browse products from ${collections.find(col => col.id === selectedSwiperCollectionId)?.title || 'this collection'} and its sub-categories.`
            : 'Browse by category, filter by price, or get inspired with our curated edits. Add, update, or switch things up whenever you like.'
          }
        </p>
        <Link to={`/couple/single/${userData?.data?.user?.id}`}>
        <PreviewRegistry />
        </Link>
      </div>

      <section className=" ">
        <div className=" relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
          <div className=" ">
            {!selectedSwiperCollectionId && (
              <>
                <div className="z-10 swiper-button-prev-prod absolute  left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase  max-[1601px]:w-[90px] items-center bg-white top-[45%] px-8 py-10  justify-center max-[1024px]:w-[33px]">
                  <img src={nextitem} alt="" className="rotate-180 size-6" />
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
                    .filter((col) => col.parentMetafield?.value === 'true' && col.readyMadeMetafield?.value !== 'true')
                    .map((col) => (
                      <SwiperSlide
                        key={col.id}
                        onClick={() => {
                          // Get sub-collection GIDs from the parent's subMetafield
                          let subCollectionGids = [];
                          if (col.subMetafield?.value) {
                            try {
                              subCollectionGids = JSON.parse(col.subMetafield.value);
                            } catch (error) {
                              // Handle any errors in parsing subMetafield
                            }
                          }
                          
                          // Set the checked collection IDs to all sub-collections of this parent
                          setCheckedCollectionIds(subCollectionGids);
                          setSelectedSwiperCollectionId(col.id);
                        }}
                        style={{ cursor: 'pointer'}}
                      >
                        <img
                          src={col.image?.url || '/assets/Images/placeholder.png'}
                          alt={col.title}
                          className="w-full h-[500px] object-cover"
                        />
                        <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                          {col.title}
                        </h3>
                      </SwiperSlide>
                    ))}
                </Swiper>
                <div className="swiper-button-next-prod absolute  right-[1%] max-[1601px]:-right-[0%] cursor-pointer  uppercase max-[1601px]:w-[90px] items-center bg-white z-10 top-[45%] px-8 py-10  justify-center text-white max-[1024px]:w-[33px]">
                  <img src={nextitem} className="size-6" alt="" />
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
                <button
                  onClick={() => {
                    setSelectedSwiperCollectionId(null);
                    setCheckedCollectionIds([]);
                  }}
                  className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Clear Selection
                </button>
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
                      <span className='pr-3'>
                        {priceSort === '' && dateSort === '' && 'Default'}
                        {priceSort === 'low-to-high' && 'Price: Low to High'}
                        {priceSort === 'high-to-low' && 'Price: High to Low'}
                        {dateSort === 'newest' && 'Date: Newest First'}
                        {dateSort === 'oldest' && 'Date: Oldest First'}
                      </span>
                      <img 
                        src={arrowDown} 
                        alt="dropdown" 
                        className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[200px]">
                        <button
                          onClick={() => {
                            setPriceSort('');
                            setDateSort('');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            priceSort === '' && dateSort === '' ? 'bg-gray-100' : ''
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
                  const firstImage = product.image || '/assets/Images/placeholder.jpg';
                  return (
                    <RegistryProduct
                      key={product.id}
                      image={firstImage}
                      productName={product.title}
                      price={product.price}
                      description={product.description}
                      onAddToRegistry={() => handleAddtoRegistry(product)}
                      onPersonalizeFund={() => navigate(`/dashboard/addgifts/${product.handle}`)}
                    />
                  );
                });
              
              return productNodes;
            })()}
          </div>
        </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-md mb-10">
              LOADING {Math.min(productsToShow, sortedProducts.length)} of{' '}
              {sortedProducts.length}
            </p>

            {sortedProducts.length > 12 &&
              productsToShow < sortedProducts.length && (
                <WhiteThemeButton
                  Text="View more"
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

      <section className="bg-[#FAF9F6] py-8">
        <Heading
          text="ready-made registries"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] mb-10'}
        />
        <p className="text-center md:text-lg lg:text-2xl 2xl:text-3xl md:leading-[24px] lg:leading-[28px] xl:leading-[30px] 2xl:leading-[40px] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-10 mb-8">
        From real couples to curated style edits, our ready-made registries are personal, shoppable, and designed to make choosing easy.
      </p>
        
        {/* Safety check before rendering CustomTab */}
        {readyMadeRegistries && readyMadeRegistries.subCollections && readyMadeRegistries.subCollections.length > 0 ? (
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
              },
              {
                label: 'LOREM IPSUM',
                value: 3,
                route: 'lorem',
              },
            ]} 
            featuredRegistryData={readyMadeRegistries} 
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {readyMadeRegistries === undefined ? 'Loading ready-made registries...' : 'No ready-made registries found'}
            </p>
            <p className="text-sm text-gray-500">
              Data type: {typeof readyMadeRegistries} | 
              Structure: {readyMadeRegistries?.subCollections ? 'Has subCollections' : 'No subCollections'} |
              Sub-collections count: {readyMadeRegistries?.subCollections?.length || 0}
            </p>
            {readyMadeRegistries && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-left">
                <p className="text-sm font-semibold mb-2">Raw Data:</p>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(readyMadeRegistries, null, 2)}
                </pre>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">If this message persists, please check the console for any errors.</p>
          </div>
        )}
        <div className="text-center">
        <Link to="/ready-made-registries">
          <ButtonComponent
            text="EXPLORE"
            className="button-cs text-black border-3 w-[350px] border-black py-4 lg:py-[30px] bg-transparent rounded-none mt-11"
          />
          </Link>
        </div>
      </section>

      <section className="py-[70px]  my-12 lg:my-[240px] container">
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
      </section>

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
