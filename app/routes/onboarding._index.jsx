import { useHydrated } from '~/utils/helpers.js';
import Onboarding from '~/.client/Onboarding.jsx';
import { requireAuth } from '~/utils/auth-guard.js';
import { redirect } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import StepsAndImage from '~/components/StepsAndImage';
import { useState, useEffect } from 'react';
import { Header } from '~/components/Header';
import { Footer } from '~/components/Footer';

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

// Define step titles (1-9)
const STEP_TITLES = {
  1: "let's get to know each other.",
  2: "and your partner?",
  3: "let's secure your account.",
  4: "the countdown is on. mark your date.",
  5: "how many guest are you inviting?",
  6: "where would you like your gifts shipped after the wedding?",
  7: "what type of gifts would you like?",
  8: "what kind of gifts are you looking for?",
  9: "you're nearly there!"
};

export async function loader({ request, context }) {
  try {
    const user = await requireAuth(context);
    const url = new URL(request.url);
    const stepParam = url.searchParams.get('step');
    const stepFromQuery = stepParam ? Number(stepParam) : null;
    
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
        error: null,
        stepFromQuery
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
  const { user, stepFromQuery } = useLoaderData();
  const [currentStep, setCurrentStep] = useState(stepFromQuery ? stepFromQuery : 3); // Start at 3 by default

  // // Refresh the page once whenever user goes to onboarding page
  // if (typeof window !== 'undefined') {
  //   const hasReloaded = localStorage.getItem('onboarding-reloaded');
    
  //   // If we haven't reloaded yet, refresh the page once
  //   if (!hasReloaded) {
  //     console.log('Refreshing onboarding page...');
  //     localStorage.setItem('onboarding-reloaded', 'true');
  //     window.location.reload();
  //   }
  // }

  // Get user first names for dynamic step title
  const firstName = user?.user?.firstName || '';
  const fianceFirstName = user?.user?.fianceFirstName || '';
  
  // Create dynamic step titles
  const getStepTitle = (step) => {
    if (step === 9) {
      // Dynamic title for step 9 using user names
      if (firstName && fianceFirstName) {
        const lowerFirstName = firstName.toLowerCase();
        const lowerFianceFirstName = fianceFirstName.toLowerCase();
        return `congratulations ${lowerFirstName} & ${lowerFianceFirstName}!`;
      } else if (firstName) {
        const lowerFirstName = firstName.toLowerCase();
        return `congratulations ${lowerFirstName}!`;
      } else {
        return 'congratulations!';
      }
    }
    return STEP_TITLES[step] || '';
  };

  return (
    <div>
      <Header />
      <StepsAndImage 
        title={getStepTitle(currentStep)} 
        stepNo={currentStep}
        totalSteps={9}
        content={hydrated && <Onboarding onStepChange={(val) => setCurrentStep((val || 1) + 2)} />} 
        className={currentStep === 8 || currentStep === 9 ? 'px-12' : ''}
      />
      <Footer />
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
