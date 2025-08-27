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
    // Add Calendly domains to the CSP
    frameSrc: ["'self'", "https://*.calendly.com"],
    childSrc: ["'self'", "https://*.calendly.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://assets.calendly.com", "https://*.calendly.com"],
    connectSrc: ["'self'", "https://*.calendly.com"],
    imgSrc: ["'self'", "blob:", "data:", "https://*.calendly.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://*.calendly.com"],
    fontSrc: ["'self'", "data:", "https://*.calendly.com"],
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

  // https://dev-hopsongrace.codup.io
  // http://localhost:3040

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  const additionalDomains = ['http://localhost:3040'];
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

  // Add Calendly domains to the CSP
  let finalCSP = updatedCSP;
  
  // Add frame-src for Calendly iframes
  if (!finalCSP.includes('frame-src')) {
    finalCSP += " frame-src 'self' https://*.calendly.com;";
  } else {
    finalCSP = finalCSP.replace(
      /frame-src([^;]*)/,
      (match, group) => `frame-src${group} https://*.calendly.com`
    );
  }
  
  // Add child-src for Calendly iframes
  if (!finalCSP.includes('child-src')) {
    finalCSP += " child-src 'self' https://*.calendly.com;";
  } else {
    finalCSP = finalCSP.replace(
      /child-src([^;]*)/,
      (match, group) => `child-src${group} https://*.calendly.com`
    );
  }

  // Update the Content-Security-Policy header with Calendly domains
  responseHeaders.set('Content-Security-Policy', finalCSP);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import("@shopify/remix-oxygen").EntryContext} EntryContext */
/** @typedef {import("@shopify/remix-oxygen").AppLoadContext} AppLoadContext */
