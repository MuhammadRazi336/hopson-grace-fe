import React from 'react';
import {defer, useFetcher, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import CoupleProductCard from '~/components/CoupleProductCard';

export async function loader({params, context}) {
  const coupleId = params.id;
  const token = context?.session?.get('@User')?.accessToken;

  if (!token) {
    throw new Response('Unauthorized', {status: 401});
  }

  const response = await context.ClientGet(
    `registries/by-userId/${coupleId}`,
    context,
  );

  if (!response.data) {
    throw new Response('Not Found', {status: 404});
  }

  const registry = context?.session?.get('@Registry');

  const res = await context.ClientGet(
    `registryProducts/${response?.data[0]?.id}?type=gift`,
    context,
  );
  const cashRes = await context.ClientGet(
    `registryProducts/${response?.data[0]?.id}?type=cash`,
    context,
  );

  let mergedArray = [];
  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`,
  );

  const products = await fetchProducts(context.storefront, ids);

  if (res?.data?.length) {
    mergedArray = res?.data?.map((item1) => {
      const product = products?.nodes?.find(
        (item2) => item2?.id === `gid://shopify/Product/${item1.productId}`,
      );

      if (product) {
        return {
          ...item1,
          ...product,
          status: item1.isPurchased
            ? 'purchased'
            : item1.isGroupPayment
            ? 'groupGift'
            : 'addToCart',
        };
      }
      return item1;
    });
  }

  return defer({
    data: [...mergedArray, ...cashRes?.data],
    cashfundData: cashRes?.data || [],
    response,
    session: context.session,
  });
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const productId = formData.get('productId');
    const existingCart = JSON.parse(context.session.get('cart') || '[]');

    const isProductInCart = existingCart.some((item) => item.id === productId);

    if (!isProductInCart) {
      const product = JSON.parse(formData.get('productData'));

      if (product) {
        const cartId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        const hashedCartId = await hashCartId(cartId);

        const productId = product.id.split('/').pop();

        const updatedCart = [
          ...existingCart,
          {
            cartId: hashedCartId,
            id: Number(productId),
            title: product.title,
            price: Number(product.amount),
            image: product.images?.[0]?.src || '',
          },
        ];
        context.session.set('cart', JSON.stringify(updatedCart));
        return new Response(
          JSON.stringify({message: `${product.title} added to cart.`}),
          {status: 200},
        );
      }

      return new Response('Product not found.', {status: 404});
    }

    return new Response('This product is already in your cart.', {status: 409});
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
  const {data, cashfundData, response, session} = useLoaderData() || [];
  const fetcher = useFetcher();
  const handleAddToCart = (productId) => {
    const product = data.find((item) => item.id === productId);

    if (product) {
      fetcher.submit(
        {
          productId: product.id,
          productData: JSON.stringify(product), // Pass the product details
        },
        {method: 'post'}, // Send the data to the `action` function
      );
    } else {
      alert('Product not found.');
    }
  };

  const handleContribute = (productId, amount) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              contributedAmount: product.contributedAmount + parseFloat(amount),
            }
          : product,
      ),
    );
    alert(`You contributed $${amount} to Product ${productId}!`);
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <div className="w-52 h-52 rounded-full bg-gray-300 mb-4 flex items-center justify-center">
            {/* Placeholder for couple's image */}
            <span className="text-gray-500">
              {response?.data[0]?.events[0]?.image}
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            {response?.data[0]?.events[0]?.coupleName}
          </h2>
          <p className="text-gray-500">
            {response?.data[0]?.events[0]?.hashtags}
          </p>
          <p className="text-gray-600 mt-2">
            {response?.data[0]?.events[0]?.eventDate}{' '}
            {response?.data[0]?.events[0]?.weddingTime}| Whispering Pines Event
            Centre
            <br />
            Calgary, Alberta, Canada
          </p>
          <h3 className="text-lg font-semibold mt-4">Welcome Message</h3>
          <p className="text-gray-600 text-center">
            {response?.data[0]?.events[0]?.welcomeMessage}
          </p>
        </div>

        {/* Filter Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Filter Registry Items</h3>
          <div className="flex gap-4 mt-4">
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Category</option>
              <option value="kitchen">Kitchen</option>
              <option value="decor">Decor</option>
              <option value="electronics">Electronics</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Availability</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-4 py-2">
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
            {data.map((product) => (
              <CoupleProductCard
                key={product.id}
                name={product.name}
                price={product.amount}
                description={product.description}
                isGroupGift={product.isGroupPayment}
                isCashFund={product.isCashFund}
                status={product.status}
                contributedAmount={product.collectedAmount || 0}
                maxContribution={product.amount || 0}
                onAddToCart={() => handleAddToCart(product.id)}
                onContribute={(amount) => handleContribute(product.id, amount)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
