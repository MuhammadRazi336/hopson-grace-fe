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

  // Defensive: parse image if it's a string
  if (eventGet?.data?.image && typeof eventGet.data.image === 'string') {
    try {
      eventGet.data.image = JSON.parse(eventGet.data.image);
    } catch {
      eventGet.data.image = null;
    }
  }

  let res, cashRes;
  try {
    res = await context.ClientGet(
      `registryProducts/${registry.id}?type=gift`,
      context,
    );
  } catch (e) {
    res = { data: [] };
  }
  try {
    cashRes = await context.ClientGet(
      `registryProducts/${registry.id}?type=cash`,
      context,
    );
  } catch (e) {
    cashRes = { data: [] };
  }

  let mergedArray = [];
  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`,
  );
  const productsResult = await fetchProducts(context.storefront, ids);
  const products = productsResult || { nodes: [] };
  const productNodes = Array.isArray(products.nodes) ? products.nodes : [];

  if (res?.data?.length && productNodes.length > 0) {
    mergedArray = res.data.map((item1) => {
      const product = productNodes.find(
        (item2) => item2 && item2.id === `gid://shopify/Product/${item1.productId}`,
      );
      // Ensure numeric fields are numbers
      const amount = item1.amount !== undefined ? Number(item1.amount) : undefined;
      const collectedAmount = item1.collectedAmount !== undefined ? Number(item1.collectedAmount) : undefined;
      if (product) {
        return {
          ...item1,
          ...product,
          amount,
          collectedAmount,
        };
      }
      return {
        ...item1,
        amount,
        collectedAmount,
      };
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
        <div className="flex-1 h-64 bg-gray-300 rounded-lg flex items-center justify-center">
          {/* Event image preview */}
          {(() => {
            const imageObj = eventGet?.data?.image;
            const imageUrl = imageObj?.fileUrl || 'https://www.dummyimage.co.uk';
            return (
              <img
                src={imageUrl}
                alt={eventGet?.data?.coupleName || 'Event'}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                onError={e => { e.target.onerror = null; e.target.src = 'https://www.dummyimage.co.uk'; }}
              />
            );
          })()}
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
        {data.map((product) => {
          // Use priceV2 from Shopify, fallback to backend amount
          const priceObj = product.variants?.edges?.[0]?.node?.priceV2;
          const price =
            priceObj && priceObj.amount && priceObj.currencyCode
              ? { amount: priceObj.amount, currencyCode: priceObj.currencyCode }
              : (product.amount ? { amount: product.amount, currencyCode: 'USD' } : null);
          return (
            <ProductCard
              key={product.id || product.productId || Math.random()}
              productName={product.title || 'No Name'}
              productImage={
                product.images?.edges?.[0]?.node?.url || 'https://www.dummyimage.co.uk'
              }
              price={price && price.amount && price.currencyCode ? price : { amount: 0, currencyCode: 'USD' }}
              collected={typeof product.collectedAmount === 'number' ? product.collectedAmount : 0}
              isGroupGift={!!product.isGroupGift}
              onContributorsClick={() =>
                console.log(`Contributors for ${product.productName || 'Unknown'}`)
              }
            />
          );
        })}
      </div>
    </div>
  );
};
const FundPage = ({data}) => {
  // Defensive: handle missing or malformed data
  if (!Array.isArray(data)) return <div>No funds available.</div>;

  const handleViewContributors = (fundName) => {
    // ...
  };

  return (
    <div className="flex justify-center items-start flex-wrap p-4 bg-gray-100">
      {data.map((fund) => (
        <FundCard
          key={fund.productId || Math.random()}
          image={fund.cashFund.image?.fileUrl}
          title={fund.cashFund?.name || 'No Fund Name'}
          totalAmount={typeof fund.amount === 'number' ? fund.amount : 0}
          collectedAmount={typeof fund.collectedAmount === 'number' ? fund.collectedAmount : 0}
          onViewContributors={() => handleViewContributors(fund.cashFund?.name || 'Unknown')}
        />
      ))}
    </div>
  );
};
