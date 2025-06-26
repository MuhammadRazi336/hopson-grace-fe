import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {useState} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {defer, json} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {requireAuth} from '~/utils/auth-guard.js';
import {extractShopifyId} from '~/utils/helpers.js';

export async function loader({request, context}) {
  const {products} = await loadCriticalData({context});
  const {collections} = await loadCollectionData({context});
  const user = await requireAuth(context);
  const registry = context?.session?.get('@Registry');
  console.log(registry, 'REGISTRY');

  return defer({products, collections, user, registry});
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
    console.log(e, 'ERROR');
    return json({success: false, error: e.message}, {status: 400});
  }
}

async function loadCriticalData({context}) {
  const token = process.env.PUBLIC_STOREFRONT_API_TOKEN || context.env?.PUBLIC_STOREFRONT_API_TOKEN;
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

export default function AddGifts() {
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [dateSort, setDateSort] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'

  const {products, collections, registry} = useLoaderData();
  const fetcher = useFetcher();

  const handleAddtoRegistry = (product) => {
    try {
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

      console.log('Sending payload:', payload); // Add this for debugging

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

  // Filter the products based on selected filters
  const filteredProducts = products.filter((productWrapper) => {
    const product = productWrapper.node;
    const firstVariant = product?.variants?.edges?.[0]?.node;

    if (!firstVariant) return false;

    if (availability) {
      const isAvailable = firstVariant.availableForSale;
      if (availability === 'in-stock' && !isAvailable) return false;
      if (availability === 'out-of-stock' && isAvailable) return false;
    }

    return true;
  }).sort((a, b) => {
    const priceA = Number(a.node.variants.edges[0].node.priceV2.amount);
    const priceB = Number(b.node.variants.edges[0].node.priceV2.amount);
    const createdAtA = new Date(a.node.createdAt).getTime();
    const createdAtB = new Date(b.node.createdAt).getTime();

    if (priceSort === 'low-to-high') return priceA - priceB;
    if (priceSort === 'high-to-low') return priceB - priceA;
    if (dateSort === 'newest') return createdAtB - createdAtA;
    if (dateSort === 'oldest') return createdAtA - createdAtB;

    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
      {/* Alert Component */}
      {showAlert && (
        <div className={`fixed top-4 right-4 ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}>
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

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Filter Registry Items</h3>
        <div className="flex gap-4 mt-4">
          {/* <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setAvailability(e.target.value)}
            value={availability}
          >
            <option value="">Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select> */}
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setPriceSort(e.target.value)}
            value={priceSort}
          >
            <option value="">Price</option>
            <option value="low-to-high">Low to High</option>
            <option value="high-to-low">High to Low</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setDateSort(e.target.value)}
            value={dateSort}
          >
            <option value="">Sort by Date</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {filteredProducts.map((productWrapper, index) => {
          const product = productWrapper.node
          const firstImage = product?.images?.edges?.[0]?.node?.src || '/fallback-image.jpg';
          const firstVariant = product?.variants?.edges?.[0]?.node;

          if (!firstVariant) return null;

          return (
            <div key={index} className="cursor-pointer">
              <RegistryProduct
                image={firstImage}
                productName={product.title}
                price={firstVariant.priceV2.amount}
                description={product.description}
                onAddToRegistry={() => handleAddtoRegistry(product)}
                onGroupGiftTagChange={(isGroupGift) =>
                  console.log(`Group Gift tag changed: ${isGroupGift}`)
                }
              />
            </div>
          );
        })}
      </div>

      <div className="pt-6 font-sans">
        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-6">
          Browse Curated Collections
        </h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {collections.map((col) => (
            <CategoryTile
              key={col.title}
              title={col.title}
              onClick={() => handleTileClick(col.title)}
            />
          ))}
        </div>

        {/* See More Button */}
        <div className="flex justify-center">
          <button
            className="bg-black text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-gray-800"
            onClick={() => alert('See More clicked')}
          >
            See More
          </button>
        </div>
      </div>
      <div className="pt-6 font-sans">
        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-6">Browse By Categories</h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {collections.map((col) => (
            <CategoryTile
              key={col.title}
              title={col.title}
              onClick={() => handleTileClick(col.title)}
            />
          ))}
        </div>

        {/* See More Button */}
        <div className="flex justify-center">
          <button
            className="bg-black text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-gray-800"
            onClick={() => alert('See More clicked')}
          >
            See More
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
    </div>
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
collections(first: 10) {
node {
        description
        title
      }
    }
  }
`;

// Export metadata for Remix
export const meta = () => {
  return [
    { title: "Add Gifts to Registry" },
    { name: "description", content: "Add gifts to your registry" },
  ];
};

// Export handle for Remix
export const handle = {
  hydrate: true,
};
