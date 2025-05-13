// @ts-ignore
// Virtual entry point for the app
import * as remixBuild from 'virtual:remix/server-build';
import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from '~/lib/context';
import {setHydrogenContext} from '~/lib/hydrogenManager.js';

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */

  async fetch(request, env, executionContext) {
    try {
      const appLoadContext = await createAppLoadContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => appLoadContext,
      });

      const response = await handleRequest(request);

      if (appLoadContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await appLoadContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: appLoadContext.storefront,
        });
      }

      // ... existing code ...
      response.headers.set(
        'Content-Security-Policy',
        [
          "default-src 'self' https://cdn.shopify.com https://shopify.com http://localhost:*",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.shopify.com",
          "style-src 'self' 'unsafe-inline' https://cdn.shopify.com",
          "font-src 'self' https://cdn.shopify.com",
          "frame-src 'self' https://www.youtube.com https://cdn.shopify.com https://*.shopify.com https://js.stripe.com",
          "connect-src 'self' https://cdn.shopify.com https://monorail-edge.shopifysvc.com https://dev-hopsongrace.codup.io/api/forms/upload https://dev-hopsongrace.codup.io",
          "img-src 'self' blob: https://www.dummyimage.co.uk",
        ].join('; '),
      );

      setHydrogenContext(response);
      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
