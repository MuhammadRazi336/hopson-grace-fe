import {defer, useFetcher, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import CoupleProductCard from '~/components/CoupleProductCard';
import { useState, useRef } from 'react';
import { CoupleProfileViewHeader } from './couple.test._index';

const COLLECTION_QUERY = `#graphql
query {
  collections(first: 20) {
    nodes {
      id
      title
      description
      metafield(namespace: "parent", key: "collection") {
        key
        value
        namespace
        type
      }
    }
  }
}`;

export async function loader({ params, context }) {
  const coupleId = params.id;

  const response = await context.ClientGet(`registries/by-userId/${coupleId}`, context);
  const registryId = response.data[0]?.id;
  if (!response.data) throw new Response('Not Found', { status: 404 });

  const [res, cashRes, shopifyCollections] = await Promise.all([
    context.ClientGet(`registryProducts/${registryId}?type=gift`, context),
    context.ClientGet(`registryProducts/${registryId}?type=cash`, context),
    context.storefront.query(COLLECTION_QUERY),
  ]);

  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`
  );
  const products = await fetchProducts(context.storefront, ids);
  
  let mergedArray = [];
  if (res?.data?.length) {
    mergedArray = res.data.map((item1) => {
      const product = products?.nodes?.find(
        (item2) => item2?.id === `gid://shopify/Product/${item1.productId}`
      );
      let status = item1.isPurchased ? 'purchased' : item1.productTypeId === 2 ? 'cashFund' : 'addToCart';
      return {
        status,
        isCashFund: item1.productTypeId === 2 ? true : item1.isCashFund ?? false,
        availableForSale: product?.availableForSale ?? true,
        ...item1,
        ...(product || {}),
      };
    });
  }

  const cashFundProducts = Array.isArray(cashRes?.data)
    ? cashRes.data.map((item) => ({
        ...item,
        status: 'cashFund',
        isCashFund: true,
        availableForSale: true,
      }))
    : [];

  return defer({
    data: [...mergedArray, ...cashFundProducts],
    cashfundData: cashFundProducts,
    response,
    registryId,
    session: context.session,
    collections: shopifyCollections.collections.nodes,
  });
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const product = JSON.parse(formData.get('productData'));
    const amount = parseFloat(formData.get('amount'));
    const productTypeId = product.productTypeId;

    let existingCart = JSON.parse(context.session.get('cart') || '[]');

    const itemId =
      productTypeId === 2 ? product.cashFund.id : product.productId;

    const isProductInCart = existingCart.some(
      (item) => item.id === Number(itemId),
    );

    if (isProductInCart) {
      return new Response('This product is already in your cart.', {
        status: 409,
      });
    }

    const cartId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const hashedCartId = await hashCartId(cartId);

    // Only store minimal fields in the cart
    const updatedCart = [
      ...existingCart,
      {
        cartId: hashedCartId,
        id: Number(itemId),
        title: product.title || product.cashFund?.name,
        price: productTypeId === 2 ? amount : Number(product.amount),
        image: product.images?.edges?.[0]?.node?.url || product.cashFund?.image?.fileUrl || '',
        productTypeId: productTypeId,
        registryId: product.registryId,
      },
    ];
    // Optionally, limit cart length to avoid cookie overflow
    // if (updatedCart.length > 20) updatedCart = updatedCart.slice(-20);
    context.session.set('cart', JSON.stringify(updatedCart));
    return new Response(
      JSON.stringify({
        message:
          productTypeId === 2
            ? `Contribution of $${amount} added to ${product.title}.`
            : `${product.title} added to cart.`,
      }),
      {status: 200},
    );
  } catch (error) {
    return new Response('Internal Server Error', {status: 500});
  }
}

async function hashCartId(cartId) {
  const encoder = new TextEncoder();
  const data = encoder.encode(cartId);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

export default function CoupleProfile() {
  const { data, cashfundData, response, session, registryId, collections } =
    useLoaderData() || [];

  const [selectedCategory, setSelectedCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'
  const [cart, setCart] = useState([]); // local cart for duplicate check
  const [contributedCashFunds, setContributedCashFunds] = useState([]); // local cash fund contribution check

  console.log(data);
  //filter
  const filteredData = data
  .filter((product) => {
    if (selectedCategory) {
      const collectionTitles = product.collections?.nodes?.map((c) => c.title) || [];
      if (!collectionTitles.includes(selectedCategory)) return false;
    }

    if (availability) {
      // For cash fund items, they should always be considered "in stock"
      if (product.isCashFund) {
        return availability === 'in-stock';
      }

      // For regular products
      const isAvailable = product.availableForSale ?? true;
      const isPurchased = product.status === 'purchased';

      if (availability === 'in-stock') {
        return isAvailable && !isPurchased;
      }
      if (availability === 'out-of-stock') {
        return !isAvailable || isPurchased;
      }
    }

    return true; 
  })
  .sort((a, b) => {
    if (priceSort === 'low-to-high') {
      return (a.amount ?? 0) - (b.amount ?? 0);
    }
    if (priceSort === 'high-to-low') {
      return (b.amount ?? 0) - (a.amount ?? 0);
    }
    return 0;
  });

  const fetcher = useFetcher();
  const handleAddToCart = (productId) => {
    const product = data.find((item) => item.id === productId);

    if (!product) {
      setAlertMessage('Product not found.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }

    // Check if already in cart (by id)
    if (cart.includes(productId)) {
      setAlertMessage('Product is already in cart.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }

    fetcher.submit(
      {
        productId: product.id,
        productData: JSON.stringify({ ...product, registryId }),
      },
      { method: 'post' },
    );
    setCart((prev) => [...prev, productId]);
    setAlertMessage('Product added to cart!');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
  };

  const handleContribute = (productId, amount) => {
    const product = data.find((item) => item.id === productId);

    if (!product) {
      setAlertMessage('Product not found.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }

    // Check if already contributed to this cash fund in this session
    if (contributedCashFunds.includes(productId)) {
      setAlertMessage('You have already contributed to this cash fund.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }

    fetcher.submit(
      {
        productId: product.id,
        amount: amount,
        productData: JSON.stringify({
          ...product,
          registryId,
          productTypeId: 2,
        }),
      },
      { method: 'post' },
    );
    setContributedCashFunds((prev) => [...prev, productId]);
    setAlertMessage('Thank you for your contribution!');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
  };
  const childCollections = collections.filter(
    (collection) => collection.metafield?.value === "true"
  );
  return (
    <>
      {/* Alert Component */}
      {showAlert && (
        <div className={`fixed top-4 right-4 ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}>
          <div className="flex items-center">
            {alertType === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
            )}
            {alertType === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
      <CoupleProfileViewHeader />
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-52 max-h-52 rounded-full bg-gray-300 mb-4 flex items-center justify-center overflow-hidden">
              {/* Placeholder for couple's image */}
              <span className="text-gray-500">
                {response?.data[0]?.events[0]?.image?.fileUrl ? (
                  <img
                    src={response.data[0].events[0].image.fileUrl}
                    alt="Couple's Image"
                    className="w-full h-full max-w-full max-h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-500">No Image Available</span>
                )}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {response?.data[0]?.events[0]?.coupleName}
            </h2>
            <p className="text-gray-500 mb-6">
              {response?.data[0]?.events[0]?.hashtags}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
              <div>
                <span className="text-gray-500 font-medium">Event Date:</span>
                <p className="text-gray-700">{response?.data[0]?.events[0]?.eventDate}</p>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Wedding Time:</span>
                <p className="text-gray-700">{response?.data[0]?.events[0]?.weddingTime}</p>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Location:</span>
                <p className="text-gray-700">{response?.data[0]?.events[0]?.location}</p>
              </div>
              <div>
                <span className="text-gray-500 font-medium">City & Province/State:</span>
                <p className="text-gray-700">
                  {response?.data[0]?.events[0]?.city}, {response?.data[0]?.events[0]?.province}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-3">Couple Message for You</h3>
              <p className="text-gray-600 text-center italic">
                "{response?.data[0]?.events[0]?.welcomeMessage}"
              </p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Filter Registry Items</h3>
            <div className="flex gap-4 mt-4">
            <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
              >
                <option value="">Category</option>
                {childCollections.map((collection) => (
                  <option key={collection.id} value={collection.title}>
                    {collection.title}
                  </option>
                ))}
            </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2" onChange={(e) => setAvailability(e.target.value)} value={availability}>
                <option value="">Availability</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2" onChange={(e) => setPriceSort(e.target.value)} value={priceSort}>
                <option value="">Price</option>
                <option value="low-to-high">Low to High</option>
                <option value="high-to-low">High to Low</option>
              </select>
            </div>
          </div>

          {/* Registry Items Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Registry Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredData.map((product) => (
                <CoupleProductCard
                  key={product.id}
                  name={product.title || product.cashFund?.name || ''}
                  image={product.images?.edges[0]?.node?.url || product.cashFund?.image?.fileUrl || ''}
                  price={product.amount}
                  description={product.description || product.cashFund?.note || ''}
                  isGroupGift={product.isGroupPayment}
                  isCashFund={product.isCashFund}
                  status={product.status}
                  contributedAmount={Number(product.collectedAmount) || 0}
                  maxContribution={Number(product.amount) || 0}
                  onAddToCart={() => handleAddToCart(product.id)}
                  onContribute={(amount) => handleContribute(product.id, amount)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
