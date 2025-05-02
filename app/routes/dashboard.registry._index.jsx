import Accordiance from '~/components/Accordiance.jsx';
import ProductCard from '~/components/Product.jsx';
import FundCard from '~/components/FundCard.jsx';
import {defer} from '@remix-run/server-runtime';
import {Link, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';

export async function loader({ request, context }) {
  const registry = context?.session?.get('@Registry');

  if (!registry || !registry.events || registry.events.length === 0) {
    throw new Response('Registry or Events not found', { status: 404 });
  }

  const eventId = registry.events.id;
  if (!eventId) {
    throw new Response('Event ID not found', { status: 404 });
  }

  const eventGet = await context.ClientGet(
    `events/${eventId}`,
    context,
  );

  const res = await context.ClientGet(
    `registryProducts/${registry.id}?type=gift`,
    context,
  );
  const cashRes = await context.ClientGet(
    `registryProducts/${registry.id}?type=cash`,
    context,
  );

  let mergedArray = [];
  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`,
  );
  const products = await fetchProducts(context.storefront, ids);

  if (res?.data?.length) {
    mergedArray = res?.data?.map((item1) => {
      const product = products.nodes.find(
        (item2) => item2.id === `gid://shopify/Product/${item1.productId}`,
      );
      if (product) {
        return {
          ...item1,
          ...product,
        };
      }
      return item1;
    });
  }

  return defer({
    data: mergedArray,
    cashfundData: cashRes?.data || [],
    eventGet,
    registry,
  });
}

const index = () => {
  const {data, cashfundData, eventGet, registry} = useLoaderData();

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 border border-gray-300 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Registry Homepage</h1>
      <div className="flex flex-col space-x-4 md:flex-row">
        <div className="flex-1 h-64 bg-gray-300 rounded-lg">
          <div className="h-64"></div>
        </div>
        <div className="flex-1 mt-4 lg:mt-0">
          <h2 className="text-xl font-semibold">
            {eventGet?.data?.coupleName}
          </h2>
          <p className="text-gray-600">{eventGet?.data?.hashtags}</p>
          <p className="text-gray-600 mt-2">
            {eventGet?.data?.eventDate} {eventGet?.data?.weddingTime} |{' '}
            {eventGet?.data?.location} <br />
            {eventGet?.data?.province}, {eventGet?.data?.city}
          </p>
          <h3 className="text-lg font-semibold mt-4">Welcome Message</h3>
          <p className="text-gray-600">{eventGet?.data?.welcomeMessage}</p>
          <div className="mt-4 flex space-x-2">
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              Share Registry
            </button>
            
  <Link to={`/dashboard/registry/${registry.events.id}`}>
    <div className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
      Edit Registry Page
    </div>
  </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-300 pt-4 border-b">
        <Accordiance
          title="Selected Wedding Registry Gifts"
          ContentComponent={() => <ProductPage data={data} />}
        />
      </div>

      <div className="mt-4 border-t border-gray-300 pt-4 border-b">
        <Accordiance
          title="Selected Wedding Cash Funds"
          ContentComponent={() => <FundPage data={cashfundData} />}
        />
      </div>
    </div>
  );
};

export default index;
const ProductPage = ({data}) => {
  return (
    <div className="container p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((product) => (
          <ProductCard
            key={product.id}
            productName={product.title}
            productImage={product.images.edges[0].node.src}
            price={product.variants.edges[0].node.price}
            collected={product.collectedAmount}
            isGroupGift={product.isGroupGift}
            onContributorsClick={() =>
              console.log(`Contributors for ${product.productName}`)
            }
          />
        ))}
      </div>
    </div>
  );
};
const FundPage = ({data}) => {
  // Dummy data for the funds

  // Function to handle view contributors button click
  const handleViewContributors = (fundName) => {
  };

  return (
    <div className="flex justify-center items-start flex-wrap p-4 bg-gray-100">
      {data.map((fund) => (
        <FundCard
          key={fund.productId} // Use a unique key for each card
          title={fund.cashFund.name}
          totalAmount={fund.amount}
          collectedAmount={fund.collectedAmount}
          onViewContributors={() => handleViewContributors(fund.cashFund.name)}
        />
      ))}
    </div>
  );
};
