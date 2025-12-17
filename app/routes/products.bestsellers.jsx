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
import GiftCardBg from '/assets/Images/giftCardBg.png';
import AlertPortal from '~/components/AlertPortal';
import WeThinkYoullLove from '~/components/WeThinkYoullLove';
import { RECOMMENDED_PRODUCTS_QUERY } from '~/graphql/product-queries';

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

const BESTSELLER_PRODUCTS_QUERY = `#graphql
  query GetBestsellerProducts($first: Int!) {
    products(first: $first, query: "tag:bestseller") {
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
    collections(first: 50) {
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
        products(first: 10){
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
  
  // Fetch bestseller products
  let bestsellerProducts = [];
  try {
    const {products: bestsellerData} = await context.storefront.query(BESTSELLER_PRODUCTS_QUERY, { variables: { first: 50 } });
    bestsellerProducts = bestsellerData?.edges || [];
  } catch (error) {
    console.log('Error fetching bestseller products:', error);
  }
  
  // Fetch recommended products
  let recommendedProducts = [];
  try {
    const { products: recommendedProductsData } = await context.storefront.query(RECOMMENDED_PRODUCTS_QUERY, { 
      variables: { first: 8 } 
    });
    recommendedProducts = recommendedProductsData?.edges || [];
  } catch (error) {
    console.log('Error fetching recommended products:', error);
  }
  
  return defer({
    products: products,
    collections: collections.nodes,
    bestsellerProducts,
    recommendedProducts,
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

const Bestsellers = () => {
  const {products, collections, bestsellerProducts, recommendedProducts, registry, user} = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);

  // Reset products to show when bestsellerProducts change
  useEffect(() => {
    setProductsToShow(12);
  }, [bestsellerProducts]);

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
    setProductsToShow(prev => prev + 12);
  };

  const handleBackToTop = () => {
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayedProducts = bestsellerProducts.slice(0, productsToShow);
  const hasMoreProducts = bestsellerProducts.length > productsToShow;

  return (
    <>
    <Header />
      <div className="pt-[100px] relative p-4">
        <h2 className="mt-0 prata lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          bestsellers
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />
      </div>

      <section className='my-16'>
    <img
        src={GiftCardBg}
        alt=""
        className="w-full h-[520px] lg:h-[520px] object-cover"
      />
    </section>

      {/* Products Grid Section */}
      {displayedProducts.length > 0 && (
        <section className="w-[81.25vw] mx-auto py-12" ref={productGridRef}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2.083vw] mt-12">
            {displayedProducts.map((product, index) => {
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
            })}
          </div>

          {/* View More and Back to Top Section */}
          <div className="flex flex-col items-center mt-12 space-y-4">
            {/* Loading indicator */}
            <p className="text-gray-600 text-sm">
              LOADING {displayedProducts.length} of {bestsellerProducts.length} PRODUCTS
            </p>
            
            {/* View More Button */}
            {hasMoreProducts && (
              <WhiteThemeButton
                text="VIEW MORE"
                onClick={handleViewMore}
                className="button-cs text-[#1F1D1B] bastardogrotesk lg:text-[0.938vw] lg:leading-[0.938vw] text-[18px] leading-[18px] lg:w-[18.75vw] lg:h-[4.01vw] border-3 border-[#1F1D1B] cursor-pointer max-[1024px]:py-4 bg-transparent rounded-none"
              />
            )}
            
            {/* Back to Top Button */}
            {displayedProducts.length > 12 && (
              <WhiteThemeButton
                text="BACK TO TOP"
                onClick={handleBackToTop}
                className="button-cs text-[#1F1D1B] bastardogrotesk lg:text-[0.938vw] lg:leading-[0.938vw] text-[18px] leading-[18px] lg:w-[18.75vw] lg:h-[4.01vw] border-3 border-[#1F1D1B] cursor-pointer max-[1024px]:py-4 bg-transparent rounded-none"
              />
            )}
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
      <WeThinkYoullLove recommendedProducts={recommendedProducts || []} productLinkPrefix="/products/bestsellers" />
      <Footer />
    </>
  );
};

export default Bestsellers;
