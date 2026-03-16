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
    collections(first: 100) {
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
        parentMetafield: metafield(namespace: "parent", key: "collection") {
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

// Define step titles (1-8)
const STEP_TITLES = {
  1: "let's get to know each other.",
  2: "and your partner?",
  3: "let's secure your account.",
  4: "the countdown is on. mark your date.",
  5: "how many guest are you inviting?",
  6: "where would you like your gifts shipped after the wedding?",
  7: "what kind of gifts are you looking for?",
  8: "you're nearly there!"
};

export async function loader({ request, context }) {
  try {
    const user = await requireAuth(context);
    const url = new URL(request.url);
    const stepParam = url.searchParams.get('step');
    const stepFromQuery = stepParam ? Number(stepParam) : null;
    
    // Query collections using the storefront client directly and filter out collections that don't have at least one of the relevant metafields
    let collections = {nodes: []};
    try {
      const result = await context.storefront.query(COLLECTIONS_QUERY);
      const allCollections = result.collections?.nodes || [];
      // Keep only collections that have at least one of the relevant metafields
      const filteredNodes = allCollections.filter((collection) => {
        return (
          collection?.parentMetafield != null ||
          collection?.subCollections != null ||
          collection?.readyMadeMetafield != null
        );
      });
      collections = {nodes: filteredNodes};
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Continue without collections - don't fail the entire loader
    }

    if (user) {
      return {
        user,
        collections,
        error: null,
        stepFromQuery,
      };
    }
    return redirect('/');
  } catch (error) {
    console.error('Onboarding loader error:', error);
    return {
      user: null,
      collections: {nodes: []},
      error: 'Failed to load onboarding data',
    };
  }
}

const OnboardingIndex = () => {
  const hydrated = useHydrated();
  const { user, stepFromQuery, collections } = useLoaderData();
  console.log('Collections in OnboardingIndex:', collections);
  const [currentStep, setCurrentStep] = useState(stepFromQuery ? stepFromQuery : 3); // Start at 3 by default
  const [isSubcollectionPage, setIsSubcollectionPage] = useState(false);

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
    // Subcollection page (step 7 when isSubcollectionPage is true) - "you're nearly there!"
    if (step === 7 && isSubcollectionPage) {
      return STEP_TITLES[8] || "you're nearly there!";
    }
    // Final dashboard page (step 8) - congratulations with couple names
    if (step === 8) {
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
    // Map headings: step 3 uses step 4's heading, step 4 uses step 5's heading, step 5 uses step 6's heading, step 6 uses step 7's heading
    if (step === 3) {
      return STEP_TITLES[4] || ''; // "the countdown is on. mark your date."
    } else if (step === 4) {
      return STEP_TITLES[5] || ''; // "how many guest are you inviting?"
    } else if (step === 5) {
      return STEP_TITLES[6] || ''; // "where would you like your gifts shipped after the wedding?"
    } else if (step === 6) {
      return STEP_TITLES[7] || ''; // "what kind of gifts are you looking for?" (parent collections)
    }
    return STEP_TITLES[step] || '';
  };

  return (
    <div>
      <Header />
      <StepsAndImage 
        title={getStepTitle(currentStep)} 
        stepNo={currentStep}
        totalSteps={7}
        showPagination={currentStep !== 8}
        content={hydrated && <Onboarding onStepChange={(val) => {
          // Map internal steps to display steps: 1→3, 2→4, 3→5, 4→6, 5→7 (subcollection), 6→8 (final dashboard)
          if (val === 6) {
            setCurrentStep(8); // Final dashboard is step 8
            setIsSubcollectionPage(false);
          } else if (val === 5) {
            setCurrentStep(7); // Subcollection page is step 7
            setIsSubcollectionPage(true);
          } else {
            setCurrentStep((val || 1) + 2);
            setIsSubcollectionPage(false);
          }
        }} />}
        className={currentStep === 8 ? 'px-12' : ''}
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
