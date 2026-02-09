# PayPal checkout – backend API contract

PayPal REST calls run **only in Hydrogen server actions/loaders**. The client secret and API credentials are never sent to the browser. The frontend uses the PayPal JS SDK button and submits forms to your backend (route actions).

## In-repo implementation (Hydrogen route actions)

The checkout flow uses **Remix/Hydrogen route actions** (server-only):

- **POST /cart/checkout** (action) – `app/routes/cart.checkout.jsx` — creates the PayPal order on the server, returns only `paypalOrderId` to the client.
- **POST /cart/checkout/guest-checkout** (action) – `app/routes/cart.checkout.guest-checkout.jsx` — captures the PayPal order on the server, then forwards to `EXTERNAL_ORDER_API_BASE_URL` for order persistence.

Optional resource routes (for external or programmatic use):

- **POST /api/transactions/create-paypal-order** – `app/routes/api.transactions.create-paypal-order.js`
- **POST /api/transactions/guest-checkout** – `app/routes/api.transactions.guest-checkout.js`

**Environment (server-only for secrets):** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (never expose to browser), `PUBLIC_PAYPAL_CLIENT_ID` (for PayPal JS button), `PAYPAL_ENV` = `sandbox` or `live`, `EXTERNAL_ORDER_API_BASE_URL` (default `https://dev-hopsongrace.codup.io`).


---

## 1. Create PayPal order

**Endpoint:** `POST /api/transactions/create-paypal-order`

**Request body (JSON):**

```json
{
  "registryId": 123,
  "email": "guest@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "taxPercentage": 13,
  "totalAmountWithTax": 150.25
}
```

**Backend should:**

1. Create an order with the PayPal server SDK (e.g. `orders.ordersCreate()` with amount in the same format as your current Stripe flow).
2. Return the PayPal order ID so the frontend can use it in the PayPal JS SDK.

**Response (200):**

```json
{
  "data": {
    "paypalOrderId": "ORDER-ID-FROM-PAYPAL",
    "amount": 150.25,
    "currency": "CAD"
  }
}
```

- `paypalOrderId` – required; ID returned by PayPal when creating the order.
- `amount` – optional; total amount (for display).
- `currency` – optional; default `"CAD"`.

**Errors:** Return appropriate HTTP status (4xx/5xx) and a JSON body with an `error` or `message` field if something fails.

---

## 2. Guest checkout (capture and complete order)

**Endpoint:** `POST /api/transactions/guest-checkout`

**Request body (JSON):**

Same as before, but use **`paypalOrderId`** instead of `paymentIntentId`:

```json
{
  "registryId": 123,
  "email": "guest@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "lineItems": [ ... ],
  "message": "Congratulations!",
  "paypalOrderId": "ORDER-ID-FROM-PAYPAL"
}
```

**Backend should:**

1. Capture the PayPal order using the PayPal server SDK (e.g. `orders.ordersCapture()` with `paypalOrderId`).
2. On successful capture, run your existing order-completion logic (create transaction, update registry, send notifications, etc.).
3. Return the same success shape as before (e.g. `checkoutNumber`, `greetingDetails`).

**Response (200):**

```json
{
  "data": {
    "checkoutNumber": "...",
    "paypalOrderId": "ORDER-ID-FROM-PAYPAL",
    "greetingDetails": { ... }
  }
}
```

---

## Notes

- **Client ID (public):** `PUBLIC_PAYPAL_CLIENT_ID` is the only PayPal value sent to the browser (for the PayPal JS button). It is set in the checkout **loader** and used by `PayPalScriptProvider`.
- **Client secret:** `PAYPAL_CLIENT_SECRET` is used only inside server actions/loaders and API resource routes; it is never included in loader data or any response to the client.
- For sandbox testing use PayPal sandbox credentials; for production use live credentials.
