import { useHydrated } from '~/utils/helpers.js';
import Onboarding from '~/.client/Onboarding.jsx';
import { requireAuth } from '~/utils/auth-guard.js';
import { redirect } from '@shopify/remix-oxygen';

export async function loader({ request, context }) {
  const user = await requireAuth(context);
  const [{ collections }] = await Promise.all([
    context.storefront.query(COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);
  if (user) {
    return { user, context, collections };
  }
  return redirect('/');
}

const OnboardingIndex = () => {
  const hydrated = useHydrated();
  return <div>{hydrated && <Onboarding />}</div>;
};

export default OnboardingIndex;
const COLLECTION_QUERY = `#graphql
query {
collections(first: 10) {
nodes {
        description
        title
      }
    }
  }
`;
