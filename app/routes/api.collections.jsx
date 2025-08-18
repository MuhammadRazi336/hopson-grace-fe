import { json } from '@shopify/remix-oxygen';

export async function action({ request, context }) {
  try {
    // Parse the request body
    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids)) {
      return json({ error: 'Invalid request: ids array is required' }, { status: 400 });
    }

    // Log the IDs we're querying for

    // Make the query using the storefront client directly
    const result = await context.storefront.query(
      `#graphql
        query GetSubCollections($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Collection {
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
            }
          }
        }
      `,
      {
        variables: {
          ids: body.ids
        }
      }
    );

    const { nodes } = result;

    // Log the response

    if (!nodes) {
      return json({ error: 'No collections found' }, { status: 404 });
    }

    return json({ collections: nodes });
  } catch (error) {
    return json({ 
      error: 'Failed to fetch collections',
      details: error.message,
      stack: error.stack
    }, { 
      status: 500 
    });
  }
} 