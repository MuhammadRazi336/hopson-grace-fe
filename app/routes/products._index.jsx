import React, { useState } from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
import ButtonComponent from '~/components/Button';
import brandline from '/assets/Images/brandline.png';
import ProductSlider from '~/components/ProductSlider';
import ExploreCategories from '~/components/ExploreCategories';
import {defer, json} from '@remix-run/server-runtime';
import {useLoaderData, Link, useSearchParams, useFetcher, useNavigate} from '@remix-run/react';
import newArrivals from '/assets/Images/newArrivals.png';
import bestSellers from '/assets/Images/bestSellers.png';
import giftCards from '/assets/Images/giftCard.png';
import {extractShopifyId} from '~/utils/helpers.js';
import AlertPortal from '~/components/AlertPortal';
import BestsellersSection from '~/components/BestsellersSection';

const COLLECTION_QUERY = `#graphql
    query {
    collections(first: 250) {
      nodes {
        description
        title
        id
        handle
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

const BESTSELLER_PRODUCTS_QUERY = `#graphql
  query GetBestsellerProducts($first: Int!) {
    products(first: $first, query: "tag:bestseller") {
      edges {
        node {
          id
          title
          handle
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
        }
      }
    }
  }
`;

export async function loader({request, context}) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search');
  const {collections} = await loadCollectionData({context});
  
  // Get user session if available (optional for non-logged in users)
  const user = context?.session?.get('@User');
  let registry = null;
  
  // Only fetch registry if user is logged in
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
  
  // Fetch bestseller products
  let bestsellerProducts = [];
  try {
    const {products: bestsellerData} = await context.storefront.query(BESTSELLER_PRODUCTS_QUERY, { variables: { first: 8 } });
    bestsellerProducts = bestsellerData?.edges || [];
  } catch (error) {
    console.log('Error fetching bestseller products:', error);
  }
  
  // If there's a search query, filter collections by title/description
  let filteredCollections = collections;
  if (searchQuery) {
    filteredCollections = collections.filter(collection => 
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return defer({
    collections: filteredCollections, 
    searchQuery, 
    registry: registry?.data?.[0] || null,
    user: user || null,
    bestsellerProducts
  });
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
  const {collections} = await context.storefront.query(COLLECTION_QUERY);
  // Return all collections so ExploreCategories can filter them properly
  return {
    collections: collections.nodes,
  };
}

const Products = () => {
  const {collections, searchQuery, registry, user, bestsellerProducts} = useLoaderData();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  console.log('Products page collections:', collections);
  console.log('Collections count:', collections?.length || 0);
  if (collections && collections.length > 0) {
    console.log('First collection sample:', collections[0]);
    console.log('Collections with parentMetafield:', collections.filter(col => col.parentMetafield?.value === 'true'));
  }

  const isExcludedFundsCollection = (col) => {
    const t = (col.title && String(col.title).toUpperCase().trim()) || '';
    return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
  };

  const parentCollections = collections.filter(
    (col) =>
      col.parentMetafield?.value === 'true' &&
      col.readyMadeMetafield?.value !== 'true' &&
      !isExcludedFundsCollection(col),
  );

  // Get all products from all collections for search results (only if not searching)
  const allProducts = collections
    .filter(collection => collection.readyMadeMetafield?.value !== 'true')
    .flatMap(collection => 
      collection.products?.edges?.map(edge => ({
        ...edge.node,
        collectionTitle: collection.title,
        collectionHandle: collection.handle
      })) || []
    );

  const handleAddtoRegistry = (product) => {
    try {
      // Check if user is logged in
      if (!user || !user.user || !user.user.id) {
        // User not logged in, redirect to login
        navigate('/login');
        return;
      }

      // Check if registry exists and has an id
      if (!registry || !registry.id) {
        setAlertMessage('Registry not found. Please try again.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
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

      const payload = {
        productId: Number(extractShopifyId(product.id)),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry.id),
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

  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit pt-[6.771vw]">
        <Heading
          text={searchQuery ? `search results for "${searchQuery}"` : "browse by category"}
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[13.542vw] h-[0.417vw] object-contain'}
        />
        {searchQuery && (
          <p className="text-center mt-[1.615vw] lg:text-[1.25vw] lg:leading-[1.875vw] text-lg">
            Found {collections.length} collection{collections.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
        {/* <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        /> */}
        <p className="max-w-[52.396vw] mt-[1.615vw] mx-auto text-center font-normal lg:leading-[1.875vw] lg:text-[1.25vw]">
          {searchQuery 
            ? "Browse the search results below or use the filters to refine your search."
            : "From heritage brands to up-and-coming makers, our collection is thoughtfully curated for how you actually live. Expect timeless design, lasting quality, and modern pieces you’ll love now—and for years to come. Nothing you don’t need, everything you’ll use."
          }
        </p>
      </div>

      {/* Search Results Section */}
      {searchQuery && collections.length > 0 && (
        <section className="container mx-auto py-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link 
                to={`/products/${collection.handle}`} 
                key={collection.id} 
                className="group cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="relative overflow-hidden h-[500px]">
                  <img
                    src={collection.image?.url || '/assets/Images/placeholder.png'}
                    alt={collection.title}
                    className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold uppercase mb-2">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {collection.description || 'Browse this collection'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* No Search Results */}
      {searchQuery && collections.length === 0 && (
        <section className="container mx-auto py-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">No collections found</h3>
          <p className="text-gray-600 mb-8">
            No collections match your search for "{searchQuery}". Try different keywords or browse our categories below.
          </p>
        </section>
      )}

      {/* Regular Products Page Content - Only show when no search query */}
      {!searchQuery && (
        <>
          <div className="lg:px-[9.583vw] w-[94%] lg:mx-auto px-16 pb-[12.448vw]">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-x-[35px] lg:gap-y-[3.958vw] gap-y-16 gap-x-[24px] mt-[4.167vw]">
              <Link to="/products/new-arrivals">
                <div className="flex flex-col items-center justify-center cursor-pointer">
                  <img src={newArrivals} alt="" className="w-full aspect-square object-cover" />
                  <h3 className="mt-2 text-center lg:mt-[1.875vw] uppercase lg:text-[1.25vw] lg:leading-[1.875vw] text-sm font-[500] tracking-wider">
                    NEW ARRIVALS
                  </h3>
                </div>
              </Link>
              <Link to="/products/bestsellers">
                <div className="flex flex-col items-center justify-center cursor-pointer">
                  <img src={bestSellers} alt="" className="w-full aspect-square object-cover" />
                  <h3 className="mt-2 text-center lg:mt-[1.875vw] uppercase lg:text-[1.25vw] lg:leading-[1.875vw] text-sm font-[500] tracking-wider">
                    BESTSELLERS
                  </h3>
                </div>
              </Link>
              <Link to="/dashboard/giftcards">
              <div className="flex flex-col items-center justify-center">
                <img src={giftCards} alt="" className="w-full aspect-square object-cover bg-[#446184]" />
                <h3 className="mt-2 text-center lg:mt-[1.875vw] uppercase lg:text-[1.25vw] lg:leading-[1.875vw] text-sm font-[500] tracking-wider">
                  GIFT CARDS
                </h3>
              </div>
              </Link>
              {parentCollections.map((col) => (
                <Link to={`/products/${col.handle}`} key={col.id} className="flex flex-col items-center justify-center cursor-pointer">
                  {col.image?.url ? (
                    <img src={col.image.url} alt={col.title} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square object-cover bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <h3 className="mt-2 text-center lg:mt-[1.875vw] uppercase lg:text-[1.25vw] lg:leading-[1.875vw] text-sm font-[500] tracking-wider">
                    {col.title}
                  </h3>
                </Link>
              ))}
            </div>
      </div>

      <BestsellersSection
        bestsellerProducts={bestsellerProducts}
        sectionClassName="pt-0 pb-[9.531vw] my-12"
        headingClasses="prata text-3xl lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0"
        buttonClassName="button-cs text-[#1F1D1B] bastardogrotesk lg:text-[0.938vw] lg:leading-[0.938vw] text-[18px] leading-[18px] lg:w-[18.75vw] lg:h-[4.01vw] border-3 border-[#1F1D1B] cursor-pointer max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-[4.271vw]"
      />

          {/* <div className="py-[120px] px-12">
            <ExploreCategories collections={collections} />
          </div> */}
        </>
      )}

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
    </section>
  );
};

export default Products;
