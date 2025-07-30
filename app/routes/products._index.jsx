import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '~/assets/Images/line.png';
import ButtonComponent from '~/components/Button';
import brandline from '/assets/Images/brandline.png';
import ProductSlider from '~/components/ProductSlider';
import ExploreCategories from '~/components/ExploreCategories';
import {defer} from '@remix-run/server-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import newArrivals from '/assets/Images/newArrivals.png';
import bestSellers from '/assets/Images/bestSellers.png';
import giftCards from '/assets/Images/giftCard.png';

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

export async function loader({request, context}) {
  const {collections} = await loadCollectionData({context});
  return defer({collections});
}

async function loadCollectionData({context}) {
  const {collections} = await context.storefront.query(COLLECTION_QUERY);
  return {
    collections: collections.nodes,
  };
}

const Products = () => {
  const {collections} = useLoaderData();

  const parentCollections = collections.filter(
    (col) => col.parentMetafield?.value === 'true',
  );

  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit pt-[100px]">
        <Heading
          text="products"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-1xl lg:text-2xl font-normal text-center py-16 w-[40%] lg:w-[60%]  mx-auto">
          From heritage brands to up-and-coming makers, our collection is
          thoughtfully curated for how you actually live. Expect timeless
          design, lasting quality, and modern pieces you’ll love now—and for
          years to come. Nothing you don’t need, everything you’ll use.
        </p>
      </div>

      <div className="pt-[20px] px-16 pb-[100px]">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-16 gap-x-6 mt-16 mx-10">
          <div className="flex flex-col items-center justify-center">
            <img src={newArrivals} alt="" className="w-full" />
            <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              NEW ARRIVALS
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center">
            <img src={bestSellers} alt="" className="w-full" />
            <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              BESTSELLERS
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center">
            <img src={giftCards} alt="" className="w-full h-full bg-[#446184]" />
            <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              GIFT CARDS
            </h3>
          </div>
          {parentCollections.map((col) => (
            <Link to={`/products/${col.handle}`} key={col.id} className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <img src={col.image.url} alt={col.title} className="w-full" />
              <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                {col.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      <section className="py-[70px]  my-12 lg:my-[240px] container">
        <Heading
          text="The Registry Bestsellers"
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
            className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
          />
        </div>
      </section>

      <Footer />
    </section>
  );
};

export default Products;
