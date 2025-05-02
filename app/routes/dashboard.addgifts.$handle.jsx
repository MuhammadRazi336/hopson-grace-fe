import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {useState} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {defer, redirect} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {requireAuth} from '~/utils/auth-guard.js';
import {extractShopifyId} from '~/utils/helpers.js';
import GiftDetail from '~/components/GiftDetail';
export async function loader(args) {
  const {request, context} = args;
  const {collections} = await loadCollectionData({context});
  const {product} = await loadProductData(args);
  const user = await requireAuth(context);
  const registry = context?.session?.get('@Registry');
  return defer({collections, product, user, registry});
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
async function loadProductData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }
  const [{productByHandle}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle},
    }),
  ]);
  return {
    product: productByHandle,
  };
}

const GiftDetailHandle = () => {
  const fetcher = useFetcher();
  const {collections, product, registry} = useLoaderData();
  const handleTileClick = (title) => {
    alert(`You clicked on ${title}`);
  };
  const handleAddtoRegistry = ({id, price, quantity}) => {
    const payload = {
      productId: id,
      amount: Number(price),
      registryId: Number(registry.id),
      productTypeId: 1,
      quantity,
    };
    fetcher.submit(
      {payload}, // Send data as key-value pairs
      {
        method: 'post',
        encType: 'application/json',
      },
    );
  };
  return (
    <div>
      <GiftDetail
        productTitle={product.title}
        productPrice={product.variants.edges[0].node.price}
        productDescription={product.description}
        productImages={product.images.edges}
        onRegistryPress={({quantity}) => {
          handleAddtoRegistry({
            id: Number(extractShopifyId(product.id)),
            price: product.variants.edges[0].node.price.amount,
            quantity,
          });
        }}
      />
      <div className="max-w-6xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
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

const PRODUCT_QUERY = `#graphql
query getProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    descriptionHtml
    description
    images(first:10) {
            edges {
            node {
            id
            src
            }
            }
            }
    variants(first: 10) {
      edges {
        node {
          id
          title
           price {
      amount
      currencyCode
    }
        }
      }
    }
  }
}`;
// const PRODUCT_QUERY = `graphql
// query getProductByIdentifier($value: String!) {
//   products(first: 10, query: $value) {
//     edges {
//       node {
//         id
//         title
//          descriptionHtml
//     description
//     images(first:10) {
//             edges {
//             node {
//             id
//             src
//             }
//             }
//             }
//         variants(first: 10){
//           nodes{
//             price
//           }
//         }
//       }
//     }
//   }
// }
// `;
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
