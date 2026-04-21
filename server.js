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
          "default-src 'self' https://cdn.shopify.com https://shopify.com http://localhost:* https://*.tawk.to https://*.calendly.com",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com https://cdn.shopify.com https://embed.tawk.to https://*.tawk.to https://cdn.tawk.to https://*.cdn.tawk.to https://fonts.googleapis.com https://fonts.gstatic.com https://*.jsdelivr.net https://*.unpkg.com https://assets.calendly.com https://*.calendly.com https://static.klaviyo.com https://*.klaviyo.com",
          "style-src 'self' 'unsafe-inline' https://cdn.shopify.com https://*.tawk.to https://fonts.googleapis.com https://fonts.gstatic.com https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com https://*.klaviyo.com",
          "font-src 'self' data: https://cdn.shopify.com https://*.tawk.to https://fonts.googleapis.com https://fonts.gstatic.com https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com https://*.klaviyo.com",
          "frame-src 'self' https://www.youtube.com https://cdn.shopify.com https://*.shopify.com https://www.paypal.com https://www.sandbox.paypal.com https://www.google.com https://maps.google.com https://www.google.com/maps https://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com https://*.klaviyo.com",
          "child-src 'self' https://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com https://*.klaviyo.com",
          // Allow backend API hosts for XHR/fetch (dev and production)
          "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* https://cdn.shopify.com https://monorail-edge.shopifysvc.com https://dev-hopsongrace.codup.io/api/forms/upload https://dev-hopsongrace.codup.io wss://dev-hopsongrace.codup.io https://api.theregistry.ca https://api.paypal.com https://api.sandbox.paypal.com https://www.paypal.com https://www.google.com/ https://*.tawk.to wss://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com https://*.klaviyo.com",
          "img-src 'self' blob: data: https://www.dummyimage.co.uk https://cdn.shopify.com https://hopsongrace.s3.us-west-2.amazonaws.com https://the-registry-prod.s3.us-west-2.amazonaws.com https://gc.kis.v2.scr.kaspersky-labs.com https://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com https://*.klaviyo.com",
          "media-src 'self' blob: data: https://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com",
          "worker-src 'self' blob: https://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com",
          "manifest-src 'self' https://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com",
          "form-action 'self' https://*.tawk.to https://*.jsdelivr.net https://*.unpkg.com https://*.calendly.com",
          "upgrade-insecure-requests",
          "object-src 'none'",
          "base-uri 'self'",
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
