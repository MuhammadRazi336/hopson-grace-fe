# PayPal checkout – backend API contract

The frontend expects the API at `https://dev-hopsongrace.codup.io` (or `API_BASE_URL`) to expose the following for PayPal checkout.

## In-repo implementation (Remix API routes)

This repo includes Remix resource routes that implement the PayPal flow:

- **POST /api/transactions/create-paypal-order** – `app/routes/api.transactions.create-paypal-order.js`
- **POST /api/transactions/guest-checkout** – `app/routes/api.transactions.guest-checkout.js` (captures PayPal, then forwards to external API for order persistence)

**To use the in-repo API:**

1. Set in `.env` (or deployment env):
   - `API_BASE_URL` = your app origin (e.g. `http://localhost:3000` in dev, or your production URL). This makes the frontend call the same app for `/api/...`.
   - `PAYPAL_CLIENT_ID` = PayPal client ID (server-side; can match `PUBLIC_PAYPAL_CLIENT_ID`).
   - `PAYPAL_CLIENT_SECRET` = PayPal client secret (server-side only).
   - `PAYPAL_ENV` = `sandbox` (default) or `live`.

2. **Guest checkout:** The in-repo route captures the PayPal order, then forwards the payload to **`EXTERNAL_ORDER_API_BASE_URL`** (default `https://dev-hopsongrace.codup.io`). Set `EXTERNAL_ORDER_API_BASE_URL` only if your order service lives elsewhere. That external API must accept `paypalOrderId` and perform order completion (no capture needed; we already captured). If the external API is not updated yet, you’ll get a 502 after payment capture until it accepts `paypalOrderId`.

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

- PayPal **client ID** is used only in the frontend (`.env`: `PUBLIC_PAYPAL_CLIENT_ID`).
- PayPal **client secret** must be used only on the backend; add it to the backend environment and use it with the PayPal server SDK to create and capture orders.
- For sandbox testing use PayPal sandbox credentials; for production use live credentials.
