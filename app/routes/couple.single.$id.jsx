import {defer, useFetcher, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import CoupleProductCard from '~/components/CoupleProductCard';

export async function loader({params, context}) {
  const coupleId = params.id;
  const response = await context.ClientGet(
    `registries/by-userId/${coupleId}`,
    context,
  );

  const registryId = response.data[0]?.id;

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
        let status;
        if (item1.isPurchased) {
          status = 'purchased';
        } else if (item1.productTypeId === 2) {
          status = 'cashFund';
        } else {
          status = 'addToCart';
        }

        return {
          status,
          isCashFund:
            item1.productTypeId === 2 ? true : item1.isCashFund ?? false,
          ...item1,
          ...product,
        };
      }
      return {
        ...item1,
        isCashFund:
          item1.productTypeId === 2 ? true : item1.isCashFund ?? false,
      };
    });
  }

  const cashFundProducts = Array.isArray(cashRes?.data)
    ? cashRes.data.map((item) => ({
        ...item,
        status: 'cashFund',
        isCashFund: true,
      }))
    : [];

  return defer({
    data: [...mergedArray, ...cashFundProducts],
    cashfundData: cashFundProducts,
    response,
    registryId,
    session: context.session,
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

    const updatedCart = [
      ...existingCart,
      {
        cartId: hashedCartId,
        id: Number(itemId),
        title: product.title,
        price: productTypeId === 2 ? amount : Number(product.amount),
        image: product.images?.[0]?.src || '',
        productTypeId: productTypeId,
        registryId: product.registryId,
      },
    ];
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
  const {data, cashfundData, response, session, registryId} =
    useLoaderData() || [];
  const fetcher = useFetcher();
  const handleAddToCart = (productId) => {
    const product = data.find((item) => item.id === productId);

    if (product) {
      fetcher.submit(
        {
          productId: product.id,
          productData: JSON.stringify({...product, registryId}),
        },
        {method: 'post'},
      );
    } else {
      alert('Product not found.');
    }
  };

  const handleContribute = (productId, amount) => {
    const product = data.find((item) => item.id === productId);

    if (product) {
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
        {method: 'post'},
      );
    } else {
      alert('Product not found.');
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <div className="w-52 h-52 rounded-full bg-gray-300 mb-4 flex items-center justify-center">
            {/* Placeholder for couple's image */}
            <span className="text-gray-500">
              {response?.data[0]?.events[0]?.image?.fileUrl ? (
                <img
                  src={response.data[0].events[0].image.fileUrl}
                  alt="Couple's Image"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-gray-500">No Image Available</span>
              )}
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
            {response?.data[0]?.events[0]?.weddingTime}|{' '}
            {response?.data[0]?.events[0]?.location}
            <br />
            {response?.data[0]?.events[0]?.province},{' '}
            {response?.data[0]?.events[0]?.city}
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
  );
}
