import {useLocation} from '@remix-run/react';
import {useNonce, getShopAnalytics, Analytics} from '@shopify/hydrogen';
import {defer} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useRouteLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
} from '@remix-run/react';
import favicon from '/assets/Images/favicon.png';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import toastStyles from 'react-toastify/dist/ReactToastify.css?url';

import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {requireAuth} from '~/utils/auth-guard.js';
import {getToast} from 'remix-toast';
import {ToastContainer, toast as notify} from 'react-toastify';
import {useEffect} from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import GuidedVideo from '~/components/GuidedVideo';
import {Preloader} from '~/components/Preloader';

const stripePromise = loadStripe(
  'pk_test_51RHKe6ELfhE2pt9mxrrxK7hhAclxCvksadMtIQCvxowOQADlw5jCFRSoj1tq7JNEVqqIE3uThE9P6K0DTQ6X3Pam006Cn180x4',
);

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */

export const shouldRevalidate = ({
  formMethod,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  return defaultShouldRevalidate;
};

export function links() {
  return [
    {rel: 'preload', href: '/assets/Images/hopson-loader.png', as: 'image'},
    {rel: 'stylesheet', href: tailwindCss},
    {rel: 'stylesheet', href: toastStyles},
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', href: favicon},
  ];
}

/**
 * Load critical data with error handling
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  try {
    // Verify storefront API access
    if (!storefront?.getStorefrontApiUrl()) {
      console.error('Storefront API URL not configured');
      return {header: null};
    }

    const [header] = await Promise.all([
      storefront.query(HEADER_QUERY, {
        cache: storefront.CacheLong(),
        variables: {
          headerMenuHandle: 'main-menu',
        },
      }).catch(error => {
        console.error('Header query error:', error);
        return null;
      }),
    ]);

    return {header};
  } catch (error) {
    console.error('Critical data error:', error);
    return {header: null};
  }
}

/**
 * Load deferred data
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // Verify API access before making the query
  if (!storefront?.getStorefrontApiUrl()) {
    console.error('Storefront API URL not configured');
    return {
      cart: null,
      isLoggedIn: false,
      footer: Promise.resolve(null),
      collections: Promise.resolve({ nodes: [] }),
    };
  }

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer',
      },
    })
    .catch((error) => {
      console.error('Footer query error:', error);
      return null;
    });

  // defer the collections query for navigation menu
  const collections = storefront
    .query(`#graphql
      query getCollectionsForNav {
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
            parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {
              id
              value
            }
            readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
              id
              value
            }
          }
        }
      }
    `, {
      cache: storefront.CacheLong(),
    })
    .catch((error) => {
      console.error('Collections query error:', error);
      return { collections: { nodes: [] } };
    });

  return {
    cart: cart?.get() || null,
    isLoggedIn: customerAccount?.isLoggedIn() || false,
    footer,
    collections,
  };
}

// Add this helper function to verify environment variables
function verifyEnvironmentVariables(env) {
  const required = [
    'PUBLIC_STOREFRONT_API_TOKEN',
    'PUBLIC_STORE_DOMAIN',
    'PUBLIC_STOREFRONT_ID',
  ];

  const missing = required.filter(key => !env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  try {
    const {context, request} = args;
    
    // Verify environment variables
    if (!verifyEnvironmentVariables(context.env)) {
      throw new Error('Missing required environment variables');
    }

    // Get authentication token
    let token;
    try {
      token = await requireAuth(context);
    } catch (authError) {
      console.warn('Authentication error:', authError);
      // Continue without token - allow public access
      token = null;
    }

    // Start fetching non-critical data
    const deferredData = loadDeferredData(args);

    // Fetch critical data with error handling
    let criticalData;
    try {
      criticalData = await loadCriticalData(args);
    } catch (error) {
      console.error('Error loading critical data:', error);
      // Provide fallback data
      criticalData = {
        header: {
          shop: null,
          menu: null,
        },
      };
    }

    const {storefront, env} = context;
    const {toast, headers} = await getToast(request);

    return defer(
      {
        ...deferredData,
        ...criticalData,
        publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
        shop: getShopAnalytics({
          storefront,
          publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
        }),
        consent: {
          checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
          storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
          withPrivacyBanner: false,
          country: context.storefront.i18n.country,
          language: context.storefront.i18n.language,
        },
        token,
        toast,
        headers,
      },
      headers,
    );
  } catch (error) {
    console.error('Root loader error:', error);
    // Return minimal data to prevent complete app failure
    return defer({
      header: null,
      footer: null,
      cart: null,
      isLoggedIn: false,
      toast: null,
      headers: null,
    });
  }
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');
  const {pathname} = useLocation();
  const isHome = pathname === '/Home';

  // Add null check before destructuring
  useEffect(() => {
    if (data?.toast) {
      notify(data.toast.message, {type: data.toast.type});
    }
  }, [data?.toast]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes rotateWithPause {
              0% { transform: rotate(0deg); }
              40% { transform: rotate(360deg); }
              50% { transform: rotate(360deg); }
              90% { transform: rotate(360deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      <body className={isHome ? 'homepage' : ''}>
        {/* Inline preloader for immediate display before React hydration */}
        <div id="inline-preloader" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          transition: 'opacity 0.5s ease-out, visibility 0.5s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/assets/Images/hopson-loader.png" 
              alt="Loading" 
              id="inline-preloader-logo"
              style={{
                width: '100px',
                height: '100px',
                animation: 'rotateWithPause 1.5s ease-in-out infinite'
              }}
            />
          </div>
        </div>
        <Preloader />
        {/* Klaviyo onsite script for footer signup trigger (mirrors coming-soon) */}
        <script async type="text/javascript" src="https://static.klaviyo.com/onsite/js/SkJCe4/klaviyo.js?company_id=SkJCe4"></script>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "!function(){if(!window.klaviyo){window._klOnsite=window._klOnsite||[];try{window.klaviyo=new Proxy({},{get:function(n,i){return'push'===i?function(){var n;(n=window._klOnsite).push.apply(n,arguments)}:function(){for(var n=arguments.length,o=new Array(n),w=0;w<n;w++)o[w]=arguments[w];var t='function'==typeof o[o.length-1]?o.pop():void 0,e=new Promise((function(n){window._klOnsite.push([i].concat(o,[function(i){t&&t(i),n(i)}]))}));return e}}})}catch(n){window.klaviyo=window.klaviyo||[],window.klaviyo.push=function(){var n;(n=window._klOnsite).push.apply(n,arguments)}}}}();",
          }}
        />
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <Elements stripe={stripePromise}>
              <PageLayout {...data}>{children}</PageLayout>
            </Elements>
          </Analytics.Provider>
        ) : (
          <div>
            {children}
            {/* You might want to add a loading state or error message here */}
          </div>
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();

  // Reset scroll position when navigating
  useEffect(() => {
    const appClip = document.getElementById('app-clip');
    if (appClip) {
      appClip.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <>
    <div id="app-clip">
      <div id="app-scale">
        <Outlet />
      </div>
    </div>

    {/* Modal outside the scaled tree */}
    <div id="modal-root"></div>

    {/* Alert outside the scaled tree */}
    <div id="alert-root" className='relative z-[100]'></div>

    {/* Sticky Header Portal - outside the scaled tree */}
    <div id="header-root"></div>

    {/* Sticky Bar Portal - outside the scaled tree */}
    <div id="sticky-bar-root"></div>

    {/* Guided Video Component */}
    {/* <GuidedVideo /> */}
    </>
    
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import("@shopify/remix-oxygen").LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import("@remix-run/react").ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import("@shopify/remix-oxygen").SerializeFrom<typeof loader>} LoaderReturnData */
