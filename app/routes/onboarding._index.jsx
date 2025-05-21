import { useHydrated } from '~/utils/helpers.js';
import Onboarding from '~/.client/Onboarding.jsx';
import { requireAuth } from '~/utils/auth-guard.js';
import { redirect } from '@shopify/remix-oxygen';
import StepsAndImage from '~/components/StepsAndImage';
import { useState } from 'react';

// Define step titles
const STEP_TITLES = {
  1: "the countdown is on. mark your date.",
  2: "Name of the Event!",
  3: "how many guest are you inviting?",
  4: "where would you like your gifts shipped after the wedding?",
  5: "what type of gifts would you like?",
  6: "what kind of gifts are you looking for?",
  7: "you're nearly there!",
  8: "congratulations jo & jon!"
};

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
  const [currentStep, setCurrentStep] = useState(1); // Start with step 1 for titles

  return (
    <div> 
      <StepsAndImage 
        title={STEP_TITLES[currentStep]} 
        stepNo={currentStep + 2} // Start from step 3 and increment
        totalSteps={9} // Add total number of steps
        content={hydrated && <Onboarding onStepChange={setCurrentStep} />} 
        className={currentStep === 6 || currentStep === 7 ? 'px-12' : ''} // Add className prop
      />
    </div>
  );
};

export default OnboardingIndex;
const COLLECTION_QUERY = `#graphql
query {
  collections(first: 20) {
    nodes {
      id
      description
      title
      image {
          id
          url
          altText
          width
          height
        }
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
