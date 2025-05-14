import { useHydrated } from '~/utils/helpers.js';
import Onboarding from '~/.client/Onboarding.jsx';
import { requireAuth } from '~/utils/auth-guard.js';
import { redirect } from '@shopify/remix-oxygen';

export async function loader({ request, context }) {
  try {
    const user = await requireAuth(context);
    
    // Add proper headers for the Storefront API
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': context.env.PUBLIC_STOREFRONT_API_TOKEN,
    };

    // Query collections with proper error handling
    let collections;
    try {
      const result = await context.storefront.query(COLLECTION_QUERY, {
        headers,
        cache: context.storefront.CacheLong(),
      });
      collections = result.collections;
    } catch (error) {
      console.error('Error fetching collections:', error);
      collections = { nodes: [] };
    }

    if (user) {
      return { 
        user, 
        collections, 
        context,
        error: null 
      };
    }
    return redirect('/');
  } catch (error) {
    console.error('Onboarding loader error:', error);
    return {
      user: null,
      collections: { nodes: [] },
      context: null,
      error: 'Failed to load onboarding data'
    };
  }
}

const OnboardingIndex = () => {
  const hydrated = useHydrated();
  return <div>{hydrated && <Onboarding />}</div>;
};

export default OnboardingIndex;
const COLLECTION_QUERY = `#graphql
query {
  collections(first: 20) {
    nodes {
      id
      description
      title
      metafield(namespace: "parent", key: "collection") {
        key
        value
        namespace
        type
      }
      subCollections: metafield(namespace: "sub", key: "collection") {
        value
      }
    }
  }
}
`;
