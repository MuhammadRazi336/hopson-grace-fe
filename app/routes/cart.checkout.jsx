import {useState, useEffect} from 'react';
import {PayPalScriptProvider, PayPalButtons} from '@paypal/react-paypal-js';
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
    )
    console.log('registryApi', registryApi);

    let productData = [];
    let cashFundData = [];

    const apiBaseUrl = context.env?.API_BASE_URL || process.env.API_BASE_URL;

    // If we have email and registryId, fetch cart and product data
    if (email && registryId) {
      try {
        // Ensure apiBaseUrl is set and encode email for URL
        const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
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
          } catch (cashError) {
            console.error('Error fetching cash fund data:', cashError);
          }
        }
      } catch (error) {
        console.error('Error fetching cart or product data:', error);
      }
    }

    // Only public client ID is exposed to the browser; PAYPAL_CLIENT_SECRET stays server-only
    return json({
      message,
      couplesName,
      productData,
      cashFundData,
      registryApi,
      registryId,
      email,
      apiBaseUrl:
        'https://dev-hopsongrace.codup.io',
      paypalClientId: context.env.PUBLIC_PAYPAL_CLIENT_ID || process.env.PUBLIC_PAYPAL_CLIENT_ID || 'AYCtXi-gPXhpiK5Z6p9IEBplxxkF66C0iDhUlVIBW9iQKzjbzl5jMfgaUhKhZ9ozWKrTz9PGKBe60yGH',
    });
  } catch {
    return json({
      message: '',
      couplesName: '',
      productData: [],
      cashFundData: [],
      registryApi: {},
      registryId: '',
      email: '',
      apiBaseUrl: 'https://dev-hopsongrace.codup.io',
      paypalClientId: context.env.PUBLIC_PAYPAL_CLIENT_ID || process.env.PUBLIC_PAYPAL_CLIENT_ID || 'AYCtXi-gPXhpiK5Z6p9IEBplxxkF66C0iDhUlVIBW9iQKzjbzl5jMfgaUhKhZ9ozWKrTz9PGKBe60yGH',
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
    const apiBaseUrl =
      'https://dev-hopsongrace.codup.io';

    // Fetch cart items from API to get the latest data
    let apiCartItems = [];
    try {
      // Ensure apiBaseUrl is set and encode email for URL
      const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(
        `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
      );
      const data = await response.json();
      if (data.code === 200 && data.data && data.data.length > 0) {
        const cartData = data.data[0];
        apiCartItems = (cartData.cartItemProducts || []).map((cartItem) => {
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
    } catch (error) {
      console.error('Error fetching cart items:', error);
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

    // Debug logging for payment amounts
    console.log('Payment API - Line Items:', lineItems);
    console.log(
      'Payment API - Amounts being sent:',
      lineItems.map((item) => ({
        productId: item.productId,
        amount: item.amount,
        amountType: typeof item.amount,
      })),
    );

    // Calculate tax for payment intent
    let taxPercentage = 0;
    let totalAmountWithTax = 0;
    
    try {
      // Calculate total amount from line items
      const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
      
      // Get shipping address from form data or use defaults
      const address = formData.get('address')?.trim() || '';
      const city = formData.get('city')?.trim() || '';
      const province = formData.get('province')?.trim() || '';
      const country = formData.get('country')?.trim() || 'Canada';
      const zip = formData.get('zip')?.trim() || formData.get('postalCode')?.trim() || '';
      
      // Only calculate tax if we have address information
      if (address && city && province && country) {
        // Get tax rate from API
        const taxResponse = await fetch(`${apiBaseUrl}/api/transactions/calculate-tax-rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lineItems: lineItems.map(item => ({
              productId: item.productId,
              amount: item.amount,
              quantity: item.quantity
            })),
            shippingAddress: {
              address1: address,
              city: city,
              province: province, 
              country: country,
              zip: zip
            }
          })
        });
        
        if (taxResponse.ok) {
          const taxData = await taxResponse.json();
          if (taxData.code === 200 && taxData.data) {
            taxPercentage = taxData.data.taxPercentage || 0;
            const taxAmount = (totalAmount * taxPercentage) / 100;
            totalAmountWithTax = totalAmount + taxAmount;
          } else {
            // If tax calculation fails, use original total
            totalAmountWithTax = totalAmount;
          }
        } else {
          console.error('Tax API returned non-OK status:', taxResponse.status);
          totalAmountWithTax = totalAmount;
        }
      } else {
        // If no address info, use original total without tax
        totalAmountWithTax = totalAmount;
      }
    } catch (error) {
      console.error('Error calculating tax for payment intent:', error);
      // If tax calculation fails, use original total
      const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
      totalAmountWithTax = totalAmount;
    }

    // Step 1: Create PayPal order (server-side only; credentials never sent to browser)
    const clientId =
      context.env?.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || 'AYCtXi-gPXhpiK5Z6p9IEBplxxkF66C0iDhUlVIBW9iQKzjbzl5jMfgaUhKhZ9ozWKrTz9PGKBe60yGH';
    const clientSecret =
      context.env?.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return json(
        {
          error:
            'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET on the server.',
        },
        {status: 500},
      );
    }

    const amount = Math.round(totalAmountWithTax * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      return json({error: 'Invalid total amount'}, {status: 400});
    }

    let order;
    try {
      const accessToken = await getPayPalAccessToken({clientId, clientSecret});
      order = await createPayPalOrder(accessToken, {
        amount,
        currencyCode: 'CAD',
      });
    } catch (paypalErr) {
      console.error('Create PayPal order error:', paypalErr);
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
          currency: 'CAD',
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
    console.error('Checkout action error:', error);
    console.error('Error stack:', error.stack);
    return json(
      {
        error: error.message || 'An error occurred during checkout',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      {status: 500},
    );
  }
}

// Step 1: Details Form using useFetcher
const DetailsForm = ({onNext}) => {
  const {message, couplesName, productData, cashFundData, apiBaseUrl, registryApi, registryId: loaderRegistryId, email: loaderEmail} = useLoaderData();
  // console.log('DetailsForm: productData:', productData);
  // console.log('DetailsForm: apiBaseUrl from loader:', apiBaseUrl);
  console.log('DetailsForm: registryApi from loader:', registryApi);
  console.log('DetailsForm: cashFundData from loader:', cashFundData);
  const fetcher = useFetcher();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);
  const [taxData, setTaxData] = useState(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    country: 'Canada',
    email: '',
    subscribe: false,
  });

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
  const citiesByRegion =
    countryData?.citiesByState || countryData?.citiesByProvince || {};
  const cityOptions = fields.province ? (citiesByRegion[fields.province] || []) : [];
  const hasCityList = cityOptions.length > 0;
  const cityValue =
    hasCityList && cityOptions.includes(fields.city) ? fields.city : '';

  // Utility function to round currency values to 2 decimal places
  const roundCurrency = (value) => {
    return Math.round(Number(value) * 100) / 100;
  };

  // Function to calculate tax
  const calculateTax = async (items, shippingAddress) => {
    if (!items || items.length === 0 || !shippingAddress) {
      return;
    }

    setTaxLoading(true);
    try {
      const lineItems = items.map(item => ({
        productId: Number(item.productId),
        amount: Number(item.price),
        quantity: Number(item.quantity)
      }));

      const requestBody = {
        lineItems,
        shippingAddress: {
          address1: shippingAddress.address,
          city: shippingAddress.city,
          province: shippingAddress.province,
          country: shippingAddress.country,
          zip: shippingAddress.postalCode
        }
      };

      console.log('Tax calculation request:', requestBody);

      const response = await fetch(`${apiBaseUrl}/api/transactions/calculate-tax-rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Tax calculation response:', data);

      if (data.code === 200 && data.data) {
        // Calculate tax on the total checkout amount (including cash funds)
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = data.data.taxPercentage || 0;
        const calculatedTax = (totalAmount * taxRate) / 100;
        const totalWithTax = totalAmount + calculatedTax;
        
        setTaxData({
          ...data.data,
          totalTax: calculatedTax,
          total: totalWithTax,
          taxRate: taxRate.toFixed(2)
        });
      } else {
        console.error('Tax calculation failed:', data.message);
        setTaxData(null);
      }
    } catch (error) {
      console.error('Error calculating tax:', error);
      setTaxData(null);
    } finally {
      setTaxLoading(false);
    }
  };

  // Fetch cart items from API on client side (prefer URL/loader params so this checkout stays for the correct registry)
  useEffect(() => {
    const fetchCartItems = async () => {
      const email = loaderEmail || (typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '') || '';
      const registryId = loaderRegistryId || (typeof window !== 'undefined' ? localStorage.getItem('registryId') : '') || '';
      console.log('DetailsForm: userEmail (loader then localStorage):', email);
      console.log('DetailsForm: registryId (loader then localStorage):', registryId);

      if (!email || !registryId) {
        setCartItems([]);
        setCartTotal(0);
        setCartLoading(false);
        console.log('DetailsForm: Missing email or registryId');
        return;
      }

      try {
        // Fetch cart with registryId from localStorage
        // Ensure apiBaseUrl is set and encode email for URL
        const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
          `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
        );
        const apiData = await response.json();
        console.log('DetailsForm: API response:', apiData);
        console.log('DetailsForm: API response code:', apiData.code);
        console.log(
          'DetailsForm: API response data length:',
          apiData.data?.length,
        );

        if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
          const cartData = apiData.data[0];
          console.log('DetailsForm: Cart API Response:', cartData);
          console.log('DetailsForm: Cart Items:', cartData.cartItemProducts);
          console.log(
            'DetailsForm: Cart Items length:',
            cartData.cartItemProducts?.length,
          );

          // Transform the API data to match SideCart expectations
          const transformedItems = (cartData.cartItemProducts || []).map(
            (cartItem) => {
              const registryProduct = cartItem.registryProduct;
              console.log(
                'DetailsForm: Cart Item (full):',
                JSON.stringify(cartItem, null, 2),
              );
              console.log(
                'DetailsForm: Registry Product (full):',
                JSON.stringify(registryProduct, null, 2),
              );

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
          setCartItems(transformedItems);
          const total = roundCurrency(
            transformedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ),
          );
          setCartTotal(total);

          // Calculate tax if we have shipping address from registryApi
          if (registryApi?.data?.user?.shippingAddress) {
            await calculateTax(transformedItems, registryApi.data.user.shippingAddress);
          }
        } else {
          setCartItems([]);
          setCartTotal(0);
        }
      } catch (error) {
        setCartItems([]);
        setCartTotal(0);
      }
      setCartLoading(false);
    };

    fetchCartItems();
  }, [loaderRegistryId, loaderEmail]);

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
        console.log(
          'DetailsForm: Cleared guestEmail and registryId from localStorage after successful checkout',
        );
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
      } else if (name === 'province') {
        next.city = '';
      }
      return next;
    });
  };

  // Keep city in sync when province/country change makes current city invalid (fixes dropdown sometimes not working)
  useEffect(() => {
    if (!hasCityList || !fields.city) return;
    const options = fields.province ? (citiesByRegion[fields.province] || []) : [];
    if (options.length > 0 && !options.includes(fields.city)) {
      setFields((prev) => ({...prev, city: ''}));
    }
  }, [hasCityList, fields.city, fields.province, countryKey]);

  // Log cartItems.length and cartLoading in render
  console.log('DetailsForm: cartItems.length in render:', cartItems.length);
  console.log('DetailsForm: cartLoading in render:', cartLoading);
  console.log('DetailsForm: cartItems in render:', cartItems);
  console.log('DetailsForm: cartTotal in render:', cartTotal);

  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
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
            <h4 className="text-[60px] font-bold text-center prata">1.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
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
            <h4 className="text-[60px] font-bold text-center prata">3.</h4>
            <p className="text-lg max-w-32 mx-auto uppercase text-center">
              Order Confirmation
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-[100px]">
        <div className="bg-[#446184] py-16 px-16">
          <h2 className="md:text-[36px] font-normal text-center text-white ivyora">
            enclose your <span className="font-italic">PERSONAL MESSAGE</span>{' '}
            here
          </h2>
          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            Your message and gift notification will be sent to the couple
            immediately upon completion of your order.
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
              value={loaderRegistryId || (typeof window !== 'undefined' ? localStorage.getItem('registryId') || '' : '')}
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
                    {hasCityList ? (
                      <select
                        name="city"
                        value={cityValue}
                        onChange={handleChange}
                        className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                        required
                      >
                        <option value="">City *</option>
                        {cityOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        placeholder="City *"
                        name="city"
                        value={fields.city}
                        onChange={handleChange}
                        className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                        required
                      />
                    )}
                    <input
                      placeholder="Email *"
                      name="email"
                      value={fields.email}
                      readOnly
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-gray-100 text-black w-full cursor-not-allowed"
                      required
                    />
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      id="subscribe"
                      name="subscribe"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={fields.subscribe}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="subscribe"
                      className="ml-2 text-sm text-white"
                    >
                      Subscribe to Email and receive a HG Coupon Code!
                    </label>
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
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-[99px] h-[99px] object-cover mr-8"
                        />
                        <div className="flex-1">
                          <div className="font-bold uppercase text-md leading-tight tracking-wide">
                            {item.title}
                          </div>
                          {item.isCashFund && (
                            <div className="text-sm text-gray-600 mt-1">
                              Cash Fund Contribution
                            </div>
                          )}
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-xl text-black">
                            ${Number(item.price).toFixed(2)}
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
                      <span className="text-lg">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold tracking-wide text-sm uppercase">
                        Shipping
                      </span>
                      <span className="text-lg">FREE</span>
                    </div>
                    {taxData && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold tracking-wide text-sm uppercase">
                          Tax ({taxData.taxRate}%)
                        </span>
                        <span className="text-lg">
                          ${taxData.totalTax ? taxData.totalTax.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    )}
                    {taxLoading && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold tracking-wide text-sm uppercase">
                          Tax
                        </span>
                        <span className="text-lg">Calculating...</span>
                      </div>
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
                        ${taxData ? taxData.total.toFixed(2) : cartTotal.toFixed(2)}
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
          onPrev={() => setStep(1)}
        />
      )}
    </div>
  );
};

export default Checkout;

const PayPalPaymentForm = ({paypalOrderId, paypalClientId, onPrev}) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guestEmail');
        localStorage.removeItem('registryId');
        console.log(
          'PayPalPaymentForm: Cleared guestEmail and registryId from localStorage after successful checkout',
        );
      }
      navigate('/thankyou');
    } else if (fetcher.data?.error && fetcher.state === 'idle') {
      setError(fetcher.data.error);
      setShowPopup(true);
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const handleApprove = (data) => {
    if (!data?.orderID) {
      setError('PayPal order ID not received');
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

  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
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
            <h4 className="text-[60px] font-bold text-center prata">1.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
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
            <h4 className="text-[60px] font-bold text-center prata">3.</h4>
            <p className="text-lg max-w-32 mx-auto uppercase text-center">
              Order Confirmation
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-[100px]">
        <div className="bg-[#446184] py-16 px-16">
          <div className="grid grid-cols-1 gap-6">
            <label className="block text-sm text-center text-white font-medium mb-1">
              PAYMENT
            </label>
            <div className="flex justify-center min-w-[400px] [&_[id^='zoid-paypal-buttons']]:!min-w-[400px]">
              <PayPalScriptProvider
                options={{
                  clientId: paypalClientId,
                  currency: 'CAD',
                  intent: 'capture',
                }}
              >
                <PayPalButtons
                  createOrder={() => Promise.resolve(paypalOrderId)}
                  onApprove={(data) => handleApprove(data)}
                  onError={(err) => {
                    setError(err?.message || 'PayPal error');
                    setShowPopup(true);
                  }}
                  style={{layout: 'vertical', color: 'gold', shape: 'rect'}}
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
    </div>
  );
};
