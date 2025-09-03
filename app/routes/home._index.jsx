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

export async function loader({ context }) {
  try {
    const [{ collections }, { collections: brandCollections }] = await Promise.all([
      context.storefront.query(REAL_REGISTRIES_QUERY),
      context.storefront.query(BRAND_QUERY)
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
    
    return json({ realRegistries, featuredRegistryData, brands });
  } catch (error) {
    console.error('Error loading real registries:', error);
    return json({ realRegistries: [], featuredRegistryData: null });
  }
}

const Home = () => {
  const { realRegistries, featuredRegistryData, brands } = useLoaderData();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Debug logging for brands
  console.log('Home page received brands:', brands);
  console.log('Brands length:', brands?.length || 0);
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
      <section className="hero-slider lg:h-[940px]">
        <HeroSlider />
      </section>
      <section className="text-and-button-section py-14 lg:py-36">
        <Textandbutton />
      </section>
      <section className="lg:mb-[240px]">
        <CollectionItems />
      </section>

      <section className="mb-[90px] mt-12">
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
            'prata text-3xl lg:text-5xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] mb-10'}
        />
        <p className="text-center md:text-lg lg:text-[26px] 2xl:text-[26px] md:leading-[24px] lg:leading-[38px] xl:leading-[38px] 2xl:leading-[38px] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-10 mb-8">
        From real couples to curated style edits, our ready-made registries are personal, shoppable, and designed to make choosing easy.
      </p>
        <CustomTab tabsData={tabsData} featuredRegistryData={featuredRegistryData} />
        <div className="text-center">
        <Link to="/ready-made-registries">
          <ButtonComponent
            text="EXPLORE"
            className="button-cs text-black border-3 w-[360px] border-black py-4 lg:py-[21px] bg-transparent rounded-none mt-11 hover:bg-gray-100"
          />
          </Link>
        </div>
      </section>

      <section className="py-[70px] bg-[#F5F2ED80] my-12 lg:my-[240px]">
        <Heading
          text="a few of our brands"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={lineImg4}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[525px]'}
        />
        <Marquee brands={brands} />
        <div className="text-center">
          <Link to="/our-brands">
          <ButtonComponent
            text="EXPLORE ALL BRANDS"
            className="button-cs text-[#1F1D1B] lg:w-[360px] border-3 border-[#1F1D1B] py-4 lg:py-[21.5px] bg-transparent rounded-none mt-2 lg:mt-11 hover:bg-gray-200"
          />
          </Link>
        </div>
      </section>

      <section className="py-[70px]  my-12 lg:my-[240px] container">
        <Heading
          text="the registry bestsellers"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={brandline}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <ProductSlider />
        <div className="text-center">
          <ButtonComponent
            text="BROWSE BESTSELLERS"
            className="button-cs text-[#1F1D1B] lg:w-[360px] border-3 border-[#1F1D1B] py-[21.5px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11 hover:bg-gray-100"
          />
        </div>
      </section>

      <section className="mb-[70px] mt-12">
        <Heading
          text="inspiration"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[230px]'}
        />
        <p className="text-center mt-5 md:text-[26px] lg:text-[26px] 2xl:text-[26px] md:leading-[38px] lg:leading-[38px] xl:leading-[38px] 2xl:leading-[38px] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-10 mb-8">
          A peek inside some of our most-loved celebrations.
        </p>
        <Testimonialslider />
        <div className="text-center">
          <ButtonComponent
            text="EXPLORE REAL WEDDINGS"
            className="button-cs text-[#1F1D1B] lg:w-[360px] border-3 border-[#1F1D1B] py-[26.5px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11 hover:bg-gray-100"
          />
        </div>
      </section>

      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'left'}
          imgBanner={flowerImg}
          lineimg={lineImg}
          title="at your service"
          description={
            <>
              There's no question too small or request too big for our Registry
              advisors.We're always at your service.
            </>
          }
          buttontext={'CONTACT US'}
          buttontype={'link'}
          buttonLink={'/contact-us'}
        />
      </section>

      <section className="max-[1024px]:py-10">
        <Faqs />
      </section>

      <section className=" my-12 lg:my-[240px]">
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

      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="are you ready?"
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
      
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 p-2 right-8 z-50 w-[85px] h-[85px] bg-black hover:bg-[#272727] text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 ${
          showBackToTop 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        {/* <svg 
          className="w-6 h-6 mx-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg> */}
        <img src={arrowUp} className='text-white invert rotate-180 mx-auto w-[15px] h-[13px] mb-1' alt="arrowUp" />
        <span className="text-white text-sm">Back to Top</span>
      </button>
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
