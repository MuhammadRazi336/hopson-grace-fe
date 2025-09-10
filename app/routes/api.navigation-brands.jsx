import { json } from '@shopify/remix-oxygen';

export async function action({ request, context }) {
  try {
    // Make the query using the storefront client directly
    const result = await context.storefront.query(
      `#graphql
        query getNavigationBrands {
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
        }
      `
    );

    const { collections } = result;

    if (!collections) {
      return json({ error: 'No collections found' }, { status: 404 });
    }

    // Filter collections for brand metafield = true
    const filteredBrands = collections.nodes.filter(collection => 
      collection.metafield?.value === 'true'
    );

    return json({ brands: filteredBrands });
  } catch (error) {
    return json({ 
      error: 'Failed to fetch navigation brands',
      details: error.message,
      stack: error.stack
    }, { 
      status: 500 
    });
  }
}
