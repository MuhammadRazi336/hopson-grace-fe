import React, {useState, useRef, useMemo, useEffect} from 'react';
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
import BackToTop from '~/components/BackToTop';
import RegistryProduct from '~/components/RegistryProduct';

const STYLE_OPTIONS = [
  {id: 'modern', label: 'Modern'},
  {id: 'classic', label: 'Classic'},
  {id: 'eclectic', label: 'Eclectic'},
  {id: 'shopAll', label: 'Shop All'},
];

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
  const fetcher = useFetcher();
  const [addingProductId, setAddingProductId] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    if (fetcher.state === 'idle') setAddingProductId(null);
  }, [fetcher.state]);

  // All brand products
  const productsEdges = collection?.products?.edges || [];

  // Sidebar categories: unique collections on these products, with metafield filters applied
  const sidebarCategories = useMemo(() => {
    const map = new Map();
    productsEdges.forEach((edge) => {
      const product = edge.node;
      const colEdges = product.collections?.edges || [];
      colEdges.forEach(({node}) => {
        if (!node || node.id === collection.id) return;
        // Exclude brand collections (separate rule)
        if (node.brandMetafield?.value === 'true') return;
        // Exclude when both ready_made and parent.collection are explicitly false
        if (
          node.readyMadeMetafield?.value === 'false' &&
          node.parentMetafield?.value === 'false'
        ) {
          return;
        }
        // Exclude ready-made registry collections (custom.ready_made === 'true')
        if (node.readyMadeMetafield?.value === 'true') return;
        if (!map.has(node.id)) {
          map.set(node.id, node.title);
        }
      });
    });
    return Array.from(map, ([id, title]) => ({id, title}));
  }, [productsEdges, collection.id]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [checkedStyles, setCheckedStyles] = useState(() =>
    STYLE_OPTIONS.reduce((acc, option) => ({...acc, [option.id]: false}), {}),
  );

  const handleStyleCheckbox = (id) => {
    setVisibleCount(INITIAL_VISIBLE);
    setCheckedStyles((prev) => {
      if (id === 'shopAll') {
        const nextShopAll = !prev.shopAll;
        return {
          modern: false,
          classic: false,
          eclectic: false,
          shopAll: nextShopAll,
        };
      }

      const next = {...prev, [id]: !prev[id], shopAll: false};
      return next;
    });
  };

  // Filter products by selected sidebar categories (collections)
  const filteredProducts = useMemo(() => {
    let list = productsEdges;

    if (selectedCategoryIds.length) {
      list = list.filter((edge) => {
        const product = edge.node;
        const colEdges = product.collections?.edges || [];
        return colEdges.some(
          ({node}) => node && selectedCategoryIds.includes(node.id),
        );
      });
    }

    const selectedStyleIds = STYLE_OPTIONS.filter(
      (option) => option.id !== 'shopAll' && checkedStyles[option.id],
    ).map((option) => option.id);

    if (!checkedStyles.shopAll && selectedStyleIds.length > 0) {
      list = list.filter((edge) => {
        const styleValue = edge.node?.styleMetafield?.value || '';
        const normalizedStyle = String(styleValue).trim().toLowerCase();
        return selectedStyleIds.includes(normalizedStyle);
      });
    }

    return list;
  }, [productsEdges, selectedCategoryIds, checkedStyles]);

  // Pagination for brand products
  const INITIAL_VISIBLE = 15;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const totalProductsCount = filteredProducts.length;
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const displayedProductsCount = visibleProducts.length;
  const hasMore = totalProductsCount > INITIAL_VISIBLE;
  const canLoadMore = visibleCount < totalProductsCount;

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

      setAddingProductId(product.id);
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
      <div ref={topRef} />

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
            className="mx-auto object-center object-cover h-full w-full"
            alt={collection.brandImageMetafield?.reference?.image?.altText || collection.image?.altText || collection.title}
          />
        </div>
      </div>

      <section className="px-[8.802vw] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-[6.302vw]">
          <SidebarFilter
            categories={sidebarCategories}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={(id) => {
              setVisibleCount(INITIAL_VISIBLE);
              setSelectedCategoryIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              );
            }}
            checkedStyles={checkedStyles}
            onStyleCheckbox={handleStyleCheckbox}
          />
          <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 pt-0 p-4 relative z-0">
            {visibleProducts.map((edge) => {
              const product = edge.node;
              const firstImage =
                product.images?.edges?.[0]?.node?.url ||
                '/assets/Images/placeholder.png';
              const firstVariant = product.variants?.edges?.[0]?.node;

              return (
                <RegistryProduct
                  key={product.id}
                  id={product.id}
                  image={firstImage}
                  productName={product.title}
                  price={firstVariant?.priceV2?.amount}
                  description={product.description}
                  productHandle={product.handle}
                  onAddToRegistry={(quantity) =>
                    handleAddToRegistry(product, quantity)
                  }
                  isLoggedIn={Boolean(user?.user?.id)}
                  isSubmitting={
                    addingProductId === product.id && fetcher.state !== 'idle'
                  }
                  brandName={collection.title || 'BRAND NAME'}
                />
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

            {hasMore && canLoadMore && (
              <WhiteThemeButton
                Text="View more"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + INITIAL_VISIBLE, totalProductsCount),
                  )
                }
              />
            )}

            <BackToTop topRef={topRef} />
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

function SidebarFilter({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  checkedStyles,
  onStyleCheckbox,
}) {
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
          <ul className="space-y-2 text-sm">
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat.id} className="mb-[1.69vw]">
                  <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                    <input
                      type="checkbox"
                      className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() => onToggleCategory(cat.id)}
                    />
                    {cat.title}
                  </label>
                </li>
              ))
            ) : (
              <li className="text-xs text-gray-500">No categories available</li>
            )}
          </ul>
        )}
      </div>

      <div>
        <h2
          className="text-sm font-bold uppercase mb-[2.031vw] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer flex items-center gap-[0.833vw]"
          onClick={() => toggleSection('styles')}
        >
          Shop by Style
          <span className="text-lg relative -top-[3px]">
            {openSections.styles ? (
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
        {openSections.styles && (
          <ul className="space-y-2 text-sm">
            {STYLE_OPTIONS.map((style) => (
              <li key={style.id} className="mb-[1.69vw]">
                <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                  <input
                    type="checkbox"
                    className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                    checked={checkedStyles[style.id]}
                    onChange={() => onStyleCheckbox(style.id)}
                  />
                  {style.label}
                </label>
              </li>
            ))}
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
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  parentMetafield: metafield(namespace: "parent", key: "collection") {
                    id
                    value
                  }
                  readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
                    id
                    value
                  }
                  brandMetafield: metafield(namespace: "custom", key: "brand") {
                    id
                    value
                  }
                }
              }
            }
            styleMetafield: metafield(namespace: "custom", key: "style") {
              id
              value
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
