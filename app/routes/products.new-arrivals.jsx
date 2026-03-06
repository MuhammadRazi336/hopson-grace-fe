import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {useState, useEffect, useRef} from 'react';
import {Link, useFetcher, useLoaderData, useNavigate} from '@remix-run/react';
import {defer, json} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {extractShopifyId} from '~/utils/helpers.js';
import PreviewRegistry from '~/components/PreviewRegistry';
import {Swiper, SwiperSlide} from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-2.png';
import product1 from '/assets/Images/gift-img-collection-3.png';
import product4 from '/assets/Images/gift-img-collection-4.png';
import youll1 from '/assets/Images/youll-1.png';
import youll2 from '/assets/Images/youll-2.png';
import youll3 from '/assets/Images/youll-3.png';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import CustomTab from '~/components/CustomTab';
import brandline from '/assets/Images/brandline.png';
import ProductSlider from '~/components/ProductSlider';
import {Footer} from '~/components/Footer';
import {Navigation} from 'swiper/modules';
import {Header} from '~/components/Header';
import ExploreCategories from '~/components/ExploreCategories';
import NewInBg from '/assets/Images/newin.png';
import AlertPortal from '~/components/AlertPortal';

const isExcludedFundsCollection = (col) => {
  const t = (col.title && String(col.title).toUpperCase().trim()) || '';
  return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
};

const isParentForSidebar = (col) =>
  col.parentMetafield?.value === 'true' &&
  col.readyMadeMetafield?.value !== 'true' &&
  !isExcludedFundsCollection(col);

const STYLE_ORDER = ['MODERN', 'CLASSIC', 'ECLECTIC'];

function SidebarFilter({
  collections,
  checkedCollectionIds,
  setCheckedCollectionIds,
  shopAllChecked,
  setShopAllChecked,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    styles: true,
  });

  const parentCollections = collections.filter(isParentForSidebar);
  const subCollections = STYLE_ORDER.map((styleTitle) =>
    collections.find(
      (col) =>
        col.parentMetafield?.value === 'false' &&
        col.readyMadeMetafield?.value !== 'true' &&
        String(col.title || '').toUpperCase().trim() === styleTitle,
    ),
  ).filter(Boolean);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSidebarCheckbox = (colId) => {
    setShopAllChecked(false);
    if (checkedCollectionIds.includes(colId)) {
      setCheckedCollectionIds((prev) => prev.filter((id) => id !== colId));
      return;
    }
    setCheckedCollectionIds((prev) => [...prev, colId]);
  };

  return (
    <div className="w-full lg:w-[19.031vw] xl:w-[19.031vw] 2xl:w-[19.031vw] py-[2.865vw] px-[1.979vw] h-fit bg-[#FAF9F6]">
      <div className="mb-6">
        <h2
          className="text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
          onClick={() => toggleSection('categories')}
        >
          Product Categories
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
            {parentCollections.map((col) => (
              <li key={col.id} className="mb-[1.69vw]">
                <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                  <input
                    type="checkbox"
                    className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                    checked={checkedCollectionIds.includes(col.id)}
                    onChange={() => handleSidebarCheckbox(col.id)}
                  />
                  {col.title}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2
          className="text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
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
            {subCollections.map((col) => (
              <li key={col.id} className="mb-[1.69vw]">
                <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                  <input
                    type="checkbox"
                    className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                    checked={checkedCollectionIds.includes(col.id)}
                    onChange={() => handleSidebarCheckbox(col.id)}
                  />
                  {col.title}
                </label>
              </li>
            ))}
            <li className="mb-[1.69vw]">
              <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                <input
                  type="checkbox"
                  className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                  checked={shopAllChecked}
                  onChange={() => {
                    setShopAllChecked((prev) => !prev);
                    setCheckedCollectionIds([]);
                  }}
                />
                Shop All
              </label>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

const tabsData = [
  {
    label: 'REAL REGISTRIES',
    value: 1,
    route: 'realregistries',
  },
  {
    label: 'THEMED REGISTRIES',
    value: 2,
    route: 'themedregistries',
  },
  {
    label: 'LOREM IPSUM',
    value: 3,
    route: 'lorem',
  },
];

const NEW_ARRIVALS_PRODUCTS_QUERY = `#graphql
  query GetNewArrivalsProducts($first: Int!) {
    products(first: $first, query: "tag:new-arrival", sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          createdAt
          images(first: 1) {
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
                priceV2 {
                  amount
                  currencyCode
                }
                compareAtPriceV2 {
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
    collections(first: 250) {
      nodes {
        description
        title
        id
        handle
        image {
          id
          url
          altText
          width
          height
        }
        parentMetafield: metafield(namespace: "parent", key: "collection") {
          id
          value
        }
        subMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
        }
          readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
          id
          value
        }
        products(first: 250){
          edges {
            node {
              id
              title
              handle
              description
              createdAt
              images(first: 1) {
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
                    priceV2 {
                      amount
                      currencyCode
                    }
                    compareAtPriceV2 {
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

export async function loader({request, context}) {
  const {products} = await loadCriticalData({context});
  const {collections} = await loadCollectionData({context});
  const user = await context?.session?.get('@User');
  
  // Only fetch registry if user is logged in
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
  
  // Fetch new arrivals products
  let newArrivalsProducts = [];
  try {
    const {products: newArrivalsData} = await context.storefront.query(NEW_ARRIVALS_PRODUCTS_QUERY, { variables: { first: 250 } });
    newArrivalsProducts = newArrivalsData?.edges || [];
  } catch (error) {
    console.log('Error fetching new arrivals products:', error);
  }
  
  return defer({
    products: products,
    collections: collections.nodes,
    newArrivalsProducts,
    registry: registry?.data?.[0] || null,
    user: user || null,
  });
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
    return json({success: true, response});
  } catch (e) {
    return json({success: false, error: e.message}, {status: 400});
  }
}

async function loadCriticalData({context}) {
  const [{products}] = await Promise.all([
    context.storefront.query(COLLECTION_QUERY),
  ]);
  return {
    products: products,
  };
}

async function loadCollectionData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTION_QUERY),
  ]);
  return {
    collections: collections,
  };
}

const NewArrivals = () => {
  const {products, collections, newArrivalsProducts, registry, user} = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [checkedCollectionIds, setCheckedCollectionIds] = useState([]);
  const [shopAllChecked, setShopAllChecked] = useState(false);
  const [productsToShow, setProductsToShow] = useState(12);
  const topRef = useRef(null);
  const productGridRef = useRef(null);

  const getSubCollectionIdsForParent = (parentCollection) => {
    if (parentCollection.subCollectionMetafield?.references?.edges) {
      return parentCollection.subCollectionMetafield.references.edges.map(
        (edge) => edge.node.id,
      );
    }
    if (parentCollection.subMetafield?.value) {
      try {
        return JSON.parse(parentCollection.subMetafield.value);
      } catch {
        return [];
      }
    }
    return [];
  };

  const getProductCollectionIdsMap = () => {
    const map = new Map();
    (collections || []).forEach((collection) => {
      (collection.products?.edges || []).forEach((edge) => {
        const productId = edge?.node?.id;
        if (!productId) return;
        if (!map.has(productId)) map.set(productId, []);
        map.get(productId).push(collection.id);
      });
    });
    return map;
  };

  const productCollectionIdsMap = getProductCollectionIdsMap();

  const filteredProducts = newArrivalsProducts.filter((product) => {
    if (shopAllChecked || checkedCollectionIds.length === 0) return true;

    const productId = product?.node?.id;
    const productCollectionIds = productCollectionIdsMap.get(productId) || [];

    return checkedCollectionIds.some((checkedId) => {
      const checkedCollection = collections.find((col) => col.id === checkedId);
      if (!checkedCollection) return false;

      const isParent = checkedCollection.parentMetafield?.value === 'true';
      if (!isParent) return productCollectionIds.includes(checkedId);

      const subCollectionIds = getSubCollectionIdsForParent(checkedCollection);
      return (
        productCollectionIds.includes(checkedId) ||
        subCollectionIds.some((subId) => productCollectionIds.includes(subId))
      );
    });
  });

  // Reset products to show when products/filter changes
  useEffect(() => {
    setProductsToShow(12);
  }, [newArrivalsProducts, checkedCollectionIds, shopAllChecked]);

  const handleAddToRegistry = (product, quantity) => {
    try {
      // Check if user is logged in
      if (!user || !user.user || !user.user.id) {
        // User not logged in, redirect to login
        window.location.href = '/login';
        return;
      }

      // Check if registry exists and has an id
      if (!registry || !registry.id) {
        setAlertMessage('Registry not found. Please try again.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
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

      const payload = {
        productId: Number(extractShopifyId(product.id)),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry.id),
        productTypeId: 1,
        quantity: quantity,
      };

      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {method: 'post', encType: 'application/json'},
      );

      // Show success alert
      setAlertMessage(`${product.title} has been added to your registry!`);
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
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

  const handleViewMore = () => {
    setProductsToShow((prev) => Math.min(prev + 12, filteredProducts.length));
  };

  const displayedProducts = filteredProducts.slice(0, productsToShow);
  const hasMoreProducts = filteredProducts.length > productsToShow;

  return (
    <>
      <Header />
      <section className="flex items-center bottom-0 left-0 right-0 bg-[#F5F2ED] h-[27.083vw] pl-[7.396vw] relative gap-[8.698vw] w-full overflow-hidden mb-16">
        <div className="relative p-4 w-[30%]">
          <h2 className="text-[2.5vw] leading-[1.875vw] text-center font-normal lowercase prata">
            new in
          </h2>
          <img
            src="/assets/Images/gifts-bottom-line.png"
            alt="new arrivals"
            className="w-[14.375vw] h-[6px] mt-[1.198vw] mx-auto object-contain"
          />
        </div>

        <img src={NewInBg} alt="" className="w-[70%] h-full object-cover" />
      </section>

      {/* Products Grid Section */}
      {newArrivalsProducts.length > 0 && (
        <section className="px-[8.594vw] mx-auto" ref={productGridRef}>
          <div ref={topRef} className="lg:scroll-mt-[92px] scroll-mt-[60px]"></div>
          <div className="flex flex-col md:flex-row gap-[3.75vw] w-full mx-auto pt-[5vw]">
            <SidebarFilter
              collections={collections}
              checkedCollectionIds={checkedCollectionIds}
              setCheckedCollectionIds={setCheckedCollectionIds}
              shopAllChecked={shopAllChecked}
              setShopAllChecked={setShopAllChecked}
            />
            <div className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2.135vw] pt-0 p-0 relative z-0 mb-[4.844vw]">
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2.083vw] mt-12"> */}
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((product, index) => {
                    console.log(product);
                    const price = product.node.variants?.edges?.[0]?.node?.priceV2?.amount;
                    const image = product.node.images?.edges?.[0]?.node?.url;
                    
                    return (
                      <RegistryProduct
                        key={product.node.id || index}
                        id={product.node.id}
                        image={image}
                        productName={product.node.title}
                        price={price}
                        productHandle={product.node.handle}
                        registryId={registry?.id}
                        onAddToRegistry={(quantity) => handleAddToRegistry(product.node, quantity)}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-4 text-center text-gray-500">
                    No products found for selected filters.
                  </div>
                )}
              {/* </div> */}
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-full xl:w-1/4 "> </div>
            <div className="w-full xl:w-3/4 flex flex-col items-center">
              <p className="text-center text-[18px] leading-[18px] my-[2.083vw] font-[500] tracking-[0.8px] lg:text-[0.938vw] lg:leading-[0.938vw]">
                LOADING {Math.min(productsToShow, filteredProducts.length)} of{' '}
                {filteredProducts.length}
              </p>

              {filteredProducts.length > 12 && hasMoreProducts && (
                <WhiteThemeButton Text="View more" link="#" onClick={handleViewMore} />
              )}

              <button
                className="border-b mx-auto cursor-pointer mb-20 font-bold bg-white text-black px-6 mt-3 text-sm hover:bg-gray-100"
                onClick={() => {
                  setProductsToShow(12);
                  if (productGridRef.current) {
                    productGridRef.current.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }}
              >
                Back to Top
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="py-[6.771vw] px-0">
        <ExploreCategories collections={collections} />
      </div>

      {/* Alert - Rendered outside app-scale via portal */}
      {showAlert && (
        <AlertPortal>
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            alertType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {alertMessage}
          </div>
        </AlertPortal>
      )}
      <Footer />
    </>
  );
};

export default NewArrivals;
