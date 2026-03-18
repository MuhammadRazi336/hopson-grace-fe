import { json } from '@shopify/remix-oxygen';

export async function action({ request, context }) {
  try {
    // Make the query using the storefront client directly
    const result = await context.storefront.query(
      `#graphql
        query getNavigationCollections {
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

    // Filter collections for parent_collection=true and NOT ready_made=true
    // This matches the logic used on other pages (e.g. onboarding step 6, products index)
    const filteredCollections = collections.nodes.filter((collection) => {
      const isParent =
        collection.parentCollectionMetafield &&
        typeof collection.parentCollectionMetafield.value === 'string' &&
        collection.parentCollectionMetafield.value.trim() === 'true';

      const isReadyMade =
        collection.readyMadeMetafield &&
        typeof collection.readyMadeMetafield.value === 'string' &&
        collection.readyMadeMetafield.value.trim() === 'true';

      return isParent && !isReadyMade;
    });

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
