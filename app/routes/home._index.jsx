import {Footer} from '~/components/Footer';
import HeroSlider from '~/components/HeroSlider';
import Textandbutton from '~/components/Textandbutton';
import SliderItems from '~/components/SliderItems';
import ImageAndText from '~/components/ImageAndText';
import flowerImg from '/assets/Images/flower.png';
import showroomImg from '/assets/Images/showroom.png';
import cupImg from '/assets/Images/cups.png';
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
import GuidedVideo from '~/components/GuidedVideo';
import LiveChat from '~/components/LiveChat';

export async function loader({ context }) {
  try {
    // Get user session if available (optional for non-logged in users)
    const user = context?.session?.get('@User');
    
    const [{ collections }, { collections: brandCollections }, { products: bestsellerProducts }] = await Promise.all([
      context.storefront.query(REAL_REGISTRIES_QUERY),
      context.storefront.query(BRAND_QUERY),
      context.storefront.query(BESTSELLER_PRODUCTS_QUERY, { variables: { first: 8 } })
    ]);
    
    // Filter collections where both ready_made AND parent_collection metafields are true
    const realRegistries = collections?.nodes?.filter(collection => {
      const readyMadeMetafield = collection.readyMadeMetafield?.value === 'true';
      const parentCollectionMetafield = collection.parentCollectionMetafield?.value === 'true';
      return readyMadeMetafield && parentCollectionMetafield;
    }) || [];

    // Filter brand collections for the marquee
    const brands = brandCollections?.nodes?.filter(collection =>
      collection.metafield?.value === 'true'
    ) || [];
    
    console.log('All collections:', collections?.nodes);
    console.log('Real registries (parent collections):', realRegistries);
    console.log('Brands for marquee:', brands);
    
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
        console.log('Using fallback: first collection');
      }
      
      console.log('Selected registry collection:', realRegistriesCollection);
      console.log('Selection reason: Priority-based selection for Real Registries');
      
      if (realRegistriesCollection.subCollectionMetafield?.value) {
        try {
          const subCollectionIds = JSON.parse(realRegistriesCollection.subCollectionMetafield.value);
          
          // Fetch ALL sub-collections for display (not just the first one)
          if (subCollectionIds.length > 0) {
            console.log('Sub-collection IDs:', subCollectionIds);
            
            // Fetch all sub-collections
            const subCollectionsData = [];
            for (const subCollectionId of subCollectionIds) {
              console.log('Fetching sub-collection:', subCollectionId);
              
              const subCollectionData = await context.storefront.query(SUB_COLLECTION_QUERY, {
                variables: { id: subCollectionId }
              });
              
              if (subCollectionData.collection) {
                subCollectionsData.push(subCollectionData.collection);
              }
            }
            
            console.log('All sub-collections data:', subCollectionsData);
            
            if (subCollectionsData.length > 0) {
              // Return all sub-collections data
              featuredRegistryData = {
                parentCollection: realRegistriesCollection,
                subCollections: subCollectionsData
              };
              console.log(`Successfully fetched ${subCollectionsData.length} sub-collections`);
            } else {
              console.log('No sub-collections found');
            }
          }
        } catch (e) {
          console.log('Error parsing subCollectionMetafield:', e);
        }
      }
    }
    
    console.log('Featured registry data:', featuredRegistryData);
    
    return json({ realRegistries, featuredRegistryData, brands, user, bestsellerProducts: bestsellerProducts?.edges || [] });
  } catch (error) {
    console.error('Error loading real registries:', error);
    return json({ realRegistries: [], featuredRegistryData: null, brands: [], user: null, bestsellerProducts: [] });
  }
}

const Home = () => {
  const { realRegistries, featuredRegistryData, brands, user, bestsellerProducts } = useLoaderData();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Debug logging for brands
  console.log('Home page received brands:', brands);
  console.log('Brands length:', brands?.length || 0);
  
  // Debug logging for bestseller products
  console.log('Home page received bestsellerProducts:', bestsellerProducts);
  console.log('Bestseller products length:', bestsellerProducts?.length || 0);
  console.log('First bestseller product:', bestsellerProducts?.[0]);
  if (brands && brands.length > 0) {
    console.log('First brand sample:', brands[0]);
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
    {
      label: 'LOREM IPSUM',
      value: 3,
      route: 'lorem',
    },
  ];
  return (
    <div className="overflow-x-hidden">
      <Header />
      <section className="hero-slider lg:h-[48.958vw]">
        <HeroSlider />
      </section>
      <section className="text-and-button-section py-14 lg:py-[7.76vw]">
        <Textandbutton />
      </section>
      <section className="lg:mb-[10.417vw]">
        <CollectionItems />
      </section>

      <section className="mb-[10.417vw]">
        <ImageAndText
          direction={'right'}
          imgBanner={cupImg}
          lineimg={lineImg}
          stepsCheck={true}
          title="how it works"
          description="There's no question too small or request too big for our Registry advisors. We're always at your service."
          buttontext={'CREATE YOUR REGISTRY'}
          buttontype={'Color'}
          buttonLink={'/register'}
        />
      </section>

      <section>
        <Heading
          text="ready-made registries"
          classes={
            'prata text-2xl lg:text-[2.5vw] lg:leading-[3.542vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] mb-[3.177vw]'}
        />
        <p className="text-center lg:text-[1.354vw] lg:leading-[1.979vw] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-[4.323vw] mb-8">
        From real couples to curated style edits, our ready-made registries are personal, <br/>shoppable, and designed to make choosing easy.
      </p>
        <CustomTab tabsData={tabsData} featuredRegistryData={featuredRegistryData} />
        <div className="text-center">
        <Link to="/ready-made-registries">
          <ButtonComponent
            text="BROWSE READY-MADE REGISTRIES"
            className="button-cs text-black cursor-pointer border-3 w-[360px] lg:w-[18.75vw] lg:h-[4.01vw] lg:text-[0.938vw] lg:leading-[0.938vw] border-black py-4 lg:py-[5px] bg-transparent rounded-none mt-11 lg:mt-[3.125vw] hover:bg-gray-100"
          />
          </Link>
        </div>
      </section>

      <section className="py-[70px] bg-[#F5F2ED80] my-[3.958vw] lg:mb-0 lg:mt-[8.281vw]">
        <Heading
          text="a few of our brands"
          classes={
            'prata text-3xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center lg:mb-[0.833vw] max-[1024px]:m-0'
          }
          image={lineImg4}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[27.344vw] lg:h-[0.311vw]'}
        />
        <Marquee brands={brands} />
        <div className="text-center">
          <Link to="/our-brands">
          <ButtonComponent
            text="EXPLORE ALL BRANDS"
            className="button-cs text-[#1F1D1B] cursor-pointer lg:w-[18.75vw] lg:h-[4.01vw] lg:text-[0.938vw] lg:leading-[0.938vw] border-3 border-[#1F1D1B] py-4 lg:py-[5px] bg-transparent rounded-none mt-2 lg:mt-11 hover:bg-gray-200"
          />
          </Link>
        </div>
      </section>

      <section className="py-[70px] my-12 lg:py-[10.625vw] lg:my-0 container">
        <Heading
          text="the registry bestsellers"
          classes={
            'prata text-3xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center lg:mb-[0.833vw] max-[1024px]:m-0'
          }
          image={brandline}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[33.021vw] lg:h-[0.450vw]'}
        />
        <ProductSlider products={bestsellerProducts} />
        <div className="text-center">
          <ButtonComponent
            text="BROWSE BESTSELLERS"
            className="button-cs text-[#1F1D1B] lg:w-[18.75vw] lg:h-[4.01vw] cursor-pointer border-3 border-[#1F1D1B] py-[5px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-[4.271vw] hover:bg-gray-100"
          />
        </div>
      </section>

      <section className="mb-[70px] mt-0 lg:mb-0">
        <Heading
          text="inspiration"
          classes={
            'prata text-3xl lg:text-[2.5vw] lg:leading-[1.875vw] lg:mb-[0.833vw] font-normal text-center  max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[230px] lg:w-[17.604vw] lg:h-[0.400vw]'}
        />
        <p className="text-center mt-5 lg:text-[1.354vw] lg:leading-[1.979vw] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mt-[2.135vw] lg:mb-0 mb-8">
          A peek inside some of our most-loved celebrations.
        </p>
        <Testimonialslider />
        <div className="text-center">
          <ButtonComponent
            text="EXPLORE REAL WEDDINGS"
            className="button-cs text-[#1F1D1B] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer lg:w-[18.75vw] lg:h-[4.01vw] border-3 border-[#1F1D1B] py-[5px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-[4.688vw] hover:bg-gray-100"
          />
        </div>
      </section>

      <section className=" my-12 lg:my-[10.417vw]">
      <ImageAndText
            direction={'left'}
            imgBanner={flowerImg}
            lineimg={lineImg}
            title=" questions?"
            description="We've got answers."
            showLiveChat={true}
            liveChatProps={{
              buttonText: "PHONE, EMAIL OR LIVE CHAT",
              showTitle: false,
              showDescription: false,
              className: "bg-[#446184] text-white hover:bg-[#3a4f6b]"
            }}
          />
      </section>

      <section className="max-[1024px]:py-10">
        <Faqs />
      </section>

      <section className=" my-12 lg:my-[10.417vw]">
        <ImageAndText
          direction={'left'}
          imgBanner={showroomImg}
          lineimg={lineImg2}
          title=<>book a virtual <br/>appointment</>
          description="Our virtual appointments offer the  same personalized guidance — without leaving home. "
          buttontext={'BOOK NOW'}
          buttontype={'link'}
        />
      </section>

      <section className=" my-12 lg:my-[10.417vw]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
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
          buttonLink={'/register'}
        />
      </section>
      <Footer />
      
      {/* Guided Video Component */}
      <GuidedVideo />
      
      {/* Back to Top Button */}
      {/* <button
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
      </button> */}
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
      metafield(namespace: "custom", key: "brand") {
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
