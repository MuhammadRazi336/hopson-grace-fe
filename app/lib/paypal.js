/**
 * PayPal REST API helpers (worker-safe, no Node SDK).
 * Set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and optionally PAYPAL_ENV=sandbox|live.
 */

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Get OAuth2 access token from PayPal.
 * @param {{ clientId: string, clientSecret: string }} credentials
 * @returns {Promise<string>} access token
 */
export async function getPayPalAccessToken(credentials) {
  const {clientId, clientSecret} = credentials;
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials missing: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET');
  }
  const credentialsString = `${clientId}:${clientSecret}`;
  const auth =
    typeof Buffer !== 'undefined'
      ? Buffer.from(credentialsString, 'utf8').toString('base64')
      : btoa(credentialsString);
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

/**
 * Create a PayPal order (intent CAPTURE).
 * @param {string} accessToken
 * @param {{ amount: number, currencyCode?: string }} options
 * @returns {Promise<{ id: string, status: string }>}
 */
export async function createPayPalOrder(accessToken, options) {
  const {amount, currencyCode = 'CAD'} = options;
  const value = typeof amount === 'number' ? amount.toFixed(2) : String(amount);
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value,
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return {id: data.id, status: data.status};
}

/**
 * Capture a PayPal order by ID.
 * @param {string} accessToken
 * @param {string} orderId
 * @returns {Promise<{ id: string, status: string }>}
 */
export async function capturePayPalOrder(accessToken, orderId) {
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: '{}',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  return {id: captureId || data.id, status: data.status};
}
