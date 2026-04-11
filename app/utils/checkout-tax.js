/**
 * Guest checkout tax: `POST {API_BASE_URL}/api/transactions/calculate-tax-rate`
 * (maps to backend `POST /transactions/calculate-tax-rate` + `BaseController.OKResponse`).
 *
 * Request (CalculateTaxRateDto):
 * - **Required:** `lineItems` (≥1), `shippingAddress` { address1, city, province, country, zip }.
 * - **Optional:** `billingAddress` (same shape), `email`, `customerId` (string),
 *   `shippingLine` { title, price }, `registryId` (positive int). Omit unused fields.
 * - **lineItems[]:** `productId`, `amount`, `quantity` required; `variantId` optional
 *   (numeric string or `gid://shopify/ProductVariant/...`). When every line sends
 *   `variantId`, backend can use draftOrderCalculate / per-line non-taxable behavior;
 *   if any line omits it, legacy path applies.
 *
 * Success: `{ message, code: 200, data }` — `data` has subtotal, totalTax, total,
 * taxRate (string), taxPercentage, currency, taxLines[], lineItems[] (request lines
 * plus `taxAmount`). `taxLines` may be `[]` (e.g. all cash with registryId). Response
 * `lineItems[].variantId` is only present if it was sent on the request.
 *
 * Failure: e.g. HTTP 403 with Nest `{ statusCode, message }` (no envelope).
 */

/**
 * @param {unknown} registryId
 * @returns {number | undefined} Positive integer registry id, or undefined to omit from body.
 */
export function parseRegistryIdForTax(registryId) {
  const n = Number(registryId);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.trunc(n);
}

/** @param {unknown} raw */
export function formatVariantIdForTaxApi(raw) {
  if (raw == null || raw === '') return null;
  const v = String(raw).trim();
  if (!v) return null;
  if (v.includes('gid://')) return v;
  const digits = v.replace(/\D/g, '');
  return digits || null;
}

/** Full state name → 2-letter (US billing dropdown uses full names). */
const US_STATE_TO_CODE = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  'district of columbia': 'DC',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
};

const CA_PROVINCE_TO_CODE = {
  alberta: 'AB',
  'british columbia': 'BC',
  manitoba: 'MB',
  'new brunswick': 'NB',
  'newfoundland and labrador': 'NL',
  'northwest territories': 'NT',
  'nova scotia': 'NS',
  nunavut: 'NU',
  ontario: 'ON',
  'prince edward island': 'PE',
  quebec: 'QC',
  saskatchewan: 'SK',
  yukon: 'YT',
};

/** @param {string} value */
export function countryToCode(value) {
  if (!value || typeof value !== 'string') return 'CA';
  const v = value.trim();
  if (v.length === 2) return v.toUpperCase();
  const lower = v.toLowerCase();
  if (lower === 'canada' || lower === 'ca') return 'CA';
  if (
    lower === 'united states' ||
    lower === 'usa' ||
    lower === 'us' ||
    lower === 'america'
  ) {
    return 'US';
  }
  return v.slice(0, 2).toUpperCase();
}

/**
 * @param {string} countryCode CA | US | ...
 * @param {string} province raw province/state from form or API
 */
export function provinceToCode(countryCode, province) {
  if (!province || typeof province !== 'string') return '';
  const p = province.trim();
  if (p.length === 2) return p.toUpperCase();
  const lower = p.toLowerCase();
  const cc = (countryCode || 'CA').toUpperCase();
  if (cc === 'CA') {
    return CA_PROVINCE_TO_CODE[lower] || p.slice(0, 2).toUpperCase();
  }
  if (cc === 'US') {
    return US_STATE_TO_CODE[lower] || p.slice(0, 2).toUpperCase();
  }
  return p.slice(0, 2).toUpperCase();
}

/**
 * Maps cart API rows to CalculateTaxRateDto lineItems.
 * Include variantId on every line when possible so tax uses draftOrderCalculate.
 *
 * @param {Array<Record<string, unknown>>} cartItemProducts
 */
export function buildLineItemsForTax(cartItemProducts) {
  if (!Array.isArray(cartItemProducts)) return [];
  return cartItemProducts.map((cartItem) => {
    const registryProduct = cartItem.registryProduct || {};
    const amount = Math.round(Number(cartItem.price) * 100) / 100;
    const quantity = Math.max(1, Number(cartItem.quantity) || 1);
    const line = {
      productId: Number(registryProduct.productId),
      amount,
      quantity,
    };
    const rawVariant =
      registryProduct.variantId ??
      registryProduct.shopifyVariantId ??
      registryProduct.variant_id;
    const variantId = formatVariantIdForTaxApi(rawVariant);
    if (variantId) line.variantId = variantId;
    return line;
  });
}

/**
 * Human-readable error from calculate-tax-rate (envelope or Nest exception body).
 * @param {Record<string, unknown>} json
 * @param {number} [httpStatus]
 */
export function getCalculateTaxRateErrorMessage(json, httpStatus) {
  const fallback =
    httpStatus === 403
      ? 'Failed to calculate tax rate'
      : 'Could not calculate tax.';
  if (!json || typeof json !== 'object') return fallback;
  const m = json.message;
  if (Array.isArray(m)) {
    const s = m.map(String).filter(Boolean).join('; ');
    return s || fallback;
  }
  if (typeof m === 'string' && m.trim()) return m.trim();
  return fallback;
}

/** Nest generic 403 copy — omit from checkout UI when tax is not applicable (e.g. cash funds). */
export function isGenericCalculateTaxRateFailureMessage(message) {
  if (typeof message !== 'string') return false;
  return message.trim().toLowerCase() === 'failed to calculate tax rate';
}

/**
 * Copy for the Taxes row error line, or `null` to show nothing.
 * @param {Record<string, unknown>} json
 * @param {number} [httpStatus]
 * @returns {string | null}
 */
export function getTaxCalculationErrorForDisplay(json, httpStatus) {
  const msg = getCalculateTaxRateErrorMessage(json, httpStatus);
  if (isGenericCalculateTaxRateFailureMessage(msg)) return null;
  return msg;
}

/**
 * Cart rows from get-cart: all cash fund (productTypeId === 2). Tax API is skipped for these.
 * @param {Array<Record<string, unknown>>} cartItemProducts
 */
export function isAllCashFundCartItems(cartItemProducts) {
  if (!Array.isArray(cartItemProducts) || cartItemProducts.length === 0) {
    return false;
  }
  return cartItemProducts.every(
    (row) => Number(row?.registryProduct?.productTypeId) === 2,
  );
}

/**
 * Normalize a shipping-like object to the tax API shape.
 * @param {Record<string, unknown> | null | undefined} s
 */
function normalizeAddressRecord(s) {
  if (!s || typeof s !== 'object') return null;
  const address1 = s.address || s.address1 || s.street || s.line1 || '';
  const city = s.city || '';
  const zip = String(s.postalCode || s.zip || s.postal || '')
    .trim()
    .replace(/\s+/g, '');
  const prov = s.province || s.state || '';
  const countryRaw = s.country || 'CA';
  if (!String(address1).trim() || !String(city).trim() || !zip || !String(prov).trim()) {
    return null;
  }
  const country = countryToCode(String(countryRaw));
  const province = provinceToCode(country, String(prov));
  return {
    address1: String(address1).trim(),
    city: String(city).trim(),
    province,
    country,
    zip,
  };
}

/**
 * Shipping destination for tax = couple's registry address (where gifts ship),
 * not the guest's billing address.
 *
 * @param {Record<string, unknown> | null} registryDetail from `registries/detail/:registryId`
 * @param {Record<string, unknown> | null} registryApi optional from `registries/:registryId`
 * @returns {null | { address1: string; city: string; province: string; country: string; zip: string }}
 */
export function buildCoupleRegistryShippingAddress(registryDetail, registryApi) {
  const candidates = [];

  if (registryDetail?.user?.shippingAddress) {
    candidates.push(registryDetail.user.shippingAddress);
  }
  if (registryDetail?.shippingAddress) {
    candidates.push(registryDetail.shippingAddress);
  }
  if (registryDetail?.user?.shipping && typeof registryDetail.user.shipping === 'object') {
    candidates.push(registryDetail.user.shipping);
  }

  const ev = Array.isArray(registryDetail?.events)
    ? registryDetail.events[0]
    : registryDetail?.event;
  if (ev && typeof ev === 'object') {
    candidates.push({
      address: ev.address || ev.location || ev.street || ev.line1,
      city: ev.city,
      province: ev.province || ev.state,
      postalCode: ev.postalCode || ev.zip || ev.postal,
      country: ev.country,
    });
  }

  const rawReg = registryApi?.data;
  const reg = Array.isArray(rawReg) ? rawReg[0] : rawReg;
  if (reg && typeof reg === 'object') {
    if (reg.user?.shippingAddress) candidates.push(reg.user.shippingAddress);
    if (reg.shippingAddress) candidates.push(reg.shippingAddress);
  }

  for (const c of candidates) {
    const n = normalizeAddressRecord(c);
    if (n) return n;
  }
  return null;
}

/**
 * Guest billing address (card / bill-to) for calculate-tax `billingAddress`.
 * @param {Record<string, string>} fields
 */
export function buildGuestBillingAddressForTax(fields) {
  const address1 = (fields.address || '').trim();
  const city = (fields.city || '').trim();
  const zip = (fields.postalCode || fields.zip || '').trim().replace(/\s+/g, '');
  const prov = (fields.province || '').trim();
  const countryRaw = (fields.country || '').trim();
  if (!address1 || !city || !zip || !prov || !countryRaw) return null;
  const country = countryToCode(countryRaw);
  const province = provinceToCode(country, prov);
  return {
    address1,
    city,
    province,
    country,
    zip,
  };
}

/**
 * @param {string} baseUrl API base (no trailing slash)
 * @param {object} body calculate-tax request body (CalculateTaxRateDto)
 */
export async function postCalculateTaxRate(baseUrl, body) {
  const root = String(baseUrl || '').replace(/\/$/, '');
  const res = await fetch(`${root}/api/transactions/calculate-tax-rate`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return {ok: res.ok, status: res.status, json};
}
