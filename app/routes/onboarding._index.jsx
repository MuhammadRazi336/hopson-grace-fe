import { useHydrated } from '~/utils/helpers.js';
import Onboarding from '~/.client/Onboarding.jsx';
import { requireAuth } from '~/utils/auth-guard.js';
import { redirect } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import StepsAndImage from '~/components/StepsAndImage';
import { useState } from 'react';

// GraphQL query for collections
const COLLECTIONS_QUERY = `#graphql
  query Collections {
    collections(first: 20) {
      nodes {
        id
        title
        description
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
        readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
          id
          value
        }
      }
    }
  }
`;

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
    
    // Query collections using the storefront client directly
    let collections = { nodes: [] };
    try {
      const result = await context.storefront.query(COLLECTIONS_QUERY);
      collections = result.collections;
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Continue without collections - don't fail the entire loader
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
  const { user } = useLoaderData();
  const [currentStep, setCurrentStep] = useState(1); // Start with step 1 for titles

  // Get user first names for dynamic step title
  const firstName = user?.user?.firstName || '';
  const fianceFirstName = user?.user?.fianceFirstName || '';
  
  // Create dynamic step titles
  const getStepTitle = (step) => {
    if (step === 8) {
      // Dynamic title for step 8 using user names
      if (firstName && fianceFirstName) {
        return `congratulations ${firstName} & ${fianceFirstName}!`;
      } else if (firstName) {
        return `congratulations ${firstName}!`;
      } else {
        return 'congratulations!';
      }
    }
    return STEP_TITLES[step] || '';
  };

  return (
    <div> 
      <StepsAndImage 
        title={getStepTitle(currentStep)} 
        stepNo={currentStep + 1} // Start from step 3 and increment
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
