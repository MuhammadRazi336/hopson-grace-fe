import React, { useState } from 'react';
import { Footer } from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import { Link, useLoaderData, json } from '@remix-run/react';
import readMoreIcon from '/assets/Images/readMoreIcon.png';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/tea.png';
import lineImg3 from '/assets/Images/Vector 14.png';

export async function loader({context}) {
   try {
     const {collections} = await context.storefront.query(READY_MADE_REGISTRIES_QUERY);
     
     // Filter collections where both ready_made AND parent_collection metafields are true
     const readyMadeRegistries = collections?.nodes?.filter(collection => {
       // Check if both metafields are true
       const readyMadeMetafield = collection.readyMadeMetafield?.value === 'true';
       const parentCollectionMetafield = collection.parentCollectionMetafield?.value === 'true';
       
            return readyMadeMetafield && parentCollectionMetafield;
    }) || [];
    
    // Fetch sub-collections and their products
    const subCollectionsWithProducts = [];
    
    for (const collection of readyMadeRegistries) {
      if (collection.subCollectionMetafield?.value) {
        try {
          const subCollectionIds = JSON.parse(collection.subCollectionMetafield.value);
          
          for (const subCollectionId of subCollectionIds) {
            // Extract the numeric ID from the Shopify GID
            const numericId = subCollectionId.split('/').pop();
            
            // Fetch the sub-collection data
            const subCollectionData = await context.storefront.query(SUB_COLLECTION_QUERY, {
              variables: { id: subCollectionId }
            });
            
            if (subCollectionData.collection) {
              subCollectionsWithProducts.push({
                parentCollection: collection,
                subCollection: subCollectionData.collection
              });
            }
          }
        } catch (e) {
          console.log('Error parsing subCollectionMetafield:', e);
        }
      }
    }
    
    console.log('Sub-collections with products:', subCollectionsWithProducts);
    
    return json({ readyMadeRegistries, subCollectionsWithProducts });
   } catch (error) {
     console.error('Error loading ready-made registries:', error);
     return json({ readyMadeRegistries: [], subCollectionsWithProducts: [] });
   }
 }

const ReadyMade = () => {
   const { readyMadeRegistries, subCollectionsWithProducts } = useLoaderData();
   // State to track which parent collection is selected
   const [selectedParentCollection, setSelectedParentCollection] = React.useState(null);
   
   // Filter sub-collections based on selected parent
   const filteredSubCollections = selectedParentCollection 
     ? subCollectionsWithProducts.filter(item => item.parentCollection.id === selectedParentCollection.id)
     : subCollectionsWithProducts;
  
  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit pt-[100px]">
        <Heading
          text={"ready-made registries"}
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-center text-2xl lg:text-3xl font-normal w-[80%] lg:w-[60%] mx-auto my-10">
        From real couples to curated style edits, our ready-made registries are  personal, shoppable, and designed to make choosing easy.
        </p>
      </div>

             <div className='w-full flex flex-row items-center justify-center gap-8 my-8 md:my-16 px-4 md:px-16'>
         {readyMadeRegistries.length > 0 ? (
                       readyMadeRegistries.map((collection, index) => (
              <div key={collection.id} className='flex flex-col items-center gap-6 w-full max-w-4xl'>
               <div 
                 className={`rounded-full w-[100px] h-[100px] md:w-[200px] md:h-[200px] lg:w-[350px] lg:h-[350px] cursor-pointer transition-all duration-300 ${
                   selectedParentCollection?.id === collection.id ? 'ring-4 ring-[#446184] ring-offset-4' : ''
                 }`}
                 onClick={() => setSelectedParentCollection(selectedParentCollection?.id === collection.id ? null : collection)}
               >
                 <img 
                   src={collection.image?.url || '/assets/Images/placeholder.png'} 
                   className='w-full h-full rounded-full object-cover' 
                   alt={collection.image?.altText || collection.title} 
                 />
               </div>
               <div className='text-center'>
                 <h2 className='text-4xl font-medium mb-4'>{collection.title}</h2>
                 <p className='text-xl font-normal max-w-2xl mx-auto'>{collection.description}</p>
               </div>
             </div>
           ))
         ) : (
           <div className="text-center text-gray-500">
             <p>No ready-made registries found.</p>
             <p className="text-sm">Please check your metafield configuration.</p>
           </div>
         )}
            </div>

                <div className="my-[100px] px-16">                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredSubCollections.map((item) => {
                      const { parentCollection, subCollection } = item;
                      
                      return (
                        <div key={subCollection.id} className="">
                          <div className="w-[80%]">
                            <img src={subCollection.image?.url || '/assets/Images/placeholder.png'} alt={subCollection.image?.altText || subCollection.title}/>
                            <h4 className="text-xl font-medium mt-3 uppercase">{subCollection.title}</h4>
                            <p className="text-sm text-gray-600 mb-3 italic">{subCollection.description?.slice(0, 95)}...</p>
                            
                            <div className='flex items-center justify-start mt-3'>
                              <Link to={`/registry/${subCollection.handle}`}>
                                <p className='font-bold flex items-center gap-2'>View Registry <img src={readMoreIcon} alt="" /></p>
                </Link>
            </div>
          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {filteredSubCollections.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p>No sub-collections found for the selected registry.</p>
                    </div>
                  )}
                </div>

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
    </section>
  );
};

export default ReadyMade;


const READY_MADE_REGISTRIES_QUERY = `#graphql
query getReadyMadeRegistries {
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
 query getReadyMadeSubCollection($id: ID!) {
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
     products(first: 50) {
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
`;