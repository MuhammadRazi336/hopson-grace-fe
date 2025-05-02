import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {useState} from 'react';
import {useFetcher, useLoaderData, Link} from '@remix-run/react';
import {defer, redirect} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {requireAuth} from '~/utils/auth-guard.js';
import {extractShopifyId} from '~/utils/helpers.js';
import AddGift from './dashboard.giftdetail';

export async function loader({request, context}) {
  const {products} = await loadCriticalData({context});
  const {collections} = await loadCollectionData({context});
  const user = await requireAuth(context);
  const registry = context?.session?.get('@Registry');

  return defer({products, collections, user, registry});
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
    console.log(e, 'ERROR');
    return defer({e});
  }
}

async function loadCriticalData({context}) {
  const [{products}] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {
    products: products.edges,
  };
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

export default function AddGifts() {
  const options = [
    {label: 'Wedding Registry', value: 'wedding'},
    {label: 'Baby Registry', value: 'baby'},
    {label: 'Birthday Registry', value: 'birthday'},
  ];
  const [selected, setSelected] = useState({
    label: 'Wedding Registry',
    value: 'wedding',
  });

  const handleTileClick = (title) => {
    alert(`You clicked on ${title}`);
  };
  const {products, collections, registry} = useLoaderData();
  const fetcher = useFetcher();
  const handleAddtoRegistry = ({id, price, quantity}) => {
    const payload = {
      productId: id,
      amount: price,
      registryId: Number(registry[0].id),
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
    <div className="max-w-4xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
      <div className={'flex flex-row gap-4'}>
        <div className={'flex-1'}>
          <CustomSelect
            options={options}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
        <div className={'flex-1'}>
          <CustomSelect
            options={options}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
        <div className={'flex-1'}>
          <CustomSelect
            options={options}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
        <div className={'flex-1'}>
          <ButtonComponent className={'flex-1 w-full'} text={'Apply Filter'} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
      {products.map((productWrapper, index) => {
  const product = productWrapper.node;

  const firstImage = product?.images?.edges?.[0]?.node?.src || '/fallback-image.jpg'; // provide fallback image
  const firstVariant = product?.variants?.edges?.[0]?.node;

  if (!firstVariant) return null; // skip products without variants

  return (
    <Link key={index} to={`/dashboard/addgifts/${product.handle}`}>
      <RegistryProduct
        image={firstImage}
        productName={product.title}
        price={firstVariant.priceV2.amount}
        description={product.description}
        onAddToRegistry={(quantity, isGroupGift) =>
          handleAddtoRegistry({
            id: Number(extractShopifyId(product.id)),
            price: firstVariant.priceV2.amount,
            quantity,
          })
        }
        onGroupGiftTagChange={(isGroupGift) =>
          console.log(`Group Gift tag changed: ${isGroupGift}`)
        }
      />
    </Link>
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
nodes {
        description
        title
      }
    }
  }
`;
