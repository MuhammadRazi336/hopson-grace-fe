import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {useState, useEffect, useRef} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {defer, json} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {requireAuth} from '~/utils/auth-guard.js';
import {extractShopifyId} from '~/utils/helpers.js';
import PreviewRegistry from '~/components/PreviewRegistry';
import { Swiper, SwiperSlide } from 'swiper/react';
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
import { Footer } from '~/components/Footer';
import { Navigation } from 'swiper/modules';

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

export async function loader({request, context}) {
  const {products} = await loadCriticalData({context});
  const {collections} = await loadCollectionData({context});
  const user = await requireAuth(context);
  const registry = await context?.session?.get('@Registry');
  const userData = await context?.ClientGet(`users/${user?.user?.id}`, context);

  return defer({products, collections, user, registry, userData});
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
  const token = process.env.PUBLIC_STOREFRONT_API_TOKEN || context.env?.PUBLIC_STOREFRONT_API_TOKEN;
  try {
    const [{products}] = await Promise.all([
      context.storefront.query(PRODUCT_QUERY),
    ]);
    return {
      products: products?.edges || [],
    };
  } catch (error) {
    throw error;
  }
}

async function loadCollectionData({context}) {
  try {
    const [{collections}] = await Promise.all([
      context.storefront.query(COLLECTION_QUERY),
    ]);
    return {
      collections: collections?.nodes || [],
    };
  } catch (error) {
    throw error;
  }
}

function SidebarFilter({ collections, checkedCollectionIds, setCheckedCollectionIds }) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    styles: true,
  });

  const parentCollection = collections.filter(
    (col) => col.parentMetafield?.value === 'true'
  );

  const subCollection = collections.filter(
    (col) => col.parentMetafield?.value === 'false'
  );

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSidebarCheckbox = (colId) => {
    let newChecked;
    if (checkedCollectionIds.includes(colId)) {
      newChecked = checkedCollectionIds.filter(id => id !== colId);
    } else {
      newChecked = [...checkedCollectionIds, colId];
    }
    setCheckedCollectionIds(newChecked);
  };

  return (
    <div className="w-full xl:w-1/4 p-6 h-fit bg-[#FAF9F6]">
      <div className="mb-6">
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('categories')}
        >
          Product Categories
          <span className="text-lg">
            {openSections.categories ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-3 h-3 rotate-270"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-3 h-3 rotate-90"
              />
            )}
          </span>
        </h2>
        {openSections.categories && (
          <ul className="space-y-2 text-sm">
            {parentCollection.map((col) => (
              <li key={col.id}>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
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

      <div className="mb-6">
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('brands')}
        >
          Our Brands
          <span className="text-lg">
            {openSections.brands ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-3 h-3 rotate-270"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-3 h-3 rotate-90"
              />
            )}
          </span>
        </h2>
        {openSections.brands && (
          <p className="text-sm text-gray-500 italic">No data</p>
        )}
      </div>

      <div>
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('styles')}
        >
          Shop by Style
          <span className="text-lg">
            {openSections.styles ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-3 h-3 rotate-270"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-3 h-3 rotate-90"
              />
            )}
          </span>
        </h2>
        {openSections.styles && (
          <ul className="space-y-2 text-sm">
            {subCollection.map((col) => (
              <li key={col.id}>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
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
    </div>
  );
}

export default function AddGifts() {
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [dateSort, setDateSort] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'

  const {products, collections, registry, user, userData} = useLoaderData();
  const fetcher = useFetcher();

  // State for checked collections and displayed products
  const [checkedCollectionIds, setCheckedCollectionIds] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const initialPreferencesApplied = useRef(false);
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);

  useEffect(() => {
    if (
      !initialPreferencesApplied.current &&
      userData &&
      collections &&
      collections.length > 0
    ) {
      const preferredCategories = (userData.data?.user?.preferredCategory || []).map(s => s.trim().toLowerCase());
      const preferredSubCategories = (userData.data?.user?.preferredSubCategory || []).map(s => s.trim().toLowerCase());

      // Only check parent collections for preferredCategory, sub-collections for preferredSubCategory
      const checkedIds = [
        ...collections
          .filter(
            col =>
              col.parentMetafield?.value === 'true' &&
              preferredCategories.includes((col.title || '').trim().toLowerCase())
          )
          .map(col => col.id),
        ...collections
          .filter(
            col =>
              col.parentMetafield?.value === 'false' &&
              preferredSubCategories.includes((col.title || '').trim().toLowerCase())
          )
          .map(col => col.id),
      ];

      setCheckedCollectionIds(checkedIds);
      initialPreferencesApplied.current = true;
    }
  }, [userData, collections]);

  // Helper to get all products for checked collections
  const getProductsForCheckedCollections = (checkedIds) => {
    const checkedParents = collections.filter(
      col => col.parentMetafield?.value === 'true' && checkedIds.includes(col.id)
    );
    const checkedSubs = collections.filter(
      col => col.parentMetafield?.value === 'false' && checkedIds.includes(col.id)
    );
    let parentProducts = [];
    checkedParents.forEach(parentCol => {
      let subCollectionGids = [];
      const subColMeta = parentCol.subMetafield;
      if (subColMeta?.value) {
        try {
          subCollectionGids = JSON.parse(subColMeta.value);
        } catch {}
      }
      // Find sub-collections by GID
      const subCols = collections.filter(
        col => col.parentMetafield?.value === 'false' && subCollectionGids.includes(col.id)
      );
      parentProducts = parentProducts.concat(
        subCols.length > 0 ? subCols.flatMap(col => (col.products?.edges || []).map(edge => edge.node)) : []
      );
    });
    const subProducts = checkedSubs.length > 0 ? checkedSubs.flatMap(col => (col.products?.edges || []).map(edge => edge.node)) : [];
    const allProducts = [...parentProducts, ...subProducts];
    const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());
    return uniqueProducts;
  };

  // Update displayedProducts when checkedCollectionIds changes
  useEffect(() => {
    setDisplayedProducts(getProductsForCheckedCollections(checkedCollectionIds));
  }, [checkedCollectionIds]);

  const handleAddtoRegistry = (product) => {
    try {
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
        quantity: 1,
      };

      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );

      // Show success alert
      setAlertMessage(`${product.title} has been added to your registry!`);
      setAlertType('success');
      setShowAlert(true);

      // Hide alert after 3 seconds
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

  // Filter the products based on selected filters
  const filteredProducts = products.filter((productWrapper) => {
    const product = productWrapper.node;
    const firstVariant = product?.variants?.edges?.[0]?.node;

    if (!firstVariant) return false;

    if (availability) {
      const isAvailable = firstVariant.availableForSale;
      if (availability === 'in-stock' && !isAvailable) return false;
      if (availability === 'out-of-stock' && isAvailable) return false;
    }

    return true;
  }).sort((a, b) => {
    const priceA = Number(a.node.variants.edges[0].node.priceV2.amount);
    const priceB = Number(b.node.variants.edges[0].node.priceV2.amount);
    const createdAtA = new Date(a.node.createdAt).getTime();
    const createdAtB = new Date(b.node.createdAt).getTime();

    if (priceSort === 'low-to-high') return priceA - priceB;
    if (priceSort === 'high-to-low') return priceB - priceA;
    if (dateSort === 'newest') return createdAtB - createdAtA;
    if (dateSort === 'oldest') return createdAtA - createdAtB;

    return 0;
  });

  const parentCollection = collections.filter(
    (col) => col.parentMetafield?.value === "true"
  )

  return (
    <>
    <div className="pt-[80px] relative p-4 mt-[80px]">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          <span className="prata uppercase">Add</span> or{' '}
          <span className="prata uppercase">edit gifts</span>
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />
        <p className="max-w-xl mx-auto text-center  my-5 font-normal leading-relaxed">
          Browse by category, filter by price, or get inspired with our curated
          edits. Add, update, or switch things up whenever you like.
        </p>

        <PreviewRegistry />
      </div>

      <section className=" ">
        <div className=" relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
          <div className=" ">
            <div className="z-10 swiper-button-prev-prod absolute  left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase  max-[1601px]:w-[90px] items-center bg-white top-[45%] px-8 py-10  justify-center max-[1024px]:w-[33px]">
              <img src={nextitem} alt="" className="rotate-180 size-6" />
            </div>

            <Swiper
              spaceBetween={15}
              slidesPerView={3.25} // Shows 3 full + a portion of 4th
              centeredSlides={true} // Enables .5 on both sides
              loop={true}
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-prod',
                prevEl: '.swiper-button-prev-prod',
              }}
              className="px-[178px]"
              breakpoints={{
                345: {
                  slidesPerView: 1.25,
                  spaceBetween: 10,
                  centeredSlides: true,
                },
                475: {
                  slidesPerView: 2.25,
                  spaceBetween: 15,
                  centeredSlides: true,
                },
                768: {
                  slidesPerView: 2.25,
                  spaceBetween: 20,
                  centeredSlides: true,
                },
                1024: {
                  slidesPerView: 2.75,
                  spaceBetween: 30,
                  centeredSlides: true,
                },
                1366: {
                  slidesPerView: 3.25,
                  spaceBetween: 39,
                  centeredSlides: true,
                },
                1600: {
                  slidesPerView: 3.5,
                  spaceBetween: 39,
                  centeredSlides: true,
                },
              }}
            >
              {/* Dynamic slides from Shopify collections */}
              {collections.filter(col => col.parentMetafield?.value === 'true').map((col, idx) => (
                <SwiperSlide key={col.title || idx}>
                  <img
                    src={col.image?.url || '/assets/Images/placeholder.png'}
                    alt={col.title}
                    className="w-full"
                  />
                  <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                    {col.title}
                  </h3>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="swiper-button-next-prod absolute  right-[1%] max-[1601px]:-right-[0%] cursor-pointer  uppercase max-[1601px]:w-[90px] items-center bg-white z-10 top-[45%] px-8 py-10  justify-center text-white max-[1024px]:w-[33px]">
              <img src={nextitem} className="size-6" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-10">
          <SidebarFilter
            collections={collections}
            checkedCollectionIds={checkedCollectionIds}
            setCheckedCollectionIds={setCheckedCollectionIds}
          />
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 mt-10 flex-1' ref={productGridRef}>
            {(() => {
              if (displayedProducts.length === 0) {
                return <div className="col-span-3 text-center text-gray-400">Select a collection to view products.</div>;
              }
              let anyRendered = false;
              const productNodes = displayedProducts.slice(0, productsToShow).map((product) => {
                const firstVariant = product?.variants?.edges?.[0]?.node;
                if (!firstVariant) return null;
                anyRendered = true;
                const firstImage = product?.images?.edges?.[0]?.node?.url || '/fallback-image.jpg';
                return (
                  <RegistryProduct
                    key={product.id}
                    image={firstImage}
                    productName={product.title}
                    price={firstVariant.priceV2.amount}
                    description={product.description}
                    onAddToRegistry={() => handleAddtoRegistry(product)}
                    onGroupGiftTagChange={(isGroupGift) =>
                      console.log(`Group Gift tag changed: ${isGroupGift}`)
                    }
                  />
                );
              });
              if (!anyRendered) {
                return <div className="col-span-3 text-center text-gray-400">Select a collection to view products.</div>;
              }
              return productNodes;
            })()}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-md my-10">
              LOADING {Math.min(productsToShow, displayedProducts.length)} of {displayedProducts.length}
            </p>

            {displayedProducts.length > 12 && productsToShow < displayedProducts.length && (
              <WhiteThemeButton
                Text="View more"
                link="#"
                onClick={() => setProductsToShow((prev) => Math.min(prev + 12, displayedProducts.length))}
              />
            )}

            {productsToShow > 12 && (
              <button
                className="border-b mx-auto cursor-pointer mb-20 font-bold bg-white text-black px-6 mt-3 text-sm hover:bg-gray-100"
                onClick={() => {
                  setProductsToShow(12);
                  if (productGridRef.current) {
                    productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Back to Top
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#FAF9F6] py-8">
        <Heading
          text="Ready-Made Registries"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <CustomTab tabsData={tabsData} />
        <div className="text-center">
          <ButtonComponent
            text="EXPLORE SAMPLE REGISTRIES"
            className="button-cs text-black border-3 border-black py-4 lg:py-[30px] bg-transparent rounded-none mt-11"
          />
        </div>
      </section>

      <section className="py-[70px]  my-12 lg:my-[240px] container">
        <Heading
          text="bestsellers"
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

      <section className="bg-[#FAF9F6] pt-12 pb-8 mb-[100px]">
        <Heading
          text="we think you'll love"
          classes={
            'prata text-2xl lg:text-4xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />

        <div className=" relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
          <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
            <div className="swiper-button-prev-prod absolute top-0 left-[0] max-[1601px]:-left-[0%] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
              <img src={nextitem} alt="" className="rotate-180 " />
              <span className="-rotate-90 text-black block tracking-wider max-[1024px]:hidden">
                more
              </span>
            </div>

            <Swiper
              spaceBetween={15}
              slidesPerView={3}
              loop={true}
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-prod',
                prevEl: '.swiper-button-prev-prod',
              }}
              className="px-[178px]"
              breakpoints={{
                345: {
                  spaceBetween: 10,
                  centeredSlides: true,
                },
                475: {
                  spaceBetween: 15,
                  centeredSlides: true,
                },
                768: {
                  spaceBetween: 20,
                  centeredSlides: true,
                },
                1024: {
                  spaceBetween: 30,
                  centeredSlides: true,
                },
                1366: {
                  spaceBetween: 39,
                  centeredSlides: true,
                },
                1600: {
                  spaceBetween: 39,
                  centeredSlides: true,
                },
              }}
            >
              {/* slides here */}
              <SwiperSlide>
                <img src={youll1} alt="New Arrival" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  ARKE GLASS BOTTLE FOR CARBONATOR PRO
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll2} alt="Tableware" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  SMEG TOASTER, 2 SLICE
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll3} alt="Staub Cast Iron Q4" className="w-full" />
                <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
                  THE BARISTA TOUCH ESPRESSO MAKER
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll1} alt="New arrivals" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  ARKE GLASS BOTTLE FOR CARBONATOR PRO
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll2} alt="Staub Cast Iron Q4" className="w-full" />
                <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
                  THE BARISTA TOUCH ESPRESSO MAKER
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
            </Swiper>
            <div className="swiper-button-next-prod absolute top-0 right-[0] max-[1601px]:right-0 cursor-pointer  uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px]">
              <span className="rotate-90 text-black block tracking-wider max-[1024px]:hidden">
                more
              </span>
              <img src={nextitem} className="" alt="" />
            </div>
          </div>
        </div>
      </section>

      <Footer />

    






    <div className="max-w-4xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
      {/* Alert Component */}
      {showAlert && (
        <div className={`fixed top-4 right-4 ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}>
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

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Filter Registry Items</h3>
        <div className="flex gap-4 mt-4">
          {/* <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setAvailability(e.target.value)}
            value={availability}
          >
            <option value="">Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select> */}
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setPriceSort(e.target.value)}
            value={priceSort}
          >
            <option value="">Price</option>
            <option value="low-to-high">Low to High</option>
            <option value="high-to-low">High to Low</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setDateSort(e.target.value)}
            value={dateSort}
          >
            <option value="">Sort by Date</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {filteredProducts.map((productWrapper, index) => {
          const product = productWrapper.node
          const firstImage = product?.images?.edges?.[0]?.node?.src || '/fallback-image.jpg';
          const firstVariant = product?.variants?.edges?.[0]?.node;

          if (!firstVariant) return null;

          return (
            <div key={index} className="cursor-pointer">
              <RegistryProduct
                image={firstImage}
                productName={product.title}
                price={firstVariant.priceV2.amount}
                description={product.description}
                onAddToRegistry={() => handleAddtoRegistry(product)}
                onGroupGiftTagChange={(isGroupGift) =>
                  console.log(`Group Gift tag changed: ${isGroupGift}`)
                }
              />
            </div>
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

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
    </div>
    </>
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
          createdAt
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
`;
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

// Export metadata for Remix
export const meta = () => {
  return [
    { title: "Add Gifts to Registry" },
    { name: "description", content: "Add gifts to your registry" },
  ];
};

// Export handle for Remix
export const handle = {
  hydrate: true,
};
