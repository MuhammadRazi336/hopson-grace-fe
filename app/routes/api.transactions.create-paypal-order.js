import {json} from '@shopify/remix-oxygen';
import {getPayPalAccessToken, createPayPalOrder} from '~/lib/paypal';

/**
 * POST /api/transactions/create-paypal-order
 * Body: { registryId, email, firstName, lastName, taxPercentage, totalAmountWithTax }
 * Returns: { data: { paypalOrderId, amount, currency } }
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const body = await request.json();
    const {
      registryId,
      email,
      firstName,
      lastName,
      taxPercentage,
      totalAmountWithTax,
    } = body;

    const amount = Number(totalAmountWithTax);
    if (!Number.isFinite(amount) || amount <= 0) {
      return json(
        {error: 'Invalid totalAmountWithTax'},
        {status: 400},
      );
    }

    const clientId =
      context.env?.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
    const clientSecret =
      context.env?.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;
    const paypalEnv = context.env?.PAYPAL_ENV || process.env.PAYPAL_ENV;

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
      paypalEnv,
    });
    const order = await createPayPalOrder(accessToken, {
      amount,
      currencyCode: 'CAD',
      paypalEnv,
    });

    return json({
      data: {
        paypalOrderId: order.id,
        amount,
        currency: 'CAD',
      },
    });
  } catch (err) {
    console.error('create-paypal-order error:', err);
    return json(
      {
        error: err.message || 'Failed to create PayPal order',
      },
      {status: 500},
    );
  }
}
