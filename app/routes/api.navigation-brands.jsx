import { json } from '@shopify/remix-oxygen';

export async function action({ request, context }) {
  try {
    // Make the query using the storefront client directly
    const result = await context.storefront.query(
      `#graphql
        query getNavigationBrands {
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

    // Debug logging to check for duplicates
    console.log('Total collections:', collections.nodes.length);
    console.log('Filtered brands count:', filteredBrands.length);
    console.log('Brand titles:', filteredBrands.map(brand => brand.title));
    
    // Check for duplicate titles and remove duplicates
    const titles = filteredBrands.map(brand => brand.title);
    const uniqueTitles = [...new Set(titles)];
    if (titles.length !== uniqueTitles.length) {
      console.warn('Duplicate brand titles found:', titles.filter((title, index) => titles.indexOf(title) !== index));
    }

    // Remove duplicates by title (keep first occurrence)
    const uniqueBrands = filteredBrands.filter((brand, index, self) => 
      index === self.findIndex(b => b.title === brand.title)
    );

    console.log('Unique brands count after deduplication:', uniqueBrands.length);

    return json({ brands: uniqueBrands });
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
