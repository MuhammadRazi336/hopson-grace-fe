import React, { useState } from 'react';
import { Footer } from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
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

  <div className="w-full h-fit pt-[4.375vw]">
    <Heading text={"ready-made registries"}
      classes={ 'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0' }
      image={lineImghead} imageClasses={'max-[1024px]:max-w-[330px] lg:w-[37.5vw] lg:h-[0.417vw]'} />
    {/* <p
      className="text-center text-2xl lg:text-[1.354vw] lg:leading-[1.979vw] font-normal w-[80%] lg:w-[60%] mx-auto mb-[5.26vw] mt-[1.771vw]">
      From real couples to curated style edits, our ready-made registries are <br />personal, shoppable, and designed to
      make choosing easy.
    </p> */}
  </div>

  <div className='w-full flex flex-row justify-center lg:w-[61.354vw] mx-auto gap-6 mt-12'>
    {readyMadeRegistries.length > 0 ? (
    readyMadeRegistries.map((collection, index) => (
    <div key={collection.id} className='flex flex-col items-center'>
      <div className={`p-6 w-[300px] border-black border-2 cursor-pointer ${
        selectedParentCollection?.id===collection.id ? 'bg-[#1F1D1B] text-white' : '' }`} onClick={()=>
        setSelectedParentCollection(selectedParentCollection?.id === collection.id ? null : collection)}
        >
        {/* <img src={collection.image?.url || '/assets/Images/placeholder.png' }
          className='w-full h-full rounded-full object-cover lg:w-[16.563vw] xl:w-[16.563vw] 2xl:w-[16.563vw] lg:h-[16.563vw] xl:h-[16.563vw] 2xl:h-[16.563vw]'
          alt={collection.image?.altText || collection.title} /> */}
        <div className='text-center'>
          <h2 className='text-base lg:text-base m-0 uppercase lg:leading-[1.458vw] tracking-widest font-bold'>
            {collection.title}</h2>
          {/* <p className='text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-normal max-w-2xl mx-auto'>
            {collection.description}</p> */}
        </div>
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

  <div className="mt-[4.95vw] px-[9.323vw]">
    <div className="grid grid-cols-1 lg:gap-[1.25vw] sm:grid-cols-2 lg:grid-cols-4">
      {filteredSubCollections.map((item) => {
      const { parentCollection, subCollection } = item;

      return (
      <div key={subCollection.id} className="mb-[5.469vw] max-[767px]:w-full">
        <div className="">
          <Link to={`/registry/${subCollection.handle}`}> <img src={subCollection.image?.url
            || '/assets/Images/placeholder.png' } alt={subCollection.image?.altText || subCollection.title}
            className='aspect-square rounded-none max-[767px]:h-[70vw] w-full object-cover' />
          </Link>
          <Link to={`/registry/${subCollection.handle}`}> <h4
            className="text-xl text-[#1F1D1B] lg:mb-[0.573vw] font-medium tracking-[0.5px] mt-[1.667vw] uppercase lg:text-[1.146vw] lg:leading-[1.458vw]">
          {subCollection.title}</h4>
          </Link>
          <p
            className="text-sm ivyora lg:text-[1.042vw] lg:leading-[1.042vw] text-[#1F1D1B] mb-3 lg:mb-[0.99vw] itali tracking-wide">
            {subCollection.description?.slice(0, 95)}...</p>

          <div className='flex items-center justify-start mt-3'>
            <Link to={`/registry/${subCollection.handle}`}> <p
              className='font-bold lg:text-[0.938vw] lg:leading-[1.458vw] uppercase flex items-center gap-[0.7vw]'>View
            Registry <img src={readMoreIcon} className='w-[0.833vw] h-[0.833vw] relative -top-[2px]' alt="" /></p>
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

  <section className=" my-12 lg:my-[8.333vw]">
    <ImageAndText direction={'right'} imgBanner={teaImg} lineimg={lineImg3} title="ready?" description={ <>
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