import {useLoaderData} from '@remix-run/react';
import {defer, redirect} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import GiftDetail from '~/components/GiftDetail';
export async function loader({request, context, params}) {
  const {collections} = await loadCollectionData({context});
  return defer({collections});
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(
      payload,
      'registryProducts',
      context,
    );
    return defer({response});
  } catch (e) {
    return defer({e});
  }
}

async function loadCollectionData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {
    collections: collections.nodes,
  };
}

const GiftDetailHandle = () => {
  const handleTileClick = (title) => {
    alert(`You clicked on ${title}`);
  };
  const {collections} = useLoaderData();

  return (
    <div>
      <GiftDetail
        productTitle="Product One"
        productPrice={11}
        productDescription="Hello"
        productImages={[1, 2, 3]}
      />
      <div className="max-w-6xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
        <div>This Page should be Addgift Handle</div>

        <div className="pt-6 font-sans">
          {/* Heading */}
          <h2 className="text-2xl font-semibold mb-6">
            Browse Curated Collectionssada
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
      </div>
    </div>
  );
};

export default GiftDetailHandle;

const COLLECTION_QUERY = `#graphql
query {
collections(first: 10) {
nodes {
        description
        title
      }
    }
  }
`;
