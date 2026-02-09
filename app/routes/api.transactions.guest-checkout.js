import {json} from '@shopify/remix-oxygen';
import {getPayPalAccessToken, capturePayPalOrder} from '~/lib/paypal';

// API base for order persistence (same as API_BASE_URL)
const getApiBase = (context) =>
  (context?.env?.API_BASE_URL || process.env.API_BASE_URL || 'https://dev-hopsongrace.codup.io').replace(/\/$/, '');

/**
 * POST /api/transactions/guest-checkout
 * Body: { paypalOrderId, registryId, email, firstName, lastName, lineItems, message }
 * 1. Captures the PayPal order.
 * 2. Forwards to external API for order completion (if configured).
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const body = await request.json();
    const {
      paypalOrderId,
      registryId,
      email,
      firstName,
      lastName,
      lineItems,
      message,
    } = body;

    if (!paypalOrderId || paypalOrderId.length < 10) {
      return json({error: 'Invalid PayPal order ID'}, {status: 400});
    }
    if (!registryId || !email || !firstName || !lastName || !lineItems?.length) {
      return json({error: 'Missing required checkout data'}, {status: 400});
    }

    const clientId =
      context.env?.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || 'AYCtXi-gPXhpiK5Z6p9IEBplxxkF66C0iDhUlVIBW9iQKzjbzl5jMfgaUhKhZ9ozWKrTz9PGKBe60yGH';
    const clientSecret =
      context.env?.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET || 'EB65ot5LSOOHnP8pDYqsXf9xdrXKAa8d0oVRoVf5R0TEvhmS-mJwcjjkNMRG7gz6qLKSFLf5tMrlzjbb';

    if (!clientId || !clientSecret) {
      return json(
        {
          error:
            'PayPal not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
        },
        {status: 500},
      );
    }

    const accessToken = await getPayPalAccessToken({
      clientId,
      clientSecret,
    });
    await capturePayPalOrder(accessToken, paypalOrderId);

    // Forward to external API for order persistence (same payload; external API must accept paypalOrderId)
    try {
      const res = await fetch(`${getApiBase(context)}/api/transactions/guest-checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          paypalOrderId,
          registryId: Number(registryId),
          email: email.trim(),
          firstName: (firstName || '').trim(),
          lastName: (lastName || '').trim(),
          lineItems,
          message: (message || '').trim(),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('External guest-checkout failed:', res.status, errText);
        return json(
          {
            error:
              'Payment captured but order completion failed. Contact support with your PayPal order ID.',
            details: errText,
          },
          {status: 502},
        );
      }

      const data = await res.json();
      if (data?.data?.checkoutNumber) {
        return json({
          data: {
            checkoutNumber: data.data.checkoutNumber,
            paypalOrderId,
            greetingDetails: data.data.greetingDetails,
          },
        });
      }
    } catch (forwardErr) {
      console.error('Forward to external API error:', forwardErr);
      return json(
        {
          error:
            'Payment captured but order completion failed. Contact support with your PayPal order ID.',
        },
        {status: 502},
      );
    }

    return json(
      {error: 'Guest checkout failed: invalid response from order service'},
      {status: 502},
    );
  } catch (err) {
    console.error('guest-checkout error:', err);
    return json(
      {error: err.message || 'An error occurred during guest checkout'},
      {status: 500},
    );
  }
}
