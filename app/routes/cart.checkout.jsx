import {useState, useEffect} from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
} from '@paypal/react-paypal-js';
import {Form, useFetcher, useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {getPayPalAccessToken, createPayPalOrder} from '~/lib/paypal';
import {CoupleProfileViewHeader} from './couple.test._index';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import {Footer} from '~/components/Footer';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import ModalPortal from '~/components/ModalPortal';
import billingAddressOptions from '~/data/billing-address-options.json';
import {getApiBaseUrl} from '~/utils/api-url';
import {isRegistryGiftCardTitle} from '~/utils/helpers.js';
import SideCart from '~/components/SideCart';
import {
  buildLineItemsForTax,
  buildCoupleRegistryShippingAddress,
  buildGuestBillingAddressForTax,
  postCalculateTaxRate,
  getCalculateTaxRateErrorMessage,
  getTaxCalculationErrorForDisplay,
  parseRegistryIdForTax,
} from '~/utils/checkout-tax';

export async function loader({context, request}) {
  try {
    // Get email and registryId from URL params or try to get from session
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || '';
    const registryId = url.searchParams.get('registryId') || '';

    // Use per-registry session keys to match how message was saved
    const messageKey = registryId ? `message_${registryId}` : 'message';
    const couplesNameKey = registryId ? `couplesName_${registryId}` : 'couplesName';
    const message = context.session.get(messageKey) || '';
    const couplesName = context.session.get(couplesNameKey) || '';

    const registryApi = await context.ClientGet(
      `registries/${registryId}`,
      context,
    );

    let registryDetail = null;
    if (registryId) {
      try {
        const detailRes = await context.ClientGet(
          `registries/detail/${registryId}`,
          context,
        );
        registryDetail = detailRes?.data ?? null;
      } catch {
        /* registries/detail optional */
      }
    }

    let productData = [];
    let cashFundData = [];

    const apiBaseUrl = context.env?.API_BASE_URL || process.env.API_BASE_URL;

    // If we have email and registryId, fetch cart and product data
    if (email && registryId) {
      try {
        // Ensure apiBaseUrl is set and encode email for URL
        const baseUrl = apiBaseUrl;
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
          `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
        );
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.length > 0) {
          const cartData = data.data[0];
          const cartItems = cartData.cartItemProducts || [];

          // Extract product IDs for Shopify query (exclude cash funds)
          const productIds = cartItems
            .filter((item) => item.registryProduct.productTypeId !== 2)
            .map(
              (item) =>
                `gid://shopify/Product/${item.registryProduct.productId}`,
            );

          // Fetch product data from Shopify
          if (productIds.length > 0) {
            const products = await fetchProducts(
              context.storefront,
              productIds,
            );
            productData = products?.nodes || [];
          }

          // Fetch cash fund data from registry API
          try {
            const cashRes = await context.ClientGet(
              `registryProducts/${registryId}?type=cash`,
              context,
            );
            if (cashRes?.data && Array.isArray(cashRes.data)) {
              cashFundData = cashRes.data.map((item) => ({
                ...item,
                isCashFund: true,
                productId: item.productId,
              }));
            }
          } catch {
            /* cash fund optional */
          }
        }
      } catch {
        /* cart / product fetch optional for loader */
      }
    }

    // Only public client ID is exposed to the browser; PAYPAL_CLIENT_SECRET stays server-only
    return json({
      message,
      couplesName,
      productData,
      cashFundData,
      registryApi,
      registryDetail,
      registryId,
      email,
      apiBaseUrl:
        context.env.API_BASE_URL || process.env.API_BASE_URL,
      paypalClientId: context.env.PUBLIC_PAYPAL_CLIENT_ID || process.env.PUBLIC_PAYPAL_CLIENT_ID,
    });
  } catch {
    return json({
      message: '',
      couplesName: '',
      productData: [],
      cashFundData: [],
      registryApi: {},
      registryDetail: null,
      registryId: '',
      email: '',
      apiBaseUrl: context.env.API_BASE_URL || process.env.API_BASE_URL,
      paypalClientId: context.env.PUBLIC_PAYPAL_CLIENT_ID || process.env.PUBLIC_PAYPAL_CLIENT_ID,
    });
  }
}

// Action for step 1: Create PayPal order
export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.trim();
    if (!email) {
      return json({error: 'Email is required'}, {status: 400});
    }
    const registryId = formData.get('registryId')?.trim();

    // Read the per-registry message key that cart.message._index.jsx stores
    const messageKey = registryId ? `message_${registryId}` : 'message';
    const message = context.session.get(messageKey) || '';

    if (!registryId || isNaN(registryId) || registryId <= 0) {
      return json(
        {
          error:
            'Invalid registry ID. Please try adding the items to your cart again.',
        },
        {status: 400},
      );
    }

    // Get apiBaseUrl from context
    const apiBaseUrl = getApiBaseUrl(context?.env);

    // Fetch cart items from API to get the latest data
    let apiCartItems = [];
    let rawCartItemProducts = [];
    try {
      // Ensure apiBaseUrl is set and encode email for URL
      const baseUrl = apiBaseUrl;
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(
        `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
      );
      const data = await response.json();
      if (data.code === 200 && data.data && data.data.length > 0) {
        const cartData = data.data[0];
        rawCartItemProducts = cartData.cartItemProducts || [];
        apiCartItems = rawCartItemProducts.map((cartItem) => {
          const registryProduct = cartItem.registryProduct;
          return {
            id: cartItem.id,
            productId: registryProduct.productId,
            price: Math.round(Number(cartItem.price) * 100) / 100,
            quantity: Number(cartItem.quantity) || 1,
            title: cartItem.title || `Product ${registryProduct.productId}`,
            image: cartItem.image || '/placeholder.svg',
            isCashFund: registryProduct.productTypeId === 2,
            amount: Math.round(Number(registryProduct.amount) * 100) / 100,
            registryProductId: registryProduct.id,
          };
        });
      }
    } catch {
      /* cart unavailable for action */
    }

    if (apiCartItems.length === 0) {
      return json(
        {error: 'No items found in cart. Please add items to your cart first.'},
        {status: 400},
      );
    }

    const lineItems = apiCartItems.map((item) => {
      const amount = Math.round(Number(item.price) * 100) / 100;
      let productId = Number(item.productId);
      return {
        productId,
        amount: amount,
        quantity: Math.max(1, Number(item.quantity) || 1),
        isCashFund: item.isCashFund || false,
      };
    });

    const address = formData.get('address')?.trim() || '';
    const city = formData.get('city')?.trim() || '';
    const province = formData.get('province')?.trim() || '';
    const country = formData.get('country')?.trim() || '';
    const postalCode = formData.get('postalCode')?.trim() || '';

    let registryDetailForTax = null;
    let registryApiForTax = null;
    try {
      const detailRes = await context.ClientGet(
        `registries/detail/${registryId}`,
        context,
      );
      registryDetailForTax = detailRes?.data ?? null;
    } catch {
      /* registries/detail optional for tax address */
    }
    try {
      registryApiForTax = await context.ClientGet(
        `registries/${registryId}`,
        context,
      );
    } catch {
      /* registries/:id optional for tax address */
    }

    const shippingAddress = buildCoupleRegistryShippingAddress(
      registryDetailForTax,
      registryApiForTax,
    );
    const billingAddress = buildGuestBillingAddressForTax({
      address,
      city,
      province,
      country,
      postalCode,
      zip: postalCode,
    });

    if (!shippingAddress) {
      return json(
        {
          error:
            'Registry shipping address is missing or incomplete, so tax cannot be calculated. Please try again later or contact support.',
        },
        {status: 400},
      );
    }

    const taxLinePayload = buildLineItemsForTax(rawCartItemProducts);

    if (!taxLinePayload.length) {
      return json({error: 'Could not build line items for tax.'}, {status: 400});
    }

    let taxData;
    let payCurrency = 'CAD';
    let amount;
    const taxRegistryId = parseRegistryIdForTax(registryId);
    const taxRequestBody = {
      lineItems: taxLinePayload,
      shippingAddress,
      ...(billingAddress ? {billingAddress} : {}),
      email: email || undefined,
      shippingLine: {title: 'Standard', price: '0.00'},
      ...(taxRegistryId != null ? {registryId: taxRegistryId} : {}),
    };
    console.log('[calculate-tax-rate] action request', taxRequestBody);

    const taxRes = await postCalculateTaxRate(
      apiBaseUrl,
      taxRequestBody,
    );

    const taxJson = taxRes.json;
    taxData = taxJson?.data;
    if (
      !taxRes.ok ||
      taxJson?.code !== 200 ||
      taxData == null ||
      !Number.isFinite(Number(taxData.total))
    ) {
      console.log('[calculate-tax-rate] action response (error)', {
        httpStatus: taxRes.status,
        body: taxJson,
      });
      return json(
        {
          error: getCalculateTaxRateErrorMessage(
            taxJson,
            taxRes.status,
          ),
        },
        {status: 400},
      );
    }

    payCurrency = taxData.currency || 'CAD';
    amount = Math.round(Number(taxData.total) * 100) / 100;

    console.log('[calculate-tax-rate] action response (ok)', {
      subtotal: taxData.subtotal,
      processingFee: taxData.processingFee,
      processingFeeRate: taxData.processingFeeRate,
      totalTax: taxData.totalTax,
      total: taxData.total,
      taxRate: taxData.taxRate,
      taxPercentage: taxData.taxPercentage,
      currency: payCurrency,
    });

    // Step 1: Create PayPal order (server-side only; credentials never sent to browser)
    const clientId =
      context.env?.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
    const clientSecret =
      context.env?.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;
    const paypalEnv = context.env?.PAYPAL_ENV || process.env.PAYPAL_ENV;

    if (!clientId || !clientSecret) {
      return json(
        {
          error:
            'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET on the server.',
        },
        {status: 500},
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return json({error: 'Invalid total amount'}, {status: 400});
    }

    let order;
    try {
      const accessToken = await getPayPalAccessToken({
        clientId,
        clientSecret,
        paypalEnv,
      });
      order = await createPayPalOrder(accessToken, {
        amount,
        currencyCode: payCurrency,
        paypalEnv,
      });
    } catch (paypalErr) {
      return json(
        {
          error: paypalErr.message || 'Failed to create PayPal order',
        },
        {status: 500},
      );
    }

    if (order?.id) {
      context.session.set('paypalOrderId', order.id);
      context.session.set('lineItems', JSON.stringify(lineItems));
      context.session.set('message', message?.trim());
      context.session.set('firstName', formData.get('firstName')?.trim());
      context.session.set('lastName', formData.get('lastName')?.trim());
      context.session.set('email', email);
      context.session.set('registryId', registryId);

      return json(
        {
          paypalOrderId: order.id,
          amount,
          currency: payCurrency,
          subtotal: taxData.subtotal,
          processingFee: taxData.processingFee,
          processingFeeRate: taxData.processingFeeRate,
          totalTax: taxData.totalTax,
          taxRate: taxData.taxRate,
          taxPercentage: taxData.taxPercentage,
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': await context.session.commit(),
          },
        },
      );
    }

    return json(
      {error: 'No PayPal order ID returned'},
      {status: 500},
    );
  } catch (error) {
    return json(
      {
        error: error.message || 'An error occurred during checkout',
        details: process.env.NODE_ENV === 'development' || context.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      {status: 500},
    );
  }
}

// Step 1: Details Form using useFetcher
const DetailsForm = ({onNext}) => {
  const {
    message,
    couplesName,
    productData,
    cashFundData,
    apiBaseUrl,
    registryApi,
    registryDetail,
    registryId: loaderRegistryId,
    email: loaderEmail,
  } = useLoaderData();
  const fetcher = useFetcher();
  const [cartItems, setCartItems] = useState([]);
  const [cartItemProductsRaw, setCartItemProductsRaw] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);
  const [taxData, setTaxData] = useState(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState(null);
  const [resolvedRegistryId, setResolvedRegistryId] = useState(
    loaderRegistryId ||
      (typeof window !== 'undefined' ? localStorage.getItem('registryId') : '') ||
      '',
  );
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    country: 'Canada',
    postalCode: '',
    email: '',
    subscribe: false,
  });
  const [sideCartOpen, setSideCartOpen] = useState(false);

  useEffect(() => {
    console.log('[cart.checkout] loader productData', productData);
    console.log('[cart.checkout] loader cashFundData', cashFundData);
  }, [productData, cashFundData]);

  // Normalize country key so dropdown data is always found (handles case / alternate names)
  const countryRaw = (fields.country || 'Canada').trim();
  const countryKey = billingAddressOptions[countryRaw]
    ? countryRaw
    : Object.keys(billingAddressOptions).find(
        (k) => k.toLowerCase() === countryRaw.toLowerCase(),
      ) || 'Canada';
  const countryData = billingAddressOptions[countryKey] || null;
  const statesOrProvinces = countryData
    ? (countryData.states || countryData.provinces || [])
    : [];

  // Utility function to round currency values to 2 decimal places
  const roundCurrency = (value) => {
    return Math.round(Number(value) * 100) / 100;
  };

  // Fetch cart items from API on client side (prefer URL/loader params so this checkout stays for the correct registry)
  useEffect(() => {
    const fetchCartItems = async () => {
      const email = loaderEmail || (typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '') || '';
      const registryId =
        resolvedRegistryId ||
        loaderRegistryId ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('registryId')
          : '') ||
        '';

      if (!email || !registryId) {
        setCartItems([]);
        setCartTotal(0);
        setCartLoading(false);
        return;
      }

      try {
        // Fetch cart with registryId from localStorage
        // Ensure apiBaseUrl is set and encode email for URL
        const baseUrl = apiBaseUrl || getApiBaseUrl();
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
          `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
        );
        const apiData = await response.json();

        if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
          const cartData = apiData.data[0];
          const fallbackRegistryId =
            String(
              cartData?.registryId ||
                cartData?.coupleId ||
                cartData?.registry?.id ||
                '',
            ).trim() || '';
          if (fallbackRegistryId && fallbackRegistryId !== resolvedRegistryId) {
            setResolvedRegistryId(fallbackRegistryId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('registryId', fallbackRegistryId);
            }
          }

          // Transform the API data to match SideCart expectations
          const transformedItems = (cartData.cartItemProducts || []).map(
            (cartItem) => {
              const registryProduct = cartItem.registryProduct;

              const isCashFund = registryProduct.productTypeId === 2;

              // For regular products, find in Shopify data
              // For cash funds, find in cashFundData
              const productFromData = isCashFund
                ? cashFundData.find((p) => p.productId === registryProduct.productId)
                : productData.find(
                    (p) =>
                      p.id === `gid://shopify/Product/${registryProduct.productId}`,
                  );

              return {
                id: cartItem.id,
                price: roundCurrency(cartItem.price), // Round to 2 decimal places
                quantity: Number(cartItem.quantity) || 1,
                title:
                  cartItem.title ||
                  productFromData?.title ||
                  productFromData?.name ||
                  productFromData?.cashFund?.name ||
                  `Product ${registryProduct.productId}`,
                image:
                  cartItem.image ||
                  productFromData?.images?.edges?.[0]?.node?.url ||
                  productFromData?.image?.fileUrl ||
                  productFromData?.cashFund?.image?.fileUrl ||
                  '/assets/Images/placeholder.png',
                isCashFund: isCashFund,
                productId: registryProduct.productId,
                amount: roundCurrency(registryProduct.amount), // Round to 2 decimal places
                registryProductId: registryProduct.id, // Keep registry product ID for reference
              };
            },
          );
          console.log('[cart.checkout] details step transformed cart items', transformedItems);
          setCartItems(transformedItems);
          setCartItemProductsRaw(cartData.cartItemProducts || []);
          const total = roundCurrency(
            transformedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ),
          );
          setCartTotal(total);
        } else {
          setCartItems([]);
          setCartItemProductsRaw([]);
          setCartTotal(0);
        }
      } catch (error) {
        setCartItems([]);
        setCartItemProductsRaw([]);
        setCartTotal(0);
      }
      setCartLoading(false);
    };

    fetchCartItems();
  }, [loaderRegistryId, loaderEmail, resolvedRegistryId]);

  // Tax: shippingAddress = couple's registry (gift destination); billingAddress = guest billing when filled
  useEffect(() => {
    if (cartLoading || !cartItemProductsRaw.length) {
      return;
    }

    const baseUrl = apiBaseUrl || getApiBaseUrl();
    const shippingAddress = buildCoupleRegistryShippingAddress(
      registryDetail,
      registryApi,
    );
    if (!shippingAddress) {
      setTaxData(null);
      setTaxError(
        registryDetail
          ? 'Gift registry shipping address is missing or incomplete; tax cannot be calculated.'
          : null,
      );
      return;
    }

    const billingAddress = buildGuestBillingAddressForTax(fields);

    const lineItems = buildLineItemsForTax(cartItemProductsRaw);
    if (!lineItems.length) return;

    let cancelled = false;
    setTaxLoading(true);
    setTaxError(null);

    (async () => {
      const registryIdForTax =
        resolvedRegistryId ||
        loaderRegistryId ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('registryId') || ''
          : '');
      const taxRegistryId = parseRegistryIdForTax(registryIdForTax);
      const taxRequestBody = {
        lineItems,
        shippingAddress,
        ...(billingAddress ? {billingAddress} : {}),
        email: fields.email?.trim() || loaderEmail || undefined,
        shippingLine: {title: 'Standard', price: '0.00'},
        ...(taxRegistryId != null ? {registryId: taxRegistryId} : {}),
      };
      if (taxRegistryId == null) {
        console.warn(
          '[calculate-tax-rate] registryId missing; processingFee may be 0 for cash funds',
          {registryIdForTax},
        );
      }
      console.log('[calculate-tax-rate] client request', taxRequestBody);

      const {ok, status, json} = await postCalculateTaxRate(
        baseUrl,
        taxRequestBody,
      );
      if (cancelled) return;

      if (ok && json?.code === 200 && json?.data) {
        console.log('[calculate-tax-rate] client response (ok)', json.data);
        setTaxData(json.data);
        setTaxError(null);
      } else {
        console.log('[calculate-tax-rate] client response (error)', {
          httpStatus: status,
          body: json,
        });
        setTaxData(null);
        setTaxError(getTaxCalculationErrorForDisplay(json, status));
      }
      setTaxLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    cartLoading,
    cartItemProductsRaw,
    registryDetail,
    registryApi,
    fields.address,
    fields.city,
    fields.province,
    fields.country,
    fields.postalCode,
    fields.email,
    loaderEmail,
    resolvedRegistryId,
    loaderRegistryId,
    apiBaseUrl,
  ]);

  // Set email from URL/loader first (this checkout's registry), then localStorage
  useEffect(() => {
    const email = loaderEmail || (typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '') || '';
    if (email) {
      setFields((prev) => ({...prev, email}));
    }
  }, [loaderEmail]);

  // Handle fetcher state
  useEffect(() => {
    if (fetcher.data?.paypalOrderId && fetcher.state === 'idle') {
      if (fetcher.data.clearLocalStorage && typeof window !== 'undefined') {
        localStorage.removeItem('guestEmail');
        localStorage.removeItem('registryId');
      }
      onNext({
        paypalOrderId: fetcher.data.paypalOrderId,
        amount: fetcher.data.amount,
        currency: fetcher.data.currency || 'CAD',
      });
    }
  }, [fetcher.data, fetcher.state, onNext]);

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFields((prev) => {
      const next = {...prev, [name]: type === 'checkbox' ? checked : value};
      if (name === 'country') {
        next.province = '';
        next.city = '';
        next.postalCode = '';
      } else if (name === 'province') {
        next.city = '';
      }
      return next;
    });
  };

  const handleCartClick = () => {
    setSideCartOpen(true);
  };

  const onClose = () => {
    setSideCartOpen(false);
  };

  const cartQuantityTotal = cartItems.reduce(
    (sum, item) => sum + Math.max(1, Number(item?.quantity) || 1),
    0,
  );

  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader
        onCartClick={handleCartClick}
        cartCount={cartQuantityTotal}
      />
      <div className="p-4">
        <h2 className="text-4xl text-center font-bold prata pt-5">checkout</h2>
        <img
          src="/assets/Images/cart-head-bdr.png"
          alt="Hamburger"
          className="w-[150px] mx-auto -mt-4"
        />
      </div>
      <div className="max-w-4xl mx-auto mt-[80px]">
        <div className="flex items-center justify-around">
          <div className="w-4/12">
            <h4 className="text-[60px] text-center prata text-[#1F1D1B40]">1.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center text-[#1F1D1B40]">
              Add your messsage
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">2.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
              Billing & Payment
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata text-[#1F1D1B40]">3.</h4>
            <p className="text-lg max-w-32 mx-auto uppercase text-center text-[#1F1D1B40]">
              Order Confirmation
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-[100px]">
        <div className="bg-[#446184] py-16 px-16">
          <h2 className="md:text-[36px] font-normal text-center text-white ivyora">
            <span className="">BILLING</span>{' '} details
          </h2>
          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
          Enter your billing address connected to your credit card. We don’t require shipping information as your gift will be shipped to the couple when they’re ready.
          </p>
          <div className="flex mt-[100px]">
            <div className="w-1/2">
              <h4 className="text-xl text-white text-center">Billing</h4>
            </div>
            <div className="w-1/2">
              <h4 className="text-xl text-white text-center">Order Summary</h4>
            </div>
          </div>
          <fetcher.Form
            method="post"
            action="/cart/checkout"
            className="flex flex-col items-start gap-x-4 mt-[20px]"
          >
            <input
              type="hidden"
              name="registryId"
              value={
                resolvedRegistryId ||
                loaderRegistryId ||
                (typeof window !== 'undefined'
                  ? localStorage.getItem('registryId') || ''
                  : '')
              }
            />
            <div className="flex items-start gap-x-4 w-full">
              <div className="w-1/2">
                <div className="flex flex-col gap-y-4">
                  <div className="grid grid-cols-2 gap-x-4">
                    <input
                      placeholder="First Name *"
                      name="firstName"
                      value={fields.firstName}
                      onChange={handleChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                      required
                    />
                    <input
                      placeholder="Last Name *"
                      name="lastName"
                      value={fields.lastName}
                      onChange={handleChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                      required
                    />
                  </div>
                  <input
                    placeholder="Address *"
                    name="address"
                    value={fields.address}
                    onChange={handleChange}
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    required
                  />
                  <div className="grid grid-cols-2 gap-x-4">
                    <select
                      name="country"
                      value={fields.country}
                      onChange={handleChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                      required
                    >
                      <option value="">Country *</option>
                      {Object.entries(billingAddressOptions).map(([key, data]) => (
                        <option key={key} value={key}>
                          {data.label || key}
                        </option>
                      ))}
                    </select>
                    <select
                      name="province"
                      value={fields.province}
                      onChange={handleChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                      required
                    >
                      <option value="">
                        {countryKey === 'USA' ? 'State *' : 'Province *'}
                      </option>
                      {statesOrProvinces.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <input
                      placeholder="City *"
                      name="city"
                      value={fields.city}
                      onChange={handleChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                      required
                    />
                    <input
                      placeholder="Postal / ZIP *"
                      name="postalCode"
                      value={fields.postalCode}
                      onChange={handleChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                      required
                      autoComplete="postal-code"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <input
                      placeholder="Email *"
                      name="email"
                      value={fields.email}
                      readOnly
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-gray-100 text-black w-full cursor-not-allowed col-span-2"
                      required
                    />
                  </div>

                  <div className="flex items-center mt-4">
                  </div>
                </div>
              </div>
              <div className="w-1/2 bg-white p-6">
                <div className="max-h-[440px] overflow-y-auto bg-[#FAF9F6] px-4 py-2">
                  {cartLoading ? (
                    <div className="text-center py-8">
                      <p>Loading cart items...</p>
                    </div>
                  ) : cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center py-3 border-b border-[#ececec] last:border-b-0"
                      >
                        {isRegistryGiftCardTitle(item.title) ? (
                          <div className="w-[99px] h-[99px] shrink-0 bg-[#446184] rounded mr-8 flex items-center justify-center overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="max-w-full max-h-full w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-[99px] h-[99px] object-cover mr-8"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-bold uppercase text-md leading-tight tracking-wide">
                            {item.title}
                          </div>
                          {item.isCashFund &&
                            !isRegistryGiftCardTitle(item.title) && (
                            <div className="text-sm text-gray-600 mt-1">
                              Cash Fund Contribution
                            </div>
                          )}
                          <div className="text-sm text-gray-600 mt-1 font-medium">
                            Qty: {Math.max(1, Number(item.quantity) || 1)}
                          </div>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-xl text-black">
                            $
                            {(
                              Number(item.price) *
                              Math.max(1, Number(item.quantity) || 1)
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p>No items in cart</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-8">
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold tracking-wide text-sm uppercase">
                        Subtotal
                      </span>
                      <span className="text-lg">
                        $
                        {(taxData?.subtotal != null
                          ? Number(taxData.subtotal)
                          : cartTotal
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2 min-h-[1.5rem]">
                      <span className="font-bold tracking-wide text-sm uppercase">
                        Processing Fee
                        {taxData?.processingFeeRate != null &&
                        Number.isFinite(Number(taxData.processingFeeRate)) ? (
                          <span className="font-normal">
                            {' '}
                            ({Number(taxData.processingFeeRate)}%)
                          </span>
                        ) : null}
                      </span>
                      <span className="text-lg">
                        {taxData?.processingFee != null ? (
                          <>${Number(taxData.processingFee).toFixed(2)}</>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2 min-h-[1.5rem]">
                      <span className="font-bold tracking-wide text-sm uppercase">
                        Taxes
                        {taxData?.taxPercentage != null &&
                        Number.isFinite(Number(taxData.taxPercentage)) ? (
                          <span className="font-normal">
                            {' '}
                            ({Number(taxData.taxPercentage)}%)
                          </span>
                        ) : taxData?.taxRate != null &&
                          String(taxData.taxRate).trim() !== '' ? (
                          <span className="font-normal">
                            {' '}
                            ({String(taxData.taxRate)}%)
                          </span>
                        ) : null}
                      </span>
                      <span className="text-lg">
                        {taxLoading ? (
                          <span className="text-sm font-normal">…</span>
                        ) : taxData?.totalTax != null ? (
                          <>${Number(taxData.totalTax).toFixed(2)}</>
                        ) : taxError ? (
                          <span className="text-xs text-amber-800">—</span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </span>
                    </div>
                    {Array.isArray(taxData?.taxLines) &&
                    taxData.taxLines.length > 0 ? (
                      <ul className="text-xs text-gray-600 mb-2 pl-1 space-y-0.5 font-normal normal-case tracking-normal">
                        {taxData.taxLines.map((tl, idx) => {
                          const title =
                            tl?.title != null ? String(tl.title) : 'Tax';
                          const priceStr =
                            tl?.price != null &&
                            !Number.isNaN(Number(tl.price)) ? (
                              <>
                                ${Number(tl.price).toFixed(2)}
                                {tl?.currencyCode
                                  ? ` ${String(tl.currencyCode)}`
                                  : ''}
                              </>
                            ) : null;
                          const rateLabel =
                            tl?.rate != null &&
                            Number.isFinite(Number(tl.rate)) ? (
                              <span className="text-gray-500">
                                {' '}
                                ({(Number(tl.rate) * 100).toFixed(0)}%)
                              </span>
                            ) : null;
                          return (
                            <li
                              key={idx}
                              className="flex justify-between gap-2"
                            >
                              <span>
                                {title}
                                {rateLabel}
                              </span>
                              {priceStr ? (
                                <span className="shrink-0">{priceStr}</span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                    {taxError && (
                      <p className="text-xs text-amber-900 mb-2">{taxError}</p>
                    )}
                    <img
                      src="/assets/Images/cart-sum-bdr.png"
                      alt="Border"
                      className="w-auto mx-auto mt-4"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-2xl uppercase tracking-wide">
                        Total
                      </span>
                      <span className="font-bold text-2xl">
                        $
                        {(taxData?.total != null
                          ? Number(taxData.total)
                          : cartTotal
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end w-full mt-8">
              <div className="w-1/2 flex justify-end">
                <div className="w-full max-w-xs">
                  <button
                    type="submit"
                    className="w-full py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white hover:opacity-90 uppercase font-[800] text-black text-center"
                    disabled={
                      fetcher.state === 'submitting' ||
                      cartLoading ||
                      cartItems.length === 0
                    }
                  >
                    {fetcher.state === 'submitting' ? 'Processing...' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
            {fetcher.data?.error && (
              <div className="text-[#FD446F] mt-4">{fetcher.data.error}</div>
            )}
          </fetcher.Form>
        </div>
      </div>
      <div className="mb-16"></div>
      <section className="my-12 lg:my-[240px]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="questions? "
          description="We've got answers."
          buttontext={'PHONE, EMAIL OR LIVE CHAT'}
          buttontype={'Color'}
        />
      </section>
      {/* Side cart overlay and panel */}
      {sideCartOpen && (
        <div
          className="fixed inset-0 bg-[#2b2b2b61] bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}
      <SideCart
        open={sideCartOpen}
        onClose={onClose}
        cartItems={cartItems}
        total={taxData?.total != null ? Number(taxData.total) : cartTotal}
        subtotal={
          taxData?.subtotal != null ? Number(taxData.subtotal) : cartTotal
        }
        onCartChange={() => {}}
        onClearCart={() => {}}
        registryId={
          resolvedRegistryId ||
          loaderRegistryId ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('registryId') || ''
            : '')
        }
        guestEmail={
          loaderEmail ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('guestEmail') || ''
            : '')
        }
        hideDeleteButtons={true}
        allowQuantityEdit={false}
        showExtrasSection={true}
        showFooterActions={false}
        hideExtrasHeading={true}
      />
      <Footer />
    </div>
  );
};

// Main Checkout component
const Checkout = () => {
  const {paypalClientId} = useLoaderData();
  const [step, setStep] = useState(1);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [orderAmount, setOrderAmount] = useState(null);
  const [orderCurrency, setOrderCurrency] = useState('CAD');

  const handleNext = (data) => {
    setPaypalOrderId(data.paypalOrderId);
    setOrderAmount(data.amount);
    setOrderCurrency(data.currency || 'CAD');
    setStep(2);
  };

  if (!paypalClientId) {
    return (
      <div className="pt-[80px] text-center">
        <p className="text-red-500">PayPal is not configured.</p>
      </div>
    );
  }

  return (
    <div>
      {step === 1 && <DetailsForm onNext={handleNext} />}
      {step === 2 && (
        <PayPalPaymentForm
          paypalOrderId={paypalOrderId}
          paypalClientId={paypalClientId}
          orderCurrency={orderCurrency}
          onPrev={() => setStep(1)}
        />
      )}
    </div>
  );
};

export default Checkout;

const PayPalPaymentForm = ({
  paypalOrderId,
  paypalClientId,
  orderCurrency = 'CAD',
  onPrev,
}) => {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const {
    apiBaseUrl,
    registryId: loaderRegistryId,
    email: loaderEmail,
    productData = [],
    cashFundData = [],
  } = loaderData || {};

  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const fetcher = useFetcher();

  const [sideCartOpen, setSideCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    console.log('[cart.checkout] payment step loader productData', productData);
    console.log('[cart.checkout] payment step loader cashFundData', cashFundData);
  }, [productData, cashFundData]);

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guestEmail');
        localStorage.removeItem('registryId');
      }
      navigate('/thankyou');
    } else if (fetcher.data?.error && fetcher.state === 'idle') {
      setError(fetcher.data.error);
      const details =
        typeof fetcher.data.details === 'string'
          ? fetcher.data.details
          : fetcher.data.details
            ? JSON.stringify(fetcher.data.details)
            : null;
      setErrorDetails(details);
      setShowPopup(true);
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const handleApprove = (data) => {
    if (!data?.orderID) {
      setError('PayPal order ID not received');
      setErrorDetails(null);
      setShowPopup(true);
      return;
    }
    const formData = new FormData();
    formData.append('paypalOrderId', data.orderID);
    fetcher.submit(formData, {
      method: 'POST',
      action: '/cart/checkout/guest-checkout',
    });
  };

  // Fetch cart items for SideCart in payment step, similar to DetailsForm
  useEffect(() => {
    const fetchCartItems = async () => {
      const email =
        loaderEmail ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('guestEmail')
          : '') ||
        '';
      const registryId =
        loaderRegistryId ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('registryId')
          : '') ||
        '';

      if (!email || !registryId) {
        setCartItems([]);
        setCartTotal(0);
        return;
      }

      try {
        const baseUrl = apiBaseUrl || getApiBaseUrl();
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
          `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
        );
        const apiData = await response.json();

        if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
          const cartData = apiData.data[0];

          const transformedItems = (cartData.cartItemProducts || []).map(
            (cartItem) => {
              const registryProduct = cartItem.registryProduct || {};
              const isCashFund = registryProduct.productTypeId === 2;

              const productFromData = isCashFund
                ? cashFundData.find(
                    (p) => p.productId === registryProduct.productId,
                  )
                : productData.find(
                    (p) =>
                      p.id ===
                      `gid://shopify/Product/${registryProduct.productId}`,
                  );

              return {
                id: cartItem.id,
                price: Number(cartItem.price) || 0,
                quantity: Number(cartItem.quantity) || 1,
                title:
                  cartItem.title ||
                  productFromData?.title ||
                  productFromData?.name ||
                  productFromData?.cashFund?.name ||
                  `Product ${registryProduct.productId}`,
                image:
                  cartItem.image ||
                  productFromData?.images?.edges?.[0]?.node?.url ||
                  productFromData?.image?.fileUrl ||
                  productFromData?.cashFund?.image?.fileUrl ||
                  '/assets/Images/placeholder.png',
                isCashFund,
                productId: registryProduct.productId,
                amount: Number(registryProduct.amount) || 0,
                registryProductId: registryProduct.id,
              };
            },
          );

          console.log('[cart.checkout] payment step transformed cart items', transformedItems);

          setCartItems(transformedItems);
          const total = transformedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          setCartTotal(total);
        } else {
          setCartItems([]);
          setCartTotal(0);
        }
      } catch (e) {
        setCartItems([]);
        setCartTotal(0);
      }
    };

    fetchCartItems();
  }, [apiBaseUrl, loaderEmail, loaderRegistryId, productData, cashFundData]);

  const handleCartClick = () => {
    setSideCartOpen(true);
  };

  const onClose = () => {
    setSideCartOpen(false);
  };

  const cartQuantityTotal = cartItems.reduce(
    (sum, item) => sum + Math.max(1, Number(item?.quantity) || 1),
    0,
  );

  return (
    <div className="pt-[80px]">
      {showPopup && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000000b0] bg-opacity-50">
          <div
            className={`rounded-lg shadow-lg px-8 py-16 max-w-xl w-full text-center ${
              success ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">
              {!success ? 'Sorry for the Inconvenience' : 'Payment Successful!'}
            </h2>
            <p className="mb-6">
              {!success
                ? error || 'There was an error processing your payment.'
                : 'Thank you for your payment.'}
            </p>
            {!success && errorDetails && (
              <p className="mb-6 text-xs leading-5 text-white/90 break-words">
                {errorDetails}
              </p>
            )}
            <button
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
        </ModalPortal>
      )}
      <CoupleProfileViewHeader
        onCartClick={handleCartClick}
        cartCount={cartQuantityTotal}
      />
      <div className="p-4">
        <h2 className="text-4xl text-center font-bold prata pt-5">checkout</h2>
        <img
          src="/assets/Images/cart-head-bdr.png"
          alt="Hamburger"
          className="w-[150px] mx-auto -mt-4"
        />
      </div>
      <div className="max-w-4xl mx-auto mt-[80px]">
        <div className="flex items-center justify-around">
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata text-[#1F1D1B40]">1.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center text-[#1F1D1B40]">
              Add your messsage
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">2.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
              Billing & Payment
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata text-[#1F1D1B40]">3.</h4>
            <p className="text-lg max-w-32 mx-auto uppercase text-center text-[#1F1D1B40]">
              Order Confirmation
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-[100px]">
        <div className="bg-[#F6F3ED] py-16 px-16">
          <div className="grid grid-cols-1 gap-6">
            <label className="block text-sm text-center text-black font-medium mb-1">
              PAYMENT
            </label>
            <div className="flex justify-center min-w-[400px] [&_[id^='zoid-paypal-buttons']]:!min-w-[400px]">
              <PayPalScriptProvider
                options={{
                  clientId: paypalClientId,
                  currency: orderCurrency || 'CAD',
                  intent: 'capture',
                }}
              >
                <PayPalButtons
                  fundingSource={FUNDING.CARD}
                  createOrder={() => Promise.resolve(paypalOrderId)}
                  onApprove={(data) => handleApprove(data)}
                  onError={(err) => {
                    setError(err?.message || 'PayPal error');
                    setErrorDetails(null);
                    setShowPopup(true);
                  }}
                  style={{layout: 'vertical', color: 'black', shape: 'rect'}}
                  disabled={fetcher.state === 'submitting' || !paypalOrderId}
                />
              </PayPalScriptProvider>
            </div>
            {error && <div className="text-[#FD446F] text-center mt-4">{error}</div>}
            {success && (
              <div className="text-white bg-green-500 px-2 py-4 text-center mt-4">
                Payment successful!
              </div>
            )}
          </div>
        </div>
      </div>
      {showPopup && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#000000b0] bg-opacity-50">
            <div
              className={`rounded-lg shadow-lg px-8 py-16 max-w-xl w-full text-center ${
                success ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">
                {!success ? 'Sorry for the Inconvenience' : 'Payment Successful!'}
              </h2>
              <p className="mb-6">
                {!success
                  ? error || 'There was an error processing your payment.'
                  : 'Thank you for your payment.'}
              </p>
              {!success && errorDetails && (
                <p className="mb-6 text-xs leading-5 text-white/90 break-words">
                  {errorDetails}
                </p>
              )}
              <button
                className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Side cart overlay and panel for payment step */}
      {sideCartOpen && (
        <div
          className="fixed inset-0 bg-[#2b2b2b61] bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}
      <SideCart
        open={sideCartOpen}
        onClose={onClose}
        cartItems={cartItems}
        total={cartTotal}
        subtotal={cartTotal}
        onCartChange={() => {}}
        onClearCart={() => {}}
        registryId={
          loaderRegistryId ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('registryId') || ''
            : '')
        }
        guestEmail={
          loaderEmail ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('guestEmail') || ''
            : '')
        }
        hideDeleteButtons={true}
        allowQuantityEdit={false}
        showExtrasSection={true}
        showFooterActions={false}
        hideExtrasHeading={true}
      />
    </div>
  );
};
