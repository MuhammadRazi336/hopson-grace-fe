import { json } from '@shopify/remix-oxygen';

export async function action({ request, context }) {
  try {
    // Log the incoming request

    // Parse the request body
    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids)) {
      return json({ error: 'Invalid request: ids array is required' }, { status: 400 });
    }

    // Log the IDs we're querying for

    // Make the query
    const { nodes } = await context.storefront.query(`
      query GetSubCollections($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Collection {
            id
            title
            handle
            description
          }
        }
      }
    `, {
      variables: {
        ids: body.ids
      }
    });

    // Log the response

    if (!nodes) {
      return json({ error: 'No collections found' }, { status: 404 });
    }

    return json({ collections: nodes });
  } catch (error) {
    // Log the full error    
    return json({ 
      error: 'Failed to fetch collections',
      details: error.message 
    }, { 
      status: 500 
    });
  }
} 