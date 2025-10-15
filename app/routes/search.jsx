import React, { useState } from 'react';
import { Footer } from '~/components/Footer';
import { Header } from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '~/assets/Images/line.png';
import { defer, json } from '@remix-run/server-runtime';
import { useLoaderData, useFetcher, useNavigate, Link } from '@remix-run/react';
import { extractShopifyId } from '~/utils/helpers.js';
import {formatPrice} from '~/utils/priceFormatter';

const PRODUCTS_QUERY = `#graphql
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
        articles(first: 50) {
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
      searchQuery: null, 
      registry: registry
    });
  }

  try {
    // Fetch all data types
    const [{ products }, { collections }, { collections: allCollections }, { blogs }] = await Promise.all([
      context.storefront.query(PRODUCTS_QUERY),
      context.storefront.query(COLLECTIONS_QUERY),
      context.storefront.query(CASH_FUND_QUERY),
      context.storefront.query(BLOGS_QUERY),
    ]);

    // Filter products
    const filteredProducts = products?.edges?.filter(edge => {
      const product = edge.node;
      return (
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
    const filteredBlogs = blogs?.nodes?.flatMap(blog => 
      blog.articles?.nodes?.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.contentHtml?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(article => ({
        ...article,
        blogTitle: blog.title,
        blogHandle: blog.handle
      })) || []
    ) || [];

    return defer({ 
      products: filteredProducts, 
      collections: filteredCollections, 
      cashFunds: filteredCashFundProducts, 
      blogs: filteredBlogs,
      searchQuery, 
      registry: registry
    });
  } catch (error) {
    console.error("Error loading search results:", error);
    return defer({ 
      products: [], 
      collections: [], 
      cashFunds: [], 
      searchQuery, 
      registry: registry
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
  const { products, collections, cashFunds, blogs, searchQuery, registry } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Cash funds are now already filtered products from the loader
  const allCashFundProducts = cashFunds || [];

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
      <div className="relative group h-[460px]">
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
          <p className="text-sm mt-1">{price}</p>
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
              {isCashFund ? (product.collectionTitle || 'CASH FUND') : 'GIFT'}
            </h4>
            <h3 className="text-sm font-bold uppercase text-left leading-snug">
              {product.title}
            </h3>
            <p className="text-sm mt-2 text-left">{price}</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col w-full items-center text-xs">
              <button
                className="bg-[#446184] w-full block text-white text-xs font-bold py-4 px-8"
                onClick={() => handleAddtoRegistry(product)}
              >
                ADD TO REGISTRY
              </button>
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

  if (!searchQuery) {
    return (
      <section>
        <Header />
        <div className="w-full h-[2px] bg-black"></div>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Search Results</h1>
          <p className="text-gray-600">Enter a search term to find products, cash funds, collections, and blogs.</p>
        </div>
        <Footer />
      </section>
    );
  }

  const totalResults = products.length + collections.length + allCashFundProducts.length + blogs.length;

  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit pt-[100px]">
        <Heading
          text={`search results for "${searchQuery}"`}
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-center my-5 text-lg">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} matching "{searchQuery}"
        </p>
        <p className="max-w-xl mx-auto text-center my-5 font-normal leading-relaxed">
          Browse the search results below categorized by type.
        </p>
      </div>

      {/* Blogs Section */}
      {blogs.length > 0 && (
        <section className="container mx-auto py-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">Blogs & Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {/* Collections Section */}
      {collections.length > 0 && (
        <section className="container mx-auto py-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      )}

      {/* Gifts Section */}
      {products.length > 0 && (
        <section className="container mx-auto py-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">Gifts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((edge) => (
              <ProductCard key={edge.node.id} product={edge.node} />
            ))}
          </div>
        </section>
      )}

      {/* Cash Funds Section */}
      {allCashFundProducts.length > 0 && (
        <section className="container mx-auto py-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">Cash Funds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCashFundProducts.map((product) => (
              <ProductCard key={product.id} product={product} isCashFund={true} />
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {totalResults === 0 && (
        <section className="container mx-auto py-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">No results found</h3>
          <p className="text-gray-600 mb-8">
            No products, cash funds, collections, or blogs match your search for "{searchQuery}". Try different keywords.
          </p>
        </section>
      )}

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
}

