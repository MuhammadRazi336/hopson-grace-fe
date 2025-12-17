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
import atyourserviceGif from '/assets/Images/atyourservice.gif';
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
import { Link, useLoaderData, json } from '@remix-run/react';
import LiveChat from '~/components/LiveChat';
import Popup from '~/components/Popup';
import ModalPortal from '~/components/ModalPortal';
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
    
    // Filter collections where both ready_made AND parent_collection metafields are true
    const realRegistries = collections?.nodes?.filter(collection => {
      const readyMadeMetafield = collection.readyMadeMetafield?.value === 'true';
      const parentCollectionMetafield = collection.parentCollectionMetafield?.value === 'true';
      return readyMadeMetafield && parentCollectionMetafield;
    }) || [];

    // Filter brand collections for the marquee - only show brands explicitly marked featured
    // Be robust to different capitalizations or empty/undefined values from Shopify metafields
    const filteredBrands = (brandCollections?.nodes || []).filter((collection) => {
      const raw = collection?.featuredMetafield?.value;
      const normalized = typeof raw === 'string' ? raw.trim().toLowerCase() : String(raw ?? '').toLowerCase();
      return normalized === 'true';
    });

    // Remove duplicates by title (keep first occurrence)
    const brands = filteredBrands.filter((brand, index, self) => 
      index === self.findIndex(b => b.title === brand.title)
    );
    
    console.log('All collections:', collections?.nodes);
    console.log('Real registries (parent collections):', realRegistries);
    console.log('All brand collections (before filtering):', brandCollections?.nodes);
    console.log('Filtered brands count:', filteredBrands.length);
    console.log('Brands after deduplication:', brands.length);
    console.log('Brand titles:', brands.map(brand => brand.title));
    
    // Debug: Log each brand's metafield to see what we're getting
    brandCollections?.nodes?.forEach((collection, index) => {
      console.log(`Brand ${index + 1}:`, {
        title: collection.title,
        featuredMetafield: collection.featuredMetafield?.value,
        namespace: collection.featuredMetafield?.namespace,
        key: collection.featuredMetafield?.key
      });
    });
    
    // Log each collection with its title and metafields for debugging
    realRegistries.forEach((collection, index) => {
      console.log(`Collection ${index + 1}:`, {
        title: collection.title,
        readyMade: collection.readyMadeMetafield?.value,
        parentCollection: collection.parentCollectionMetafield?.value,
        subCollection: collection.subCollectionMetafield?.value
      });
    });
    
    // Fetch sub-collections and their products for the "Real Registries" specifically
    let featuredRegistryData = null;
    if (realRegistries.length > 0) {
      // Find the "Real Registries" collection specifically (not just the first one)
      // Priority order: 1. "Real" in title, 2. "Authentic" in title, 3. "Couple" in title, 4. Not "Themed"/"Minimalist"
      let realRegistriesCollection = null;
      
      // First priority: collections with "real" in the title
      realRegistriesCollection = realRegistries.find(collection => 
        collection.title.toLowerCase().includes('real')
      );
      
      // Second priority: collections with "authentic" in the title
      if (!realRegistriesCollection) {
        realRegistriesCollection = realRegistries.find(collection => 
          collection.title.toLowerCase().includes('authentic')
        );
      }
      
      // Third priority: collections with "couple" or "wedding" in the title
      if (!realRegistriesCollection) {
        realRegistriesCollection = realRegistries.find(collection => 
          collection.title.toLowerCase().includes('couple') ||
          collection.title.toLowerCase().includes('wedding')
        );
      }
      
      // Fourth priority: any collection that's NOT "Themed" or "Minimalist"
      if (!realRegistriesCollection) {
        realRegistriesCollection = realRegistries.find(collection => 
          !collection.title.toLowerCase().includes('themed') && 
          !collection.title.toLowerCase().includes('minimalist') &&
          !collection.title.toLowerCase().includes('style') &&
          !collection.title.toLowerCase().includes('curated')
        );
      }
      
      // Final fallback: first collection
      if (!realRegistriesCollection) {
        realRegistriesCollection = realRegistries[0];
      }
      
      if (realRegistriesCollection.subCollectionMetafield?.value) {
        try {
          const subCollectionIds = JSON.parse(realRegistriesCollection.subCollectionMetafield.value);
          
          // Fetch ALL sub-collections for display (not just the first one)
          if (subCollectionIds.length > 0) {
            
            // Fetch all sub-collections
            const subCollectionsData = [];
            for (const subCollectionId of subCollectionIds) {
              
              const subCollectionData = await context.storefront.query(SUB_COLLECTION_QUERY, {
                variables: { id: subCollectionId }
              });
              
              if (subCollectionData.collection) {
                subCollectionsData.push(subCollectionData.collection);
              }
            }
            
            if (subCollectionsData.length > 0) {
              // Return all sub-collections data
              featuredRegistryData = {
                parentCollection: realRegistriesCollection,
                subCollections: subCollectionsData
              };
            } else {
              console.log('No sub-collections found');
            }
          }
        } catch (e) {
          console.log('Error parsing subCollectionMetafield:', e);
        }
      }
    }
    
    return json({ realRegistries, featuredRegistryData, brands, user, bestsellerProducts: bestsellerProducts?.edges || [], blogs: blogs?.nodes || [] });
  } catch (error) {
    console.error('Error loading real registries:', error);
    return json({ realRegistries: [], featuredRegistryData: null, brands: [], user: null, bestsellerProducts: [], blogs: [] });
  }
}

const Home = () => {
  const { realRegistries, featuredRegistryData, brands, user, bestsellerProducts, blogs } = useLoaderData();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleOpenModal = () => {
    setShowPopup(true);
  };

  const handleCloseModal = () => {
    setShowPopup(false);
  };

  if (brands && brands.length > 0) {
    console.log('First brand sample:', brands[0]);
    console.log('length of brands:', brands.length);
  }

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
            text="BROWSE READY-MADE REGISTRIES"
            className="button-cs text-black cursor-pointer border-3 w-[224px] h-[44px] lg:w-[18.75vw] lg:h-[4.01vw] lg:text-[0.938vw] lg:leading-[0.938vw] border-black py-[2px] lg:py-[5px] bg-transparent rounded-none mt-11 lg:mt-[3.125vw] hover:bg-gray-100"
          />
          </Link>
        </div>
      </section>

      <section className="py-[70px] mt-[81px] max-[1024px]:py-[28px] bg-[#F5F2ED80] my-[3.958vw] lg:mb-0 lg:mt-[8.281vw]">
        <Heading
          text="a few of our brand"
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
            className="button-cs text-[#1F1D1B] cursor-pointer lg:w-[18.75vw] lg:h-[4.01vw] lg:text-[0.938vw] lg:leading-[0.938vw] border-3 border-[#1F1D1B] py-[2px] w-[224px] h-[44px] lg:py-[5px] bg-transparent rounded-none mt-2 lg:mt-11 hover:bg-gray-200"
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
            className="button-cs text-[#1F1D1B] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer lg:w-[18.75vw] lg:h-[4.01vw] border-3 border-[#1F1D1B] py-[5px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-[4.688vw] hover:bg-gray-100"
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
            description="There's no question too small or request too big for our Registry advisors. We're always at your service."
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
          description="Our virtual appointments offer the  same personalized guidance — without leaving home. "
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
      {showPopup && (
        <ModalPortal>
          <Popup onClose={handleCloseModal} />
        </ModalPortal>
      )}
    </div>
  );
};

export default Home;

const REAL_REGISTRIES_QUERY = `#graphql
query getRealRegistries {
  collections(first: 50) {
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
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          description
          images(first: 1) {
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
}`;

const BRAND_QUERY = `#graphql
query getHomeBrands {
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

const BLOGS_QUERY = `#graphql
query GetAllBlogsAndArticlesForInspiration {
  blogs(first: 1, reverse: true) {
    nodes {
      title
      handle
      articles(first: 20) {
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
