import { json } from '@shopify/remix-oxygen';

export async function action({ request, context }) {
  try {
    // Make the query using the storefront client directly
    const result = await context.storefront.query(
      `#graphql
        query getNavigationCollections {
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
              parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {
                id
                value
              }
              readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
                id
                value
              }
            }
          }
        }
      `
    );

    const { collections } = result;

    if (!collections) {
      return json({ error: 'No collections found' }, { status: 404 });
    }

    // Filter collections for parent_collection=true and ready_made=false
    const filteredCollections = collections.nodes.filter(collection => 
      collection.parentCollectionMetafield?.value === 'true' && 
      collection.readyMadeMetafield?.value === 'false'
    );

    return json({ collections: filteredCollections });
  } catch (error) {
    return json({ 
      error: 'Failed to fetch navigation collections',
      details: error.message,
      stack: error.stack
    }, { 
      status: 500 
    });
  }
}
