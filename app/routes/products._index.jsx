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

const COLLECTION_QUERY = `#graphql
    query {
    collections(first: 50) {
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
    user: user || null
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
  const {collections, searchQuery, registry, user} = useLoaderData();
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

  const parentCollections = collections.filter(
    (col) => col.parentMetafield?.value === 'true' && col.readyMadeMetafield?.value !== 'true',
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

      <div className="w-full h-fit pt-[100px]">
        <Heading
          text={searchQuery ? `Search Results for "${searchQuery}"` : "products"}
          classes={
            'prata text-4xl lg:text-[2.5vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[13.542vw] h-[6px]'}
        />
        {searchQuery && (
          <p className="text-center my-5 text-lg">
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
          <div className="pt-[20px] lg:w-[80.625vw] lg:px-0 lg:mx-auto px-16 pb-[100px]">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-16 gap-x-[24px] mt-16 mx-10">
              <div className="flex flex-col items-center justify-center">
                <img src={newArrivals} alt="" className="w-full lg:h-[25.417vw]" />
                <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-[1.25vw] lg:leading-[1.875vw] text-sm font-medium tracking-wider">
                  NEW ARRIVALS
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center">
                <img src={bestSellers} alt="" className="w-full lg:h-[25.417vw]" />
                <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  BESTSELLERS
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center">
                <img src={giftCards} alt="" className="w-full lg:h-[25.417vw] bg-[#446184]" />
                <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  GIFT CARDS
                </h3>
              </div>
              {parentCollections.map((col) => (
                <Link to={`/products/${col.handle}`} key={col.id} className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img src={col.image.url} alt={col.title} className="w-full lg:h-[25.417vw]" />
                  <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                    {col.title}
                  </h3>
                </Link>
              ))}
            </div>
      </div>

      <section className="pt-[70px] pb-[160px] my-12 lg:my-[240px] container">
        <Heading
          text="the registry bestsellers"
          classes={
            'prata text-3xl lg:text-[2.5vw] font-normal text-center  max-[1024px]:m-0'
          }
          image={brandline}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[33.021vw]'}
        />
            <ProductSlider />
        <div className="text-center">
          <ButtonComponent
            text="BROWSE BESTSELLERS"
            className="button-cs text-[#1F1D1B] text-[18px] leading-[18px] lg:w-[360px] lg:h-[78px] border-3 border-[#1F1D1B] cursor-pointer max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
          />
        </div>
      </section>

          {/* <div className="py-[120px] px-12">
            <ExploreCategories collections={collections} />
          </div> */}
        </>
      )}

      <Footer />

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
    </section>
  );
};

export default Products;
