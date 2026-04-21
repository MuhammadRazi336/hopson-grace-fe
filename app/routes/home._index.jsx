import {Footer} from '~/components/Footer';
import HeroSlider from '~/components/HeroSlider';
import Textandbutton from '~/components/Textandbutton';
import SliderItems from '~/components/SliderItems';
import ImageAndText from '~/components/ImageAndText';
import flowerImg from '/assets/Images/flower.png';
import showroomImg from '/assets/Images/showroom.png';
import cupImg from '/assets/Images/cups.png';
import howItWorksImg from '/assets/Images/howitworks.jpg';
import areyoureadyImg from '/assets/Images/areyouready.jpg';
import bookavirtualImg from '/assets/Images/bookavirtual.jpg';
import virtualappointmentImg from '/assets/Images/virtual-appointment.jpg';
import areYouReady from '/assets/Images/youready.jpg';
import atyourserviceGif from '/assets/Images/DINO_DESIGNS_LIFESTYLE_RED.jpg';
import teaImg from '/assets/Images/tea.png';
import lineImg from '/assets/Images/line.png';
import lineImg2 from '/assets/Images/Vector 24.png';
import lineImg3 from '/assets/Images/Vector 23.png';
import lineImg4 from '/assets/Images/Vector 14.png';
import Faqs from '~/components/Faqs';
import CollectionItems from '~/components/CollectionItems';
import CustomTab from '~/components/CustomTab';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import brandline from '/assets/Images/brandline.png';
import ButtonComponent from '~/components/Button';
import Marquee from '~/components/Marquee';
import ProductSlider from '~/components/ProductSlider';
import Testimonialslider from '~/components/Testimonialslider';
import {Header} from '~/components/Header';
import {useState, useEffect} from 'react';
import arrowUp from '/assets/Images/arrowDown.png';
import { Link, useLoaderData, json, useNavigate } from '@remix-run/react';
import LiveChat from '~/components/LiveChat';
import BestsellersSection from '~/components/BestsellersSection';
export async function loader({ context }) {
  try {
    // Get user session if available (optional for non-logged in users)
    const user = context?.session?.get('@User');
    
    const [{ collections }, { collections: brandCollections }, { products: bestsellerProducts }, { blogs }] = await Promise.all([
      context.storefront.query(REAL_REGISTRIES_QUERY),
      context.storefront.query(BRAND_QUERY),
      context.storefront.query(BESTSELLER_PRODUCTS_QUERY, { variables: { first: 8 } }),
      context.storefront.query(BLOGS_QUERY)
    ]);
    
    // Helper function to normalize boolean metafield values
    // Handles both string "true"/"false" and boolean true/false
    const normalizeBool = (raw) => {
      if (raw === true || raw === 'true' || raw === 'True' || raw === 'TRUE') return 'true';
      if (raw === false || raw === 'false' || raw === 'False' || raw === 'FALSE') return 'false';
      if (typeof raw === 'string') return raw.trim().toLowerCase();
      if (raw == null) return '';
      return String(raw).trim().toLowerCase();
    };
    
    // Log ALL collections with their metafield values for debugging
      collections?.nodes?.forEach((collection, index) => {
      const readyMadeRaw = collection.readyMadeMetafield?.value;
      const featuredRaw = collection.featuredMetafield?.value;
      const readyMadeNormalized = normalizeBool(readyMadeRaw);
      const featuredNormalized = normalizeBool(featuredRaw);
      

    });
    
    // Filter collections where: ready_made = true AND featured = true
    // No parent collection condition - just filter by these two metafields
    const featuredReadyMadeCollections = (collections?.nodes ?? []).filter((collection) => {
      const readyMadeNormalized = normalizeBool(collection.readyMadeMetafield?.value);
      const featuredNormalized = normalizeBool(collection.featuredMetafield?.value);
      
      const isReadyMade = readyMadeNormalized === 'true';
      const isFeatured = featuredNormalized === 'true';
      
      const matches = isReadyMade && isFeatured;
      
      return matches;
    });
    
    const realRegistries = featuredReadyMadeCollections;

    // Filter brand collections for the marquee - only show brands explicitly marked featured
    // Be robust to different capitalizations or empty/undefined values from Shopify metafields
    const filteredBrands = (brandCollections?.nodes || []).filter((collection) => {
      const raw = collection?.featuredMetafield?.value;
      const normalized = typeof raw === 'string' ? raw.trim().toLowerCase() : String(raw ?? '').toLowerCase();
      return normalized === 'true';
    });

    // "A few of our brands" carousel: only collections with custom.brand_homepage = true
    const brands = (brandCollections?.nodes || []).filter((collection) => {
      const normalized = normalizeBool(collection.brandHomepageMetafield?.value);
      return normalized === 'true';
    });
    
    // Debug: Log each brand's metafield to see what we're getting
    brandCollections?.nodes?.forEach((collection, index) => {

    });
    
    // Fetch products for each featured ready-made collection directly
    // No parent collection logic - just fetch products for collections that match the filter
    let featuredRegistryData = null;
    if (realRegistries.length > 0) {
      const collectionsWithProducts = [];
      
      for (const collection of realRegistries) {
        // Fetch collection with products
        const collectionData = await context.storefront.query(SUB_COLLECTION_QUERY, {
          variables: { id: collection.id }
        });
        
        if (collectionData.collection) {
          collectionsWithProducts.push(collectionData.collection);
        }
      }
      
      // Format data for CustomTab component
      if (collectionsWithProducts.length > 0) {
        // Use the first collection as the parent (for structure compatibility with CustomTab)
        const parentCollection = realRegistries[0];
        
        featuredRegistryData = {
          parentCollection: parentCollection,
          subCollections: collectionsWithProducts
        };
      }
    }

    // Allowed blog categories (custom.category metafield values, case-insensitive)
    const ALLOWED_BLOG_CATEGORIES = new Set(
      ['Real Weddings', 'The Planning Edit', 'At Home', 'Travel & Culture'].map(
        (v) => v.toLowerCase(),
      ),
    );

    // Filter blogs/articles so home inspiration only shows allowed categories
    const filteredBlogs =
      blogs?.nodes
        ?.map((blog) => {
          const filteredArticles =
            blog.articles?.nodes?.filter((article) => {
              const raw = (article?.categoryMetafield?.value || '').trim();
              const normalized = raw.toLowerCase();
              return ALLOWED_BLOG_CATEGORIES.has(normalized);
            }) || [];

          return {
            ...blog,
            articles: {
              ...blog.articles,
              nodes: filteredArticles,
            },
          };
        })
        // Keep only blogs that still have at least one allowed article
        .filter((blog) => blog.articles.nodes.length > 0) || [];

    return json({
      realRegistries,
      featuredRegistryData,
      brands,
      user,
      bestsellerProducts: bestsellerProducts?.edges || [],
      blogs: filteredBlogs,
    });
  } catch (error) {
    return json({
      realRegistries: [],
      featuredRegistryData: null,
      brands: [],
      user: null,
      bestsellerProducts: [],
      blogs: [],
    });
  }
}

const Home = () => {
  const { realRegistries, featuredRegistryData, brands, user, bestsellerProducts, blogs } = useLoaderData();
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleOpenModal = () => {
    navigate('/register');
  };

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 300; // Show button after scrolling 300px
      setShowBackToTop(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
  ];
  return (
    <div className="overflow-x-hidden">
      <Header />
      <section className="hero-slider lg:h-[43vw] xl:h-[43vw] 2xl:h-[43vw]">
        <HeroSlider />
      </section>
      <section className="text-and-button-section pt-12 pb-0 lg:py-[7.76vw]">
        <Textandbutton />
      </section>
      <section className="lg:mb-[10.417vw]">
        <CollectionItems />
      </section>

      <section className="mb-[10.417vw] max-[1024px]:mb-[80px]">
        <ImageAndText
          direction={'right'}
          imgBanner={howItWorksImg}
          lineimg={lineImg}
          stepsCheck={true}
          title="how it works"
          description="There's no question too small or request too big for our Registry advisors. We're always at your service."
          buttontext={'START YOUR REGISTRY'}
          buttontype={'Color'}
          onClick={handleOpenModal}
        />
      </section>

      <section>
        <Heading
          text="ready-made registries"
          classes={
            'prata text-[20px] leading-[36px] lg:text-[2.5vw] lg:leading-[3.542vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[220px] mb-[3.177vw] mb-[20px]'}
        />
        <p className="text-center text-[12px] leading-[16px] lg:text-[1.354vw] lg:leading-[1.979vw] max-w-[1020px] max-[1024px]:max-w-[291px] mx-auto lg:mb-[4.323vw] mb-8">
        From real couples to curated style edits, our ready-made registries are personal, <br className="max-[1024px]:hidden"/>shoppable, and designed to make choosing easy.
      </p>
        <CustomTab tabsData={tabsData} featuredRegistryData={featuredRegistryData} />
        <div className="text-center">
        <Link to="/ready-made-registries">
          <ButtonComponent
            text="EXPLORE READY-MADE REGISTRIES"
            className="button-cs text-black cursor-pointer border-3 w-[224px] h-[44px] lg:w-[18.75vw] lg:h-[4.01vw] lg:text-[0.938vw] lg:leading-[0.938vw] border-black max-[1024px]:border-2 py-[2px] lg:py-[5px] bg-transparent rounded-none mt-11 lg:mt-[3.125vw] hover:bg-gray-100"
          />
          </Link>
        </div>
      </section>

      <section className="py-[70px] mt-[81px] max-[1024px]:py-[28px] bg-[#F5F2ED80] my-[3.958vw] lg:mb-0 lg:mt-[8.281vw]">
        <Heading
          text="a few of our brands"
          classes={
            'prata text-[22px] leading-[36px] lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center lg:mb-[0.833vw] max-[1024px]:m-0'
          }
          image={lineImg4}
          imageClasses={'max-[1024px]:max-w-[220px] lg:w-[27.344vw] lg:h-[0.311vw]'}
        />
        <Marquee brands={brands} />
        <div className="text-center">
          <Link to="/our-brands">
          <ButtonComponent
            text="EXPLORE ALL BRANDS"
            className="button-cs text-[#1F1D1B] cursor-pointer lg:w-[18.75vw] lg:h-[4.01vw] lg:text-[0.938vw] lg:leading-[0.938vw] border-3 border-[#1F1D1B] max-[1024px]:border-2 py-[2px] w-[224px] h-[44px] lg:py-[5px] bg-transparent rounded-none mt-2 lg:mt-11 hover:bg-gray-200"
          />
          </Link>
        </div>
      </section>

      <BestsellersSection bestsellerProducts={bestsellerProducts} />

      <section className="mb-[80px] mt-0 lg:mb-0">
        <Heading
          text="inspiration"
          classes={
            'prata text-[22px] leading-[36px] lg:text-[2.5vw] lg:leading-[1.875vw] lg:mb-[0.833vw] font-normal text-center  max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[220px] lg:w-[17.604vw] lg:h-[0.400vw]'}
        />
        <p className="text-center max-[1024px]:hidden mt-5 lg:text-[1.354vw] lg:leading-[1.979vw] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mt-[2.135vw] lg:mb-0 mb-8">
          A peek inside some of our most-loved celebrations.
        </p>
        <Testimonialslider blogs={blogs} />
        <div className="text-center">
          <Link to="/inspiration">
            <ButtonComponent
              text="EXPLORE REAL WEDDINGS"
            className="button-cs text-[#1F1D1B] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer lg:w-[18.75vw] lg:h-[4.01vw] max-[1024px]:border-2 border-3 border-[#1F1D1B] py-[5px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-[4.688vw] hover:bg-gray-100"
            />
          </Link>
        </div>
      </section>

      <section className="my-[80px] lg:my-[10.417vw]">
      <ImageAndText
            direction={'left'}
            imgBanner={atyourserviceGif}
            lineimg={lineImg}
            title=" at your service"
            description="There’s no question too small or request too big for one of our Registry concierges. We’re always at your service."
            buttontext={'CONTACT US'}
            buttontype={'link'}
            buttonLink={'/contact-us'}
            buttonClassName='!text-[#1F1D1B]'
          />
    </section>

      <section className="">
        <Faqs />
      </section>

      <section className="my-[80px] lg:my-[10.417vw]">
        <ImageAndText
          direction={'left'}
          imgBanner={virtualappointmentImg}
          lineimg={lineImg2}
          title=<>book a virtual <br/>appointment</>
          description="Our virtual appointments offer personalized guidance without leaving home."
          buttontext={'BOOK NOW'}
          buttontype={'link'}
          buttonLink={'/contact-us'}
          buttonClassName='!text-[#1F1D1B]'
        />
      </section>

      <section className="mb-[80px] lg:my-[10.417vw]">
        <ImageAndText
          direction={'right'}
          imgBanner={areYouReady}
          lineimg={lineImg3}
          title="ready?"
          description={
            <>
              TIMELESS GIFTS.<br />
              THOUGHTFULLY CURATED.<br />
              EXCEPTIONAL SERVICE.
            </>
          }
          buttontext={'GET STARTED'}
          buttontype={'Color'}
          onClick={handleOpenModal}
        />
      </section>
      <Footer />
      
      {/* Back to Top Button - commented out
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 p-2 right-8 z-50 w-[85px] h-[85px] bg-black hover:bg-[#272727] text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 ${
          showBackToTop 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <img src={arrowUp} className='text-white invert rotate-180 mx-auto w-[15px] h-[13px] mb-1' alt="arrowUp" />
        <span className="text-white text-sm">Back to Top</span>
      </button>
      */}
    </div>
  );
};

export default Home;

const REAL_REGISTRIES_QUERY = `#graphql
query getRealRegistries {
  collections(first: 250, sortKey: UPDATED_AT, reverse: true) {
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
      readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
        id
        value
      }
      parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {
        id
        value
      }
      subCollectionMetafield: metafield(namespace: "sub", key: "collection") {
        id
        value
      }
      featuredMetafield: metafield(namespace: "custom", key: "featured") {
        id
        value
      }
    }
  }
}
`;

const SUB_COLLECTION_QUERY = `#graphql
query getHomeSubCollection($id: ID!) {
  collection(id: $id) {
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
    featuredMetafield: metafield(namespace: "custom", key: "featured") {
      id
      value
    }
    readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
      id
      value
    }
    products(first: 250) {
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
                price {
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
}`;

const BRAND_QUERY = `#graphql
query getHomeBrands {
  collections(first: 250, sortKey: UPDATED_AT, reverse: true) {
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
      brandHomepageMetafield: metafield(namespace: "custom", key: "brand_homepage") {
        id
        value
      }
      featuredMetafield: metafield(namespace: "custom", key: "featured") {
        id
        value
      }
    }
  }
}`;

const BESTSELLER_PRODUCTS_QUERY = `#graphql
  query GetBestsellerProducts($first: Int!) {
    products(first: $first, query: "tag:bestseller") {
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
        }
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query GetRecommendedProducts($first: Int!) {
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
        }
      }
    }
  }
`;

// const BLOGS_QUERY = `#graphql
// query GetAllBlogsAndArticlesForInspiration {
//   blogs(first: 1, reverse: true) {
//     nodes {
//       title
//       handle
//       articles(first: 20) {
//         nodes {
//           id
//           title
//           handle
//           publishedAt
//           contentHtml
//           image {
//             url
//           }
//           categoryMetafield: metafield(namespace: "custom", key: "category") {
//             value
//           }
//           venueMetafield: metafield(namespace: "custom", key: "venue") {
//             value
//           }
//         }
//       }
//     }
//   }
// }`;

const BLOGS_QUERY = `#graphql
query GetAllBlogsAndArticles {
  blogs(first: 10, reverse: true) {
    nodes {
      title
      handle
      articles(first: 50) {
        nodes {
          id
          title
          handle
          publishedAt
          contentHtml
          image {
            url
          }
          categoryMetafield: metafield(namespace: "custom", key: "category") {
            value
          }
          venueMetafield: metafield(namespace: "custom", key: "venue") {
            value
          }
        }
      }
    }
  }
}`;