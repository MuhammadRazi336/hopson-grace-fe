import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {useState, useEffect} from 'react';
import {useFetcher, useLoaderData, Link} from '@remix-run/react';
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
import {formatShopifyPrice} from '~/utils/priceFormatter';
import WeThinkYoullLove from '~/components/WeThinkYoullLove';
import WeThinkYouLove from '~/components/WeThinkYouLove';

const images = [
    '/assets/Images/gift-prod-1.png',
    '/assets/Images/gift-prod-2.png',
    '/assets/Images/gift-prod-3.png',
    '/assets/Images/gift-prod-1.png', // Reuse to make 4 images
  ];

export async function loader(args) {
  try {
    const {context, params} = args;
    const {collections} = await loadCollectionData({context});
    const {product, vendorProducts} = await loadProductData(args);
    
    // Fetch recommended products
    let recommendedProducts = [];
    try {
      const {products: recommendedProductsData} = await context.storefront.query(
        RECOMMENDED_PRODUCTS_BY_COLLECTION_QUERY,
        {
          variables: {first: 40},
        },
      );

      const currentCollectionIds = new Set(
        (product?.collections?.nodes || []).map((c) => c.id),
      );

      recommendedProducts = (recommendedProductsData?.edges || [])
        .filter((edge) => {
          const node = edge?.node;
          if (!node || node.handle === params?.handle) return false;

          if (currentCollectionIds.size === 0) return true;

          const nodeCollectionIds = (node.collections?.nodes || []).map(
            (c) => c.id,
          );
          return nodeCollectionIds.some((id) => currentCollectionIds.has(id));
        })
        .slice(0, 8);
    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
    
    // Try to get user, but don't require authentication
    let user = null;
    let registry = null;
    
    try {
      user = await requireAuth(context);
      if (user && user.user && user.user.id) {
        registry = await context.ClientGet(
          `registries/by-userId/${user.user.id}`,
          context,
        );
      }
    } catch (authError) {
      // User is not logged in, continue without user data
      console.log('User not authenticated, allowing access to product page');
    }
    
    return defer({collections, product, user, registry, recommendedProducts, vendorProducts});
  } catch (error) {
    console.error('Error in dashboard.addgifts.$handle loader:', error);
    throw error;
  }
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
  const isExcludedFundsCollection = (collection) => {
    const title = String(collection?.title || '')
      .toUpperCase()
      .trim();
    return title === 'CASH FUNDS' || title === 'TRAVEL FUNDS';
  };

  const filteredCollections = collections.nodes.filter(
    (collection) =>
      collection.readyMadeMetafield?.value !== 'true' &&
      collection.parentMetafield?.value === 'true' &&
      !isExcludedFundsCollection(collection),
  );
  return {
    collections: filteredCollections,
  };
}
async function loadProductData({context, params, request}) {
  try {
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
    
    if (!productByHandle) {
      throw new Error(`Product with handle "${handle}" not found`);
    }
    
    // Fetch products from the same vendor
    let vendorProducts = [];
    if (productByHandle.vendor) {
      try {
        const { products: vendorProductsData } = await storefront.query(VENDOR_PRODUCTS_QUERY, {
          variables: { 
            vendor: `vendor:${productByHandle.vendor}`
          }
        });
        // Filter out the current product and limit to 6 products
        vendorProducts = (vendorProductsData?.edges || [])
          .filter(edge => edge.node.handle !== handle)
          .slice(0, 6);
        console.log('Vendor products loaded:', vendorProducts);
      } catch (error) {
        console.error('Error loading vendor products:', error);
      }
    }
    
    return {
      product: productByHandle,
      vendorProducts,
    };
  } catch (error) {
    console.error('Error loading product data:', error);
    throw error;
  }
}

const GiftDetailHandle = () => {
  const fetcher = useFetcher();
  const {collections, product, registry, user, recommendedProducts, vendorProducts} = useLoaderData();
  const [isAdding, setIsAdding] = useState(false);

  console.log('Product data:', product);
  console.log('Product variants:', product?.variants);
  console.log('Product priceRange:', product?.priceRange);
  console.log('Vendor products:', vendorProducts);

  const brandProfileHandle =
    product?.collections?.nodes?.find(
      (col) => col?.brandMetafield?.value === 'true' && col?.handle,
    )?.handle || 'hopson-grace';

  const handleAddtoRegistry = ({id, price, quantity, isGroupPayment}) => {
    // Check if user is logged in
    if (!user || !user.user || !user.user.id) {
      // User not logged in, redirect to login
      window.location.href = '/login';
      return;
    }
    
    // Check if registry exists
    if (!registry || !registry.data || !registry.data[0] || !registry.data[0].id) {
      console.error('No registry found. Please create a registry first.');
      return;
    }
    
    const payload = {
      productId: id,
      amount: Number(price),
      registryId: Number(registry.data[0].id),
      productTypeId: 1,
      quantity,
      isGroupPayment: isGroupPayment || false
    };
    setIsAdding(true);

    fetcher.submit(
      {payload: JSON.stringify(payload)},
      {
        method: 'post',
        encType: 'application/json',
      },
    );
  };

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setIsAdding(false);
    }
  }, [fetcher.state]);
  return (
    <>
    <div className="flex flex-col lg:flex-row mx-auto px-[9.167vw] pt-[7.031vw] gap-8">
          {/* Images Grid */}
          <div className=" grid grid-cols-1  gap-4 flex-1">
          <GiftDetail
        key={product.id}
        productTitle={product.title}
        productPrice={product.variants?.edges?.[0]?.node?.priceV2 || product.priceRange?.minVariantPrice || {amount: '0', currencyCode: 'USD'}}
        productDescription={product.descriptionHtml}
        productImages={product.images.edges}
        variants={product.variants?.edges?.map((e) => e.node) ?? []}
        onRegistryPress={({quantity, isGroupGift, variant}) => {
          const v = variant || product.variants?.edges?.[0]?.node;
          const price =
            v?.priceV2?.amount ||
            product.priceRange?.minVariantPrice?.amount ||
            0;
          handleAddtoRegistry({
            id: Number(extractShopifyId(product.id)),
            price: Number(price),
            quantity,
            isGroupPayment: isGroupGift,
          });
        }}
        isLoggedIn={user && user.user && user.user.id}
        isAdding={isAdding}
        productBrand={product?.vendor || 'Hopson Grace'}
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

        <section className="mt-[9.74vw] bg-[#446184] text-white ">
          <div className="mx-auto flex flex-col lg:flex-row lg:items-center gap-24 py-[5.7vw] px-[7.5vw] max-[1024px]:gap-8 max-[1024px]:px-4 max-[1024px]:py-10">
            {/* Left Text Section */}
            <div className="lg:w-4/12 w-full flex items-center flex-col gap-2">
              <p className="text-[22px] max-[1024px]:text-[14px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] tracking-wider uppercase pb-1">
                Meet the Maker
              </p>
              <img
                src={'/assets/Images/meet-the-maker-bdr.png'}
                alt=""
                className="w-auto lg:w-[18.594vw] xl:w-[18.594vw] 2xl:w-[18.594vw]"
              />
              <h5 className="text-[40px] max-[1024px]:text-[32px] lg:leading-[42px] xl:leading-[42px] 2xl:leading-[42px] prata my-[1.042vw] text-center">
                {product?.vendor || 'Hopson Grace'}
              </h5>
              <p className="text-[18px] font-[400] max-[1024px]:text-[16px] lg:leading-[28px] xl:leading-[28px] 2xl:leading-[28px] text-center mb-0">
                {product?.descriptionHtml ? 
                  product.descriptionHtml.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
                  'Lorem ipsum dolor sit amet. Ab nesciunt officia qui labore unde 33 veniam reprehenderit ut impedit perspiciatis in magnam accusantium est ratione dignissimos qui dolor internos. Sit laboriosam rerum est minima provident eos doloremque omnis.'
                }
              </p>
              <Link to={`/brand/${brandProfileHandle}`}>
                <button className="text-white border-b pt-2 pb-1 text-[14px] lg:leading-[1.354vw] xl:leading-[1.354vw] 2xl:leading-[1.354vw] font-semibold uppercase tracking-wide hover:text-gray-300 transition-colors cursor-pointer">
                  View Full Profile
                </button>
              </Link>
            </div>
            <section className="lg:w-[66.7%] w-full  container ">
              <div className="relative items-start max-[1024px]:my-10">
                <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
                  <div className="swiper-button-prev-prod absolute top-[40%] -translate-y-1/2 h-[40px] left-[-7vw] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px] z-10 max-[1024px]:left-[-7px]"> 
                    <img src={nextitem} className="invert rotate-90 lg:w-[1.042vw] xl:w-[1.042vw] 2xl:w-[1.042vw]" alt="" />
                    <span className="-rotate-90 text-white block lg:text-[1.146vw] tracking-wider max-[1024px]:hidden">
                      more
                    </span>
                  </div>
                  <Swiper
                    spaceBetween={39}
                    slidesPerView={3}
                    modules={[Navigation, Pagination]}
                    navigation={{
                      nextEl: '.swiper-button-next-prod',
                      prevEl: '.swiper-button-prev-prod',
                    }}
                    className=""
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
                        spaceBetween: 36,
                      },
                      1440: {
                        slidesPerView: 4,
                        spaceBetween: 36,
                      },
                      1600: {
                        slidesPerView: 3,
                        spaceBetween: 36,
                      },
                    }}
                  >
                    {/* Debug info */}
                    {console.log('Rendering vendor products:', vendorProducts)}
                    {vendorProducts && vendorProducts.length > 0 ? (
                      vendorProducts.map((productEdge) => {
                        const vendorProduct = productEdge.node;
                        const firstImage = vendorProduct.images?.edges?.[0]?.node;
                        const price = vendorProduct.priceRange?.minVariantPrice;
                        
                        return (
                          <SwiperSlide key={vendorProduct.id}>
                            <Link to={`/dashboard/addgifts/${vendorProduct.handle}`} className="cursor-pointer">
                              <img
                                src={firstImage?.url || '/assets/Images/placeholder.png'}
                                alt={vendorProduct.title}
                                className="w-full h-full hover:opacity-80 transition-opacity aspect-square"
                              />
                              <h3 className="mt-2.5 lg:mt-[0.885vw] text-white uppercase lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] text-sm leading-6 font-medium tracking-wider hover:text-white transition-colors">
                                {vendorProduct.title}
                              </h3>
                              <p className="lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm pt-[6px] text-white">
                                {formatShopifyPrice(price)}
                              </p>
                            </Link>
                          </SwiperSlide>
                        );
                      })
                    ) : (
                      // Fallback to static products if no vendor products - make them clickable
                      <>
                        <SwiperSlide>
                          <Link to="/dashboard/addgifts/classic-tumbler-set" className="cursor-pointer">
                            <img
                              src={product1}
                              alt="Marble Butter Keeper"
                              className="w-[345px] h-[345px] hover:opacity-80 transition-opacity"
                            />
                            <h3 className="mt-2.5 lg:mt-[0.885vw] text-white uppercase lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] text-sm font-medium tracking-wider hover:text-gray-600 transition-colors">
                              CLASSIC TUMBLER, SET OF 6
                            </h3>
                            <p className="lg:text-[1.25vw] text-white xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm pt-[6px]">$80.00</p>
                          </Link>
                        </SwiperSlide>
                        <SwiperSlide>
                          <Link to="/dashboard/addgifts/farmhouse-bowl" className="cursor-pointer">
                            <img
                              src={product2}
                              alt="Belle-V Icecream Scoop"
                              className="w-[345px] h-[345px] hover:opacity-80 transition-opacity"
                            />
                            <h3 className="mt-2.5 lg:mt-[0.885vw] text-white uppercase lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] text-sm font-medium tracking-wider hover:text-gray-600 transition-colors">
                              FARMHOUSE BOWL 11"
                            </h3>
                            <p className="lg:text-[1.25vw] text-white xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm pt-[6px]">$95.00</p>
                          </Link>
                        </SwiperSlide>
                        <SwiperSlide>
                          <Link to="/dashboard/addgifts/raw-honey" className="cursor-pointer">
                            <img
                              src={product3}
                              alt="Staub Cast Iron Q4"
                              className="w-[345px] h-[345px] hover:opacity-80 transition-opacity"
                            />
                            <h3 className="mt-2.5 lg:mt-[0.885vw] text-white uppercase lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] text-sm font-medium tracking-wider hover:text-gray-600 transition-colors">
                              RAW HONEY
                            </h3>
                            <p className="lg:text-[1.25vw] text-white xl:text-[1.25vw] 2xl:text-[1.25vw] text-sm pt-[6px]">$430.00</p>
                          </Link>
                        </SwiperSlide>
                      </>
                    )}
                  </Swiper>
                  <div className="swiper-button-next-prod absolute top-[40%] -translate-y-1/2 h-[40px] right-[-7vw] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px] z-10 max-[1024px]:right-[-7px]">
                    <span className="rotate-90 text-white block lg:text-[1.146vw] tracking-wider max-[1024px]:hidden">
                      more
                    </span>
                    <img src={nextitem} className="invert rotate-270 lg:w-[1.042vw] xl:w-[1.042vw] 2xl:w-[1.042vw]" alt="" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <div className="pt-[9.375vw]">
          <ExploreCategories collections={collections} />
        </div>

        {/* <section className="pt-[9.375vw] pb-[9.375vw] my-12 lg:my-[240px] container">
          <Heading
            text="you might also like"
            classes={
              'prata text-3xl lg:text-[2.083vw] xl:text-[2.083vw] 2xl:text-[2.083vw] lg:leading-[1.875vw] font-normal text-center  max-[1024px]:m-0'
            }
            image={brandline}
            imageClasses={'max-[1024px]:max-w-[330px] lg:w-[19.896vw] xl:w-[19.896vw] 2xl:w-[19.896vw]'}
          />
          <ProductSlider products={recommendedProducts || []} />
           <div className="text-center">
            <ButtonComponent
              text="browse bestsellers"
              className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
            />
          </div>
        </section> */}
      {/* <WeThinkYoullLove recommendedProducts={recommendedProducts} className="mt-[9.375vw]" /> */}
      <WeThinkYouLove recommendedProducts={recommendedProducts} className="mt-[9.375vw]" />
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
    handle
    vendor
    descriptionHtml
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          priceV2 {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
        }
      }
    }
    collections(first: 30) {
      nodes {
        id
        handle
        brandMetafield: metafield(namespace: "custom", key: "brand") {
          value
        }
      }
    }
  }
}`;

const VENDOR_PRODUCTS_QUERY = `#graphql
query getProductsByVendor($vendor: String!) {
  products(first: 8, query: $vendor) {
    edges {
      node {
        id
        title
        handle
        vendor
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
      }
    }
  }
}`;

const RECOMMENDED_PRODUCTS_BY_COLLECTION_QUERY = `#graphql
query GetRecommendedProductsByCollection($first: Int!) {
  products(first: $first, query: "tag:recommended") {
    edges {
      node {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        collections(first: 30) {
          nodes {
            id
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
    collections(first: 250, sortKey: UPDATED_AT, reverse: true) {
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