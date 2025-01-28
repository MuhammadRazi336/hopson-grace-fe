import React , {useState} from 'react';
import {defer} from '@remix-run/server-runtime';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import {useLoaderData} from '@remix-run/react';
import CoupleProductCard from '~/components/CoupleProductCard';

export async function loader({request, context}) {
  const registry = context?.session?.get('@Registry');
  const res = await context.ClientGet(
    `registryProducts/${registry[0].id}?type=gift`,
    context,
  );
  const cashRes = await context.ClientGet(
    `registryProducts/${registry[0].id}?type=cash`,
    context,
  );
  let mergedArray = [];
  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`,
  );
  const products = await fetchProducts(context.storefront, ids);

  if (res?.data?.length) {
    mergedArray = res?.data?.map((item1) => {
      // Find the corresponding product from array2
      const product = products.nodes.find(
        (item2) => item2.id === `gid://shopify/Product/${item1.productId}`,
      );

      // If a matching product is found, merge its details into the current item
      if (product) {
        return {
          ...item1,
          ...product,
        };
      }
      return item1; // If no matching product, return the original item
    });
  }
  return defer({
    data: mergedArray,
    cashfundData: cashRes?.data || [],
    registry,
  });
}
export default function CoupleProfile() {
  const data = useLoaderData();
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Product One',
      price: '$499.99',
      description: 'A premium product with excellent features.',
      isGroupGift: true,
      isCashFund: false,
      status: 'groupGift',
      maxContribution: 500,
      contributedAmount: 100,
    },
    {
      id: 2,
      name: 'Product Two',
      price: '$49.99',
      description: 'An affordable and reliable product.',
      isGroupGift: false,
      isCashFund: false,
      status: 'addToCart',
    },
    {
      id: 3,
      name: 'Product Three',
      price: '$199.99',
      description: 'Help contribute to this amazing product.',
      isGroupGift: false,
      isCashFund: true,
      status: 'cashFund',
      maxContribution: 200,
      contributedAmount: 50,
    },
    {
      id: 4,
      name: 'Product Four',
      price: '$29.99',
      description: 'This product has already been purchased.',
      isGroupGift: false,
      isCashFund: false,
      status: 'purchased',
    },
  ]);

  const handleAddToCart = (productId) => {
    alert(`Product ${productId} added to cart!`);
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
            <span className="text-gray-500">Image Placeholder</span>
          </div>
          <h2 className="text-2xl font-bold">Couple Name</h2>
          <p className="text-gray-500">#CoupleHashtag</p>
          <p className="text-gray-600 mt-2">
            January 1, 2025 2pm | Whispering Pines Event Centre
            <br />
            Calgary, Alberta, Canada
          </p>
          <h3 className="text-lg font-semibold mt-4">Welcome Message</h3>
          <p className="text-gray-600 text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
            {products.map((product) => (
              <CoupleProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                description={product.description}
                isGroupGift={product.isGroupGift}
                isCashFund={product.isCashFund}
                status={product.status}
                contributedAmount={product.contributedAmount || 0}
                maxContribution={product.maxContribution || 0}
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
