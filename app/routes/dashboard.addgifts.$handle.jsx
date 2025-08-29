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
import { Footer } from '~/components/Footer';
import ProductSlider from '~/components/ProductSlider';
import Heading from '~/components/Heading';
import ExploreCategories from '~/components/ExploreCategories';
import { Swiper, SwiperSlide } from 'swiper/react';
import brandline from '/assets/Images/brandline.png';
import nextitem from '/assets/Images/next.png';
import product3 from '/assets/Images/product3.png';
import product2 from '/assets/Images/product2.png';
import product1 from '/assets/Images/product1.png';
import product4 from '/assets/Images/product4.png';
import {Navigation, Pagination} from 'swiper/modules';

const images = [
    '/assets/Images/gift-prod-1.png',
    '/assets/Images/gift-prod-2.png',
    '/assets/Images/gift-prod-3.png',
    '/assets/Images/gift-prod-1.png', // Reuse to make 4 images
  ];

export async function loader(args) {
  const {request, context} = args;
  const {collections} = await loadCollectionData({context});
  const {product} = await loadProductData(args);
  const user = await requireAuth(context);
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );
  return defer({collections, product, user, registry});
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
  const filteredCollections = collections.nodes.filter(collection => 
    collection.readyMadeMetafield?.value !== 'true' && 
    collection.parentMetafield?.value === 'true'
  );
  return {
    collections: filteredCollections,
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const handleTileClick = (title) => {
    alert(`You clicked on ${title}`);
  };
  const handleAddtoRegistry = ({id, price, quantity, isGroupPayment}) => {
    const payload = {
      productId: id,
      amount: Number(price),
      registryId: Number(registry.data[0].id),
      productTypeId: 1,
      quantity,
      isGroupPayment: isGroupPayment || false
    };
    fetcher.submit(
      {payload: JSON.stringify(payload)},
      {
        method: 'post',
        encType: 'application/json',
      },
    );
    setAlertMessage('Gift has been added to your registry!');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
  };
  return (
    <>
    {showAlert && (
      <div
        className={`fixed top-4 right-4 ${
          alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}
      >
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
    <div className="flex container flex-col lg:flex-row max-w-screen-xl mx-auto px-4 py-12 gap-8">
          {/* Images Grid */}
          <div className=" grid grid-cols-1  gap-4 flex-1">
          <GiftDetail
        productTitle={product.title}
        productPrice={product.variants.edges[0].node.price}
        productDescription={product.description}
        productImages={product.images.edges}
        onRegistryPress={({quantity, isGroupGift}) => {
          handleAddtoRegistry({
            id: Number(extractShopifyId(product.id)),
            price: product.variants.edges[0].node.price.amount,
            quantity,
            isGroupPayment: isGroupGift
          });
        }}
      />
          </div>

          {/* <div className="flex-1 ml-4 flex flex-col pt-10 xl:pr-12 pr-0">
            <h2 className="text-lg font-medium uppercase ">Hopson Grace</h2>
            <h1 className="xl:text-4xl text-3xl m-0 mb-3 prata font-normal tracking-wider">
              marble butter keeper
            </h1>
            <p className="text-3xl mt-3 mb-1 font-medium tracking-wider">$80.00</p>

            <div className="flex items-center gap-4 mb-4 mt-6 xl:flex-nowrap flex-wrap">
              <span className="font-medium text-xl">QTY</span>
              <div className="flex flex-col items-center">
                <button className="text-lg leading-none">▲</button>
                <span className="my-1">
                  <input
                    type="number"
                    className="w-12 text-4xl text-center border-none pr-1"
                    value={1}
                  />
                </span>
                <button className="text-lg leading-none">▼</button>
              </div>
              <button class="bg-[#446184] text-white text-lg font-bold py-4 px-8">
                ADD TO REGISTRY
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="border rounded-full w-6 h-6 flex items-center justify-center text-sm"
                />
                <p className="text-md text-center">
                  {' '}
                  Tag as <br /> Group Gift
                </p>
              </div>
            </div>

            <div className=" text-xl mt-6">
              <p>
                Keep your butter spreadable and fresh in this butter keeper, a
                French invention when refrigeration didn't exist. Marble
                naturally keeps butter cool, and the French naturally know their
                way around the kitchen.
              </p>

              <p className="mt-4 mb-2 font-semibold">How it works:</p>
              <p className="text-xl">
                Fill your butter keeper with 1/4&quot; cold water to keep butter
                soft. Change water every 3–5 days to keep butter fresh.
              </p>

              <p className="mt-4 mb-2 font-semibold">Details:</p>
              <p>H 4.25&quot; | 4&quot; DIA</p>
            </div>
          </div> */}
        </div>

        <section className="bg-[#446184] text-white py-12 px-6">
          <div className="container mx-auto flex flex-col lg:flex-row gap-10 items-center">
            {/* Left Text Section */}
            <div className="lg:w-4/12 w-full flex items-center flex-col gap-2">
              <p className="text-[22px] tracking-wider uppercase   pb-1">
                Meet the Maker
              </p>
              <img
                src={'/assets/Images/meet-the-maker-bdr.png'}
                alt=""
                className="w-auto -mt-3"
              />
              <h5 className="text-[40px] prata  mb-1">hopson grace</h5>
              <p className="text-xl uppercase mb-4">Toronto</p>
              <p className="text-xl leading-[1.7] text-center mb-6">
                Lorem ipsum dolor sit amet. Ab nesciunt officia qui labore unde
                33 veniam reprehenderit ut impedit perspiciatis in magnam
                accusantium est ratione dignissimos qui dolor internos. Sit
                laboriosam rerum est minima provident eos doloremque omnis.
              </p>
              <button className=" text-white border-b px-4 pt-2 pb-1 text-sm font-semibold uppercase tracking-wide">
                View Full Profile
              </button>
            </div>
            <section className="lg:w-8/12 w-full  container ">
              <div className="relative items-start mt-[105px] mb-10 max-[1024px]:my-10 mr-8">
                <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
                  <Swiper
                    spaceBetween={39}
                    slidesPerView={3}
                    modules={[Navigation, Pagination]}
                    navigation={{
                      nextEl: '.swiper-button-next-prod',
                      prevEl: '.swiper-button-prev-prod',
                    }}
                    className="px-[178px]"
                    style={{}}
                    loop={true}
                    breakpoints={{
                      345: {
                        slidesPerView: 1,
                        spaceBetween: 5,
                      },
                      475: {
                        slidesPerView: 2,
                        spaceBetween: 19,
                      },
                      768: {
                        slidesPerView: 2,
                        spaceBetween: 19,
                      },
                      1366: {
                        slidesPerView: 3,
                        spaceBetween: 19,
                      },
                      1440: {
                        slidesPerView: 4,
                        spaceBetween: 19,
                      },
                      1600: {
                        slidesPerView: 3,
                        spaceBetween: 19,
                      },
                    }}
                  >
                    <SwiperSlide>
                      <img
                        src={product1}
                        alt="Marble Butter Keeper"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        CLASSIC TUMBLER, SET OF 6
                      </h3>
                      <p className="lg:text-2xl text-sm">$80</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product2}
                        alt="Belle-V Icecream Scoop"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        FARMHOUSE BOWL 11"
                      </h3>
                      <p className="lg:text-2xl text-sm">$95</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product3}
                        alt="Staub Cast Iron Q4"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        RAW HONEY
                      </h3>
                      <p className="lg:text-2xl text-sm">$430</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product3}
                        alt="Staub Cast Iron Q4"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        RAW HONEY
                      </h3>
                      <p className="lg:text-2xl text-sm">$430</p>
                    </SwiperSlide>
                    <SwiperSlide>
                      <img
                        src={product2}
                        alt="Belle-V Icecream Scoop"
                        className="w-full"
                      />
                      <h3 className="mt-2.5 lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                        FARMHOUSE BOWL 11"
                      </h3>
                      <p className="lg:text-2xl text-sm">$95</p>
                    </SwiperSlide>
                  </Swiper>
                  <div className="swiper-button-next-prod absolute top-[45%] z-10 -right-16  cursor-pointer uppercase flex items-center justify-center text-white">
                    <span className="rotate-90 text-white block tracking-wider max-[1024px]:hidden">
                      more
                    </span>
                    <img src={nextitem} className="invert-100" alt="" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <div className="py-[120px] px-12">
          <ExploreCategories collections={collections} />
        </div>

        <section className="py-[70px]  my-12 lg:my-[240px] container">
          <Heading
            text="you might also like"
            classes={
              'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
            }
            image={brandline}
            imageClasses={'max-[1024px]:max-w-[330px]'}
          />
          <ProductSlider />
          <div className="text-center">
            <ButtonComponent
              text="browse bestsellers"
              className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
            />
          </div>
        </section>
      <Footer />
    </>






    // <div>
    //   <GiftDetail
    //     productTitle={product.title}
    //     productPrice={product.variants.edges[0].node.price}
    //     productDescription={product.description}
    //     productImages={product.images.edges}
    //     onRegistryPress={({quantity}) => {
    //       handleAddtoRegistry({
    //         id: Number(extractShopifyId(product.id)),
    //         price: product.variants.edges[0].node.price.amount,
    //         quantity,
    //       });
    //     }}
    //   />
    //   <div className="max-w-6xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
    //     <div className="pt-6 font-sans">
    //       {/* Heading */}
    //       <h2 className="text-2xl font-semibold mb-6">
    //         Browse Curated Collectionssada
    //       </h2>
    //       {/* Grid Layout */}
    //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    //         {collections.map((col) => (
    //           <CategoryTile
    //             key={col.title}
    //             title={col.title}
    //             onClick={() => handleTileClick(col.title)}
    //           />
    //         ))}
    //       </div>

    //       {/* See More Button */}
    //       <div className="flex justify-center">
    //         <button
    //           className="bg-black text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-gray-800"
    //           onClick={() => alert('See More clicked')}
    //         >
    //           See More
    //         </button>
    //       </div>
    //     </div>
    //     <div className="pt-6 font-sans">
    //       {/* Heading */}
    //       <h2 className="text-2xl font-semibold mb-6">Browse By Categories</h2>
    //       {/* Grid Layout */}
    //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    //         {collections.map((col) => (
    //           <CategoryTile
    //             key={col.title}
    //             title={col.title}
    //             onClick={() => handleTileClick(col.title)}
    //           />
    //         ))}
    //       </div>

    //       {/* See More Button */}
    //       <div className="flex justify-center">
    //         <button
    //           className="bg-black text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-gray-800"
    //           onClick={() => alert('See More clicked')}
    //         >
    //           See More
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
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
    collections(first: 50) {
      nodes {
        description
        title
        id
        image {
          id
          url
          altText
          width
          height
        }
          readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
          id
          value
        }
        parentMetafield: metafield(namespace: "parent", key: "collection") {
          id
          value
        }
        subMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
        }
        products(first: 10){
          edges {
            node {
              id
              title
              handle
              description
              images(first: 10) {
                edges {
                  node {
                    id
                    url
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
    }
  }
`;