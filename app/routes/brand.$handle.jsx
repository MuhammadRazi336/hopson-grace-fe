import React, {useState} from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import {useLoaderData, json, useFetcher, Link} from '@remix-run/react';

import WhiteThemeButton from '~/components/WhiteThemeButton';
import {extractShopifyId} from '~/utils/helpers.js';
import Marquee from '~/components/Marquee';
import ButtonComponent from '~/components/Button';
import lineImg4 from '/assets/Images/Vector 14.png';
import {formatPrice} from '~/utils/priceFormatter';

export async function loader({params, context}) {
  const {handle} = params;

  const user = context?.session?.get('@User');

  if (!handle) {
    throw new Response('Not Found', {status: 404});
  }

  try {
    const [{collection}, {collections: brandCollections}] = await Promise.all([
      context.storefront.query(BRAND_QUERY, {
        variables: {handle},
      }),
      context.storefront.query(BRANDS_FOR_MARQUEE_QUERY),
    ]);

    if (!collection) {
      throw new Response('Not Found', {status: 404});
    }

    // Only fetch registry data if user is logged in
    let registry = null;
    if (user && user.user && user.user.id) {
      try {
        registry = await context.ClientGet(
          `registries/by-userId/${user.user.id}`,
          context,
        );
      } catch (error) {
        console.log('Error fetching registry:', error);
        // Continue without registry data
      }
    }

    // Filter brand collections for the marquee
    const brands =
      brandCollections?.nodes?.filter(
        (collection) => collection.metafield?.value === 'true',
      ) || [];

    return json({collection, registry, brands, user});
  } catch (error) {
    throw new Response('Not Found', {status: 404});
  }
}

export async function action({request, context}) {
  try {
    const body = await request.json();
    const {payload} = body;

    const response = await context.ClientPost(
      JSON.parse(payload),
      'registryProducts',
      context,
    );

    return json({success: true, response});
  } catch (e) {
    return json({success: false, error: e.message}, {status: 400});
  }
}

const Brand = () => {
  const {collection, registry, brands, user} = useLoaderData();
  const [quantities, setQuantities] = useState({});
  const fetcher = useFetcher();

  // Calculate displayed products count and total
  const displayedProductsCount = collection?.products?.edges?.length || 0;
  // For now, show the displayed count. In a real scenario, you'd need to get total from API
  // or implement proper pagination with total count
  const totalProductsCount = collection?.products?.pageInfo?.hasNextPage 
    ? `${displayedProductsCount}+` // Show + if there are more pages
    : displayedProductsCount;

  const handleAddToRegistry = async (product, selectedQuantity) => {
    try {
      // Check if user is logged in - check both session data and localStorage
      if (!user || !user.user || !user.user.id) {
        // No user found, redirect to login
        window.location.href = '/login';
        return;
      }

      const firstVariant = product?.variants?.edges?.[0]?.node;
      if (!firstVariant) {
        setAlertMessage('Product variant not found.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      // Check if registry exists and has an ID
      if (!registry || !registry.data || !registry.data[0] || !registry.data[0].id) {
        setAlertMessage('Registry not found. Please create a registry first.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      // Prepare the payload for adding to registry
      const payload = {
        productId: Number(extractShopifyId(product.id)),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry.data[0].id),
        productTypeId: 1,
        quantity: selectedQuantity,
        note: '',
        isGroupGift: false,
      };

      // Submit to action using fetcher
      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );
    } catch (error) {
      setAlertMessage('Failed to add to registry. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    }
  };

  return (
    <section>
      <Header />
      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-[510px] lg:h-[27.083vw] max-[1024px]:h-[300px] flex flex-row items-center justify-center">
        <div className="w-[50%] h-full bg-[#F5F2ED] relative">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%]">
            <Heading
              text={collection.title}
              classes={
                'prata text-4xl lg:text-[2.29vw] lowercase lg:leading-[1.88vw] font-normal text-center max-[1024px]:m-0 lg:mb-[0.833vw] text-black'
              }
              image={lineImghead}
              imageClasses={'w-[150px] lg:w-[22.14vw]'}
            />
            <p className="text-base lg:w-[28.54vw] lg:max-w-[100%] sm:text-lg lg:text-[1.354vw] lg:leading-[1.98vw] text-black leading-relaxed mx-auto mt-[3.75vw]">
              {collection.description}
            </p>
          </div>
        </div>
        <div className="w-[50%] h-full flex items-center justify-center">
          <img
            src={collection.brandImageMetafield?.reference?.image?.url || collection.image?.url || '/assets/Images/dreamFunds.png'}
            className="mx-auto object-contain object-center"
            alt={collection.brandImageMetafield?.reference?.image?.altText || collection.image?.altText || collection.title}
          />
        </div>
      </div>

      <section className="px-[8.802vw] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-[6.302vw]">
          <SidebarFilter />
          <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 pt-0 p-4 relative z-0">
            {collection.products?.edges?.map((edge) => {
              const product = edge.node;
              const firstImage =
                product.images?.edges?.[0]?.node?.url ||
                '/assets/Images/placeholder.png';
              const firstVariant = product.variants?.edges?.[0]?.node;
              const price = formatPrice(firstVariant?.priceV2?.amount);

              return (
                <div key={product.id} className="relative group h-[25vw]">
                  {/* Product Image and Info */}
                  <div className="p-4 z-10 relative">
                    <Link to={`/dashboard/addgifts/${product.handle}`}>
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="w-full h-[300px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <h3 className="text-sm font-[500] lg:text-[1.146vw] uppercase mt-3 cursor-pointer hover:text-gray-600 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm mt-1">{price}</p>
                    </Link>
                  </div>

                  {/* Expanding Overlay */}
                  <div className="absolute inset-0 z-40 bg-[#FAF9F6] lg:h-[35.313vw] px-[2.24vw] py-[2vw] flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
                    <Link to={`/dashboard/addgifts/${product.handle}`} className="hover:no-underline">
                      <div>
                        <img
                          src={firstImage}
                          alt={product.title}
                          className="w-full h-[220px] mx-auto object-cover mb-0 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <h4 className="text-xs font-[400] lg:text-[0.833vw] lg:leading-[0.833vw] uppercase lg:mt-[1.25vw] lg:mb-[0.521vw] text-left mb-1">
                          {collection.title || 'BRAND NAME'}
                        </h4>
                        <h3 className="text-sm lg:text-[1.146vw] lg:leading-[1.146vw] line-clamp-2 font-[500] uppercase text-left leading-snug cursor-pointer hover:text-gray-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm mt-2 lg:mt-[0.677vw] lg:text-[1.25vw] lg:leading-[1.25vw] text-left">{price}</p>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between mt-[3.906vw]">
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-around w-full mb-4">
                        <p className="text-xs font-bold uppercase text-left mb-1">
                          QTY
                        </p>
                        {/* Quantity Selector */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() =>
                              setQuantities((prev) => ({
                                ...prev,
                                [product.id]: (prev[product.id] || 1) + 1,
                              }))
                            }
                            className="flex items-center justify-center bg-white transition-colors"
                          >
                            <img
                              src="/assets/Images/arrowDown.png"
                              className="w-3 h-3 rotate-180"
                              alt=""
                            />
                          </button>

                          <input
                            value={quantities[product.id] || 1}
                            className="w-16 h-8 text-center border-none outline-none text-sm"
                            readOnly
                          />

                          <button
                            onClick={() =>
                              setQuantities((prev) => ({
                                ...prev,
                                [product.id]: Math.max(
                                  1,
                                  (prev[product.id] || 1) - 1,
                                ),
                              }))
                            }
                            className="flex items-center justify-center bg-white transition-colors"
                          >
                            <img
                              src="/assets/Images/arrowDown.png"
                              className="w-3 h-3"
                              alt=""
                            />
                          </button>
                        </div>

                        {/* Add to Registry Button */}
                        <button
                          onClick={() =>
                            handleAddToRegistry(
                              product,
                              quantities[product.id] || 1,
                            )
                          }
                          disabled={fetcher.state === 'submitting'}
                          className={`text-white text-xs lg:text-[0.729vw] cursor-pointer lg:h-[4.01vw] lg:w-[10.156vw] font-bold py-[5px] px-[5px] ${
                            fetcher.state === 'submitting'
                              ? 'bg-[#1F1D1B] cursor-not-allowed'
                              : 'bg-[#446184] hover:bg-[#2c4a6b] transition-colors duration-200'
                          }`}
                        >
                          {fetcher.state === 'submitting' ? (
                            'ADDED!'
                          ) : (
                            'ADD TO REGISTRY'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) || []}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-md lg:text-[0.938vw] lg:leading-[0.938vw] mt-[8.073vw] mb-[2.083vw]">
              LOADING {displayedProductsCount} of {totalProductsCount}
            </p>

            <WhiteThemeButton Text="View more" link="/quick-start-guide" />

            <button className="border-b-2 mx-auto cursor-pointer mb-0 font-bold bg-white text-black uppercase px-0 mt-0 lg:text-[0.938vw] lg:leading-[0.938vw] text-sm">
              Back to Top
            </button>
          </div>
        </div>
      </section>

      <section className="pt-[5.26vw] pb-[3.49vw] bg-[#F5F2ED80] my-12 lg:my-[7.083vw]">
        <Heading
          text="other brands we think you’ll love"
          classes={
            'prata text-3xl lg:text-[2.083vw] lg:leading-[1.875vw] font-normal text-center  max-[1024px]:m-0'
          }
          image={lineImg4}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[25.625vw] lg:h-[0.370vw]'}
        />
        <Marquee brands={brands} />
        <div className="text-center">
          <Link to="/our-brands">
            <ButtonComponent
              text="EXPLORE ALL BRANDS"
              className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] lg:text-[0.938vw] lg:leading-[0.938vw] py-4 lg:py-[5px] lg:w-[18.75vw] lg:h-[4.01vw] bg-transparent rounded-none mt-2 lg:mt-11"
            />
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>

      <Footer />
    </section>
  );
};

export default Brand;

function SidebarFilter() {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    styles: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full xl:w-3/12 px-[1.979vw] py-[2.5vw] h-fit bg-[#FAF9F6]">
      <div className="mb-6">
        <h2
          className="text-sm font-bold uppercase mb-[2.031vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
          onClick={() => toggleSection('categories')}
        >
          Categories
          <span className="text-lg relative -top-[3px]">
            {openSections.categories ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-[0.833vw] h-[0.833vw] rotate-180"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-[0.833vw] h-[0.833vw]"
              />
            )}
          </span>
        </h2>
        {openSections.categories && (
          <ul className="space-y-2 text-sm lg:text-[0.833vw] lg:leading-[0.938vw]">
            <li>
              <label className='flex items-center'>
                <input type="checkbox" className="mr-2 lg:mr-[0.885vw] lg:w-[1.25vw] lg:h-[1.25vw]" />
                HONEYMOON
              </label>
            </li>
            <li>
              <label className='flex items-center'>
                <input type="checkbox" className="mr-2 lg:mr-[0.885vw] lg:w-[1.25vw] lg:h-[1.25vw]" />
                HOME
              </label>
            </li>
            <li>
              <label className='flex items-center'>
                <input type="checkbox" className="mr-2 lg:mr-[0.885vw] lg:w-[1.25vw] lg:h-[1.25vw]" />
                DATE NIGHTS
              </label>
            </li>
            <li>
              <label className='flex items-center'>
                <input type="checkbox" className="mr-2 lg:mr-[0.885vw] lg:w-[1.25vw] lg:h-[1.25vw]" />
                LOREM IPSUM
              </label>
            </li>
            <li>
              <label className='flex items-center'>
                <input type="checkbox" className="mr-2 lg:mr-[0.885vw] lg:w-[1.25vw] lg:h-[1.25vw]" />
                LOREM IPSUM
              </label>
            </li>
            <li>
              <label className='flex items-center'>
                <input type="checkbox" className="mr-2 lg:mr-[0.885vw] lg:w-[1.25vw] lg:h-[1.25vw]" />
                LOREM IPSUM
              </label>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

const BRAND_QUERY = `#graphql
  query getBrand($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        id
        url
        altText
        width
        height
      }
      metafield(namespace: "custom", key: "brand") {
        id
        value
      }
      brandImageMetafield: metafield(namespace: "custom", key: "brand_image") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      products(first: 20) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
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
                  altText
                  width
                  height
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
`;

const BRANDS_FOR_MARQUEE_QUERY = `#graphql
query getBrandsForMarquee {
  collections(first: 250) {
    nodes {
      id
      title
      handle
      description
      image {
        id
        url
        altText
        width
        height
      }
      metafield(namespace: "custom", key: "brand") {
        id
        value
      }
    }
  }
}`;
