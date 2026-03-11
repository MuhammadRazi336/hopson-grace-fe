import React, { useState } from 'react';
import { Footer } from '~/components/Footer';
import { Header } from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '~/assets/Images/line.png';
import { defer, json } from '@remix-run/server-runtime';
import { useLoaderData, useFetcher, useNavigate, Link } from '@remix-run/react';
import { extractShopifyId } from '~/utils/helpers.js';
import {formatPrice} from '~/utils/priceFormatter';
import AlertPortal from '~/components/AlertPortal';

const PRODUCTS_QUERY = `#graphql
  query($query: String) {
    products(first: 250, query: $query) {
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

const COLLECTIONS_QUERY = `#graphql
  query {
    collections(first: 100) {
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

const CASH_FUND_QUERY = `#graphql
query getCashFundsForSearch {
  collections(first: 100) {
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

const BLOGS_QUERY = `#graphql
  query GetAllBlogsAndArticlesForSearch {
    blogs(first: 1, reverse: true) {
      nodes {
    title
    handle
        articles(first: 250) {
          nodes {
    id
    title
    handle
            publishedAt
            contentHtml
            image {
              id
          url
          altText
          width
          height
        }
            metafield(namespace: "custom", key: "userId") {
              value
            }
          }
        }
      }
    }
  }
`;

const BRAND_SEARCH_QUERY = `#graphql
  query getSearchBrands {
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
        metafield(namespace: "custom", key: "brand") {
          id
          value
        }
      }
    }
  }
`;

const READY_MADE_SEARCH_QUERY = `#graphql
  query getReadyMadeRegistriesForSearch {
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

export async function loader({ request, context }) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q');
  const user = context?.session?.get('@User');
  
  // Only fetch registry data if user is logged in
  let registry = null;
  if (user && user.user && user.user.id) {
    try {
      const registryResponse = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
      registry = registryResponse?.data?.[0];
    } catch (error) {
      console.log('Error fetching registry:', error);
    }
  }

  if (!searchQuery) {
    return defer({
      products: [],
      collections: [],
      cashFunds: [],
      blogs: [],
      brands: [],
      readyMadeRegistries: [],
      searchQuery: null,
      registry: registry,
    });
  }

  try {
    // Build a robust product query to search across title, vendor, product type and tags
    const escaped = searchQuery.replace(/"/g, '\\"');
    const productQuery = `title:*${escaped}* OR product_type:*${escaped}* OR vendor:*${escaped}* OR tag:*${escaped}*`;

    // Fetch all data types
    const [
      {products},
      {collections},
      {collections: allCollections},
      {blogs},
      {collections: brandCollectionsData},
      {collections: readyCollectionsData},
    ] = await Promise.all([
      context.storefront.query(PRODUCTS_QUERY, { variables: { query: productQuery } }),
      context.storefront.query(COLLECTIONS_QUERY),
      context.storefront.query(CASH_FUND_QUERY),
      context.storefront.query(BLOGS_QUERY),
      context.storefront.query(BRAND_SEARCH_QUERY),
      context.storefront.query(READY_MADE_SEARCH_QUERY),
    ]);

    // Filter products (fallback refinement to ensure inclusive match)
    const term = searchQuery.toLowerCase();
    const filteredProducts = products?.edges?.filter(edge => {
      const p = edge.node;
      const inTitle = p.title?.toLowerCase().includes(term);
      const inDesc = p.description?.toLowerCase().includes(term);
      const inHandle = p.handle?.toLowerCase().includes(term);
      return inTitle || inDesc || inHandle;
    }) || [];

    // Filter collections (excluding cash fund collections)
    const filteredCollections = collections?.nodes?.filter(collection => {
      // Skip collections that are cash funds
      const isCashFund = collection.metafield?.value === 'true';
      if (isCashFund) return false;
      
      return (
        collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }) || [];

    // Filter cash fund collections - only show if they match the search
    const cashFundCollections = allCollections?.nodes?.filter(collection => 
      collection.metafield?.value === 'true'
    ) || [];

    const filteredCashFunds = cashFundCollections.filter(collection => 
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.products?.edges?.some(edge => 
        edge.node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        edge.node.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // For cash funds, we need to filter the individual products within matching collections
    const filteredCashFundProducts = filteredCashFunds.flatMap(collection => 
      collection.products?.edges?.filter(edge => {
        const product = edge.node;
        return (
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }).map(edge => ({
        ...edge.node,
        collectionTitle: collection.title,
        collectionHandle: collection.handle
      })) || []
    );

    // Filter blogs and articles
    const filteredBlogs =
      blogs?.nodes?.flatMap((blog) =>
        blog.articles?.nodes
          ?.filter((article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.contentHtml?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.title.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .map((article) => ({
            ...article,
            blogTitle: blog.title,
            blogHandle: blog.handle,
          })) || [],
      ) || [];

    // Brands (collections with brand metafield = true) that match the search
    const brandCollections = brandCollectionsData?.nodes || [];
    const filteredBrands =
      brandCollections.filter((collection) => {
        if (collection.metafield?.value !== 'true') return false;
        const title = (collection.title || '').toLowerCase();
        const description = (collection.description || '').toLowerCase();
        return title.includes(term) || description.includes(term);
      }) || [];

    // Ready-made registries (child collections where ready_made is true and not a parent collection)
    const readyCollections = readyCollectionsData?.nodes || [];
    const filteredReadyMadeRegistries =
      readyCollections.filter((collection) => {
        const isReady = collection.readyMadeMetafield?.value === 'true';
        const isParent = collection.parentCollectionMetafield?.value === 'true';
        if (!isReady || isParent) return false;

        const title = (collection.title || '').toLowerCase();
        const description = (collection.description || '').toLowerCase();
        return title.includes(term) || description.includes(term);
      }) || [];

    return defer({
      products: filteredProducts,
      collections: filteredCollections,
      cashFunds: filteredCashFundProducts,
      blogs: filteredBlogs,
      brands: filteredBrands,
      readyMadeRegistries: filteredReadyMadeRegistries,
      searchQuery,
      registry: registry,
    });
  } catch (error) {
    console.error("Error loading search results:", error);
    return defer({
      products: [],
      collections: [],
      cashFunds: [],
      blogs: [],
      brands: [],
      readyMadeRegistries: [],
      searchQuery,
      registry: registry,
    });
  }
}

export async function action({ request, context }) {
  const body = await request.json();
  const { payload } = body;
  try {
    const response = await context.ClientPost(
      JSON.parse(payload),
      'registryProducts',
      context,
    );
    return json({ success: true, response });
  } catch (e) {
    return json({ success: false, error: e.message }, { status: 400 });
  }
}

export default function SearchResults() {
  const {
    products,
    collections,
    cashFunds,
    blogs,
    brands,
    readyMadeRegistries,
    searchQuery,
    registry,
  } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Cash funds are now already filtered products from the loader
  const allCashFundProducts = cashFunds || [];

  // Flatten product edges and combine gifts + cash funds into one list
  const giftProducts = (products || []).map((edge) => ({
    ...edge.node,
    _isCashFund: false,
  }));
  const cashFundItems = allCashFundProducts.map((product) => ({
    ...product,
    _isCashFund: true,
  }));
  const combinedResults = [...giftProducts, ...cashFundItems];

  // Combine products, brands, and ready-made registries into a single grid
  const allResults = [
    ...combinedResults.map((p) => ({_kind: 'product', data: p})),
    ...(brands || []).map((b) => ({_kind: 'brand', data: b})),
    ...(readyMadeRegistries || []).map((r) => ({
      _kind: 'readyRegistry',
      data: r,
    })),
  ];

  const handleAddtoRegistry = (product) => {
    try {
      // Check if user is logged in by looking for token in localStorage
      const token = localStorage.getItem('@token') || localStorage.getItem('@Token');
      
      if (!token) {
        // No token found, redirect to login
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
        { payload: JSON.stringify(payload) },
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

  const ProductCard = ({ product, isCashFund = false }) => {
    const firstImage = product.images?.edges?.[0]?.node?.url || 
                      product.images?.edges?.[0]?.node?.src || 
                      '/assets/Images/placeholder.png';
    const firstVariant = product.variants?.edges?.[0]?.node;
    const price = formatPrice(firstVariant?.priceV2?.amount);
    
    return (
      <div className="pt-0 relative lg:w-[23.43vw] xl:w-[23.43vw] 2xl:w-[23.43vw px-5">
      <div className="relative group mb-[4.844vw]">
        {/* Product Image and Info */}
        <div className="z-10 relative">
          <Link to={`/dashboard/addgifts/${product.handle}`} >
            <img
              src={firstImage}
              alt={product.title}
              className="w-full h-[23.43vw] object-cover max-[1024px]:h-[44vw] max-[475px]:h-[36vw]"
            />
            <h3 className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.354vw] uppercase mt-[1.563vw]">
              {product.title}
            </h3>
            <p className="text-sm mt-[0.677vw] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw]">{price}</p>
          </Link>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute lg:h-[33.5vw] xl:h-[33.5vw] 2xl:h-[35.3vw] lg:min-h-[20vw] xl:min-h-[20vw] 2xl:min-h-[20vw] inset-0 z-40 bg-[#FAF9F6] px-[2.552vw] py-[2.24vw] flex flex-col shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center scale-[1.13]">
          <Link to={`/dashboard/addgifts/${product.handle}`} className="hover:no-underline">
            <div>
              <img
                src={firstImage}
                alt={product.title}
                className="w-full rounded-none h-[18.223vw] mx-auto object-cover cursor-pointer hover:opacity-80 transition-opacity"
              />
              <h4 className="text-base font-medium uppercase text-left mt-[1.135vw] mb-[0.781vw]">
                {isCashFund ? (product.collectionTitle || 'CASH FUND') : 'GIFT'}
              </h4>
              <h3 className="text-sm font-[500] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.146vw] uppercase text-left leading-snug cursor-pointer hover:text-gray-600 transition-colors">
                {product.title}
              </h3>
              <p className="text-2xl mt-2 text-left">{price}</p>
            </div>
          </Link>

          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col w-full items-center text-xs">
              <button
                className={`bg-[#446184] cursor-pointer uppercase w-full lg:h-[4.31vw] xl:h-[4.31vw] 2xl:h-[4.31vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] block text-white text-sm font-semibold py-4 disabled:opacity-50 tracking-widest
                  ${
                            fetcher.state === 'submitting'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-[#446184] hover:bg-[#2c4a6b] transition-colors duration-200'
                          }
                  `}
                onClick={() => handleAddtoRegistry(product)}
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
  };

  const CollectionCard = ({ collection }) => (
    <Link 
      to={`/products/${collection.handle}`} 
      className="group cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="relative overflow-hidden">
        <img
          src={collection.image?.url || '/assets/Images/placeholder.png'}
          alt={collection.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold uppercase mb-2">
          {collection.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {collection.description || 'Browse this collection'}
        </p>
        <p className="text-sm font-medium">
          {collection.products?.edges?.length || 0} products
        </p>
      </div>
    </Link>
  );



  const BlogCard = ({ blog }) => {
    // Extract first paragraph from contentHtml safely
    const extractFirstParagraph = (contentHtml) => {
      if (!contentHtml) return '';
      
      // Simple regex to extract text from first <p> tag
      const pMatch = contentHtml.match(/<p[^>]*>(.*?)<\/p>/i);
      if (pMatch) {
        // Remove HTML tags from the content
        const textContent = pMatch[1].replace(/<[^>]*>/g, '').trim();
        return textContent;
      }
      
      // Fallback: remove all HTML tags and take first 150 characters
      const textContent = contentHtml.replace(/<[^>]*>/g, '').trim();
      return textContent;
    };

    const firstParagraph = extractFirstParagraph(blog.contentHtml);
    const truncatedParagraph = firstParagraph.length > 150 
      ? firstParagraph.substring(0, 150) + '...' 
      : firstParagraph;

    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={blog.image?.url || '/assets/Images/placeholder.png'}
            alt={blog.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
            {blog.blogTitle}
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-3 line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 flex-1">
            {truncatedParagraph}
          </p>
          <div className="mt-auto">
            <p className="text-xs text-gray-500 mb-3">
              {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <Link to={`/blogs/${blog.blogHandle}/${blog.handle}`}>
              <button className="w-full py-2 px-4 bg-[#446184] hover:opacity-90 uppercase font-bold text-white text-sm">
                Read More
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const BrandCard = ({ brand }) => (
    <Link
      to={`/brand/${brand.handle}`}
      className="group cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="relative overflow-hidden">
        <img
          src={brand.image?.url || '/assets/Images/placeholder.png'}
          alt={brand.title}
          className="w-full h-[23.43vw] object-contain max-[1024px]:h-[44vw] max-[475px]:h-[36vw]"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold uppercase mb-2">
          {brand.title}
        </h3>
        <p className="text-sm text-gray-600">
          {brand.description || 'Browse this brand'}
        </p>
      </div>
    </Link>
  );

  const ReadyMadeRegistryCard = ({ registry }) => {
    const desc = registry.description || 'Browse this registry';
    const truncated =
      desc.length > 120 ? `${desc.substring(0, 120)}...` : desc;

    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={`/registry/${registry.handle}`}>
          <img
            src={registry.image?.url || '/assets/Images/placeholder.png'}
            alt={registry.title}
            className="w-full h-64 object-cover"
          />
        </Link>
        <div className="p-6 flex-1 flex flex-col">
          <Link to={`/registry/${registry.handle}`}>
            <h3 className="text-lg font-semibold mb-3 uppercase">
              {registry.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mb-4 flex-1">
            {truncated}
          </p>
          <div className="mt-auto">
            <Link to={`/registry/${registry.handle}`}>
              <button className="w-full py-2 px-4 bg-[#1F1D1B] hover:bg-black uppercase font-bold text-white text-sm">
                View Registry
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (!searchQuery) {
    return (
      <section>
        <Header />
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Search Results</h1>
          <p className="text-gray-600">Enter a search term to find products, cash funds, collections, and blogs.</p>
        </div>
        <Footer />
      </section>
    );
  }

  const totalResults = allResults.length;

  return (
    <section>
      <Header />
      {/* Combined grid: gifts, cash funds, brands, ready-made registries */}
      {totalResults > 0 && (
        <section className="container mx-auto py-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            {totalResults} search results found for "{searchQuery}"
          </h2>
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[2.135vw] pt-0 p-0 relative z-0 mb-[4.844vw]">
            {allResults.map((item) => {
              if (item._kind === 'product') {
                const product = item.data;
                return (
                  <ProductCard
                    key={`product-${product.id}`}
                    product={product}
                    isCashFund={product._isCashFund}
                  />
                );
              }

              if (item._kind === 'brand') {
                return (
                  <BrandCard
                    key={`brand-${item.data.id}`}
                    brand={item.data}
                  />
                );
              }

              return (
                <ReadyMadeRegistryCard
                  key={`registry-${item.data.id}`}
                  registry={item.data}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* No Results */}
      {totalResults === 0 && (
        <section className="text-center py-16 px-6 mt-12">
          <div className="max-w-md mx-auto">
            <img
              src="/assets/Images/NoProduct.png"
              alt="No Products"
              className="w-36 h-36 mx-auto mb-6 opacity-50"
            />
            <h3 className="text-[22px] font-semibold text-[#1F1D1B] mb-4">
              0 Results Found
            </h3>
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
      `}</style>
      <Footer />
    </section>
  );
}
