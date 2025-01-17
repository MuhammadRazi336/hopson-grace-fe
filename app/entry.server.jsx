import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  const additionalDomains = [
    'https://dev-hopsongrace.codup.io',
    'blob:', // Allow blob URLs
    "'self'",
  ];
  const existingCSP = responseHeaders.get('Content-Security-Policy') || ''; // Get the current CSP header

  // Join additional domains into a space-separated string
  const additionalDomainsString = additionalDomains.join(' ');

  // Update the CSP header inline
  const updatedCSP = existingCSP.includes('connect-src')
    ? existingCSP.replace(
        /connect-src([^;]*)/,
        (match, group) => `connect-src${group} ${additionalDomainsString}`,
      )
    : `${existingCSP} connect-src 'self' ${additionalDomainsString};`;

  // Ensure `img-src` allows `blob:` URLs and other domains
  const imgSrcPolicy = `img-src 'self' blob: ${additionalDomainsString};`;
  const baseUriPolicy = 'base-uri; ' + "'self'";

  // Update the Content-Security-Policy header with both `img-src` and `connect-src` directives
  responseHeaders.set(
    'Content-Security-Policy',
    `${imgSrcPolicy} ${updatedCSP} ${baseUriPolicy}`,
  );

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import("@shopify/remix-oxygen").EntryContext} EntryContext */
/** @typedef {import("@shopify/remix-oxygen").AppLoadContext} AppLoadContext */
