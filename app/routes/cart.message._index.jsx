import {redirect} from '@remix-run/server-runtime';
import {useState, useEffect} from 'react';
import {Footer} from '~/components/Footer';
import {CoupleProfileViewHeader} from './couple.test._index';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useSearchParams,
} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import SideCart from '~/components/SideCart';
import {getApiBaseUrl} from '~/utils/api-url';

export async function loader({context, request}) {
  try {
    const url = new URL(request.url);
    const registryId = url.searchParams.get('registryId') || '';
    const email = url.searchParams.get('email') || '';

    // Get message/couplesName from session (per-registry when we have registryId)
    const messageKey = registryId ? `message_${registryId}` : 'message';
    const couplesNameKey = registryId
      ? `couplesName_${registryId}`
      : 'couplesName';
    const message = context.session.get(messageKey) || '';
    const couplesName = context.session.get(couplesNameKey) || '';

    // Enrich cart items similar to cart.checkout.jsx so we have proper titles/images
    let productData = [];
    let cashFundData = [];

    const apiBaseUrl = context.env?.API_BASE_URL || process.env.API_BASE_URL;

    if (email && registryId) {
      try {
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
          `${apiBaseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
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

          if (productIds.length > 0) {
            const {fetchProducts} = await import(
              '~/graphql/product-query/GetProductsQuery'
            );
            const products = await fetchProducts(context.storefront, productIds);
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
            // ignore cash fund errors here
          }
        }
      } catch {
        // ignore enrichment errors; cart will still work with fallbacks
      }
    }

    return json({
      message,
      couplesName,
      registryId,
      email,
      productData,
      cashFundData,
    });
  } catch (error) {
    return json({
      message: '',
      couplesName: '',
      registryId: '',
      email: '',
      productData: [],
      cashFundData: [],
    });
  }
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const message = formData.get('message');
    const couplesName = formData.get('couplesName');
    const action = formData.get('_action');

    console.log('Form data received:', { message, couplesName, action });

    // Validate required fields
    if (!message || !message.trim()) {
      return json({ 
        error: 'Please enter a message',
        fields: { message, couplesName }
      }, { 
        status: 400 
      });
    }

    const trimmedMessage = message.trim();
    const trimmedCouplesName = couplesName ? couplesName.trim() : '';
    const registryIdForSession = formData.get('registryId');

    // Save data to session (per-registry when registryId provided)
    const messageKey = registryIdForSession ? `message_${registryIdForSession}` : 'message';
    const couplesNameKey = registryIdForSession ? `couplesName_${registryIdForSession}` : 'couplesName';
    context.session.set(messageKey, trimmedMessage);
    context.session.set(couplesNameKey, trimmedCouplesName);



    // If action is preview, return success response
    if (action === 'preview') {
      return json(
        { success: true },
        {
          headers: {
            'Set-Cookie': await context.session.commit()
          }
        }
      );
    }

    // If action is checkout, redirect to checkout with email and registryId
    const email = formData.get('email');
    const registryIdForRedirect = formData.get('registryId');
    
    const checkoutUrl = email && registryIdForRedirect 
      ? `/cart/checkout?email=${email}&registryId=${registryIdForRedirect}`
      : '/cart/checkout';
      
    return redirect(checkoutUrl, {
      headers: {
        'Set-Cookie': await context.session.commit()
      }
    });

  } catch (error) {
    console.error('Error saving message:', error);
    return json({ 
      error: 'Failed to save message',
      fields: null
    }, { 
      status: 500 
    });
  }
}

const Message = () => {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const [message, setMessage] = useState(loaderData?.message || '');
  const [couplesName, setCouplesName] = useState(loaderData?.couplesName || '');
  const [showPreview, setShowPreview] = useState(false);
  const maxLength = 500;
  const [error, setError] = useState('');

  // Prefer URL params for this checkout flow (so each registry has its own)
  const registryIdFromUrl =
    searchParams.get('registryId') || loaderData?.registryId || '';
  const emailFromUrl =
    searchParams.get('email') || loaderData?.email || '';

  const [sideCartOpen, setSideCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const loaderProductData = loaderData?.productData || [];
  const loaderCashFundData = loaderData?.cashFundData || [];

  const cartTotal = cartItems.reduce((sum, item) => {
    if (!item || typeof item.price !== 'number') return sum;
    const qty = typeof item.quantity === 'number' ? item.quantity : 1;
    return sum + item.price * qty;
  }, 0);

  const cartQuantityTotal = cartItems.reduce(
    (sum, item) => sum + Math.max(1, Number(item?.quantity) || 1),
    0,
  );

  const fetchCartItems = async () => {
    const registryId = registryIdFromUrl ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('registryId') || ''
        : '');
    const email = emailFromUrl ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('guestEmail') || ''
        : '');

    if (!registryId || !email) {
      setCartItems([]);
      return;
    }

    try {
      const baseUrl = getApiBaseUrl();
      const encodedEmail = encodeURIComponent(email);
      const res = await fetch(
        `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
      );
      const apiData = await res.json();

      if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
        const cartData = apiData.data[0];
        const transformedItems = (cartData.cartItemProducts || []).map(
          (cartItem) => {
            const registryProduct = cartItem.registryProduct || {};
            const isCashFund = registryProduct.productTypeId === 2;

            const productFromData = isCashFund
              ? loaderCashFundData.find(
                  (p) => p.productId === registryProduct.productId,
                )
              : loaderProductData.find(
                  (p) =>
                    p.id ===
                    `gid://shopify/Product/${registryProduct.productId}`,
                );

            return {
              id: cartItem.id,
              price: Number(cartItem.price) || 0,
              quantity:
                Number(
                  cartItem.quantity || cartItem.purchasedQuantity || 1,
                ) || 1,
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
              requestedQuantity:
                Number(registryProduct.quantity) || 1,
            };
          },
        );
        setCartItems(transformedItems);
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [registryIdFromUrl, emailFromUrl]);

  const handleCartClick = () => {
    setSideCartOpen(true);
  };

  const onClose = () => {
    setSideCartOpen(false);
  };

  // Reset form with loader data
  useEffect(() => {
    if (loaderData) {
      setMessage(loaderData.message || '');
      setCouplesName(loaderData.couplesName || '');
    }
  }, [loaderData]);

  // Handle action data updates
  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
      setShowPreview(false);
    } else if (actionData?.success) {
      setShowPreview(true);
      setError('');
    }
    
    // Restore fields if provided
    if (actionData?.fields) {
      setMessage(actionData.fields.message || '');
      setCouplesName(actionData.fields.couplesName || '');
    }
  }, [actionData]);

  const handlePreview = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    const form = e.target.form;
    const formData = new FormData(form);
    formData.set('_action', 'preview');
    formData.set('message', message);
    formData.set('couplesName', couplesName);
    
    submit(formData, {
      method: 'post',
    });
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    // Use URL params first so this checkout stays for the correct registry
    const email = emailFromUrl || (typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '') || '';
    const registryId = registryIdFromUrl || (typeof window !== 'undefined' ? localStorage.getItem('registryId') : '') || '';
    
    const formData = new FormData();
    formData.set('_action', 'checkout');
    formData.set('message', message);
    formData.set('couplesName', couplesName);
    formData.set('email', email);
    formData.set('registryId', registryId);
    
    submit(formData, {
      method: 'post',
    });
  };

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
            <h4 className="text-[60px] font-bold text-center prata">1.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
              Add your messsage
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] text-center prata text-[#1F1D1B40]">2.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center text-[#1F1D1B40]">
              Billing & Payment
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] text-center prata text-[#1F1D1B40]">3.</h4>
            <p className="text-lg max-w-32 mx-auto uppercase text-center text-[#1F1D1B40]">
              Order Confirmation
            </p>
          </div>
        </div>
      </div>

      <div className="mx-20 py-[100px]">
        <div className="container mx-auto bg-[#446184] py-16">
          <h2 className="md:text-[36px] font-normal text-center text-white ivyora">
            enclose your <span className="font-italic">PERSONAL MESSAGE</span>{' '}
            here
          </h2>

          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            Your message and gift notification will be sent to the couple
            immediately upon completion of your order.
          </p>

          {error && (
            <div className="max-w-xl mx-auto text-center text-[#FD446F] mb-4 bg-white p-2 rounded">
              {error}
            </div>
          )}

          <Form method="post">
            <input 
              type="hidden" 
              name="email" 
              value={emailFromUrl || (typeof window !== 'undefined' ? localStorage.getItem('guestEmail') || '' : '')} 
            />
            <input 
              type="hidden" 
              name="registryId" 
              value={registryIdFromUrl || (typeof window !== 'undefined' ? localStorage.getItem('registryId') || '' : '')} 
            />
            <div className="relative max-w-4xl mx-auto">
              <img
                src="/assets/Images/checkout-bg.png"
                alt="checkout-flow"
                className="w-full object-contain"
              />
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="flex items-center justify-start h-full flex-row">
                  <div className={`w-9/12 pl-16 ${!showPreview ? 'pt-16' : 'pt-10'}`}>
                    <img
                      src="/assets/Images/checkoutHeart.png"
                      alt="checkout-bg-1"
                      className="w-auto h-auto mx-auto mb-2.5"
                    />

                    {!showPreview ? (
                      <div>
                        <input
                          type="text"
                          name="couplesName"
                          placeholder="Couple's Name*"
                          value={couplesName}
                          onChange={(e) => setCouplesName(e.target.value)}
                          className="w-full prata text-center text-2xl mx-auto mb-4 border border-gray-300 rounded p-2 bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        <div className="w-full flex justify-center">
                          <div className="w-full">
                            <textarea
                              name="message"
                              placeholder="Your Message here...*"
                              maxLength={maxLength}
                              rows={7}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full border italic border-gray-300 prata text-center text-xl outline-none p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                            <div className="text-xs text-gray-400 mt-1 text-left">
                              {maxLength - message.length}/{maxLength} characters remaining
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative max-w-4xl mx-auto">
                        <h3 className="text-center text-3xl font-bold italic prata">{couplesName}</h3>
                        <p className="text-center prata italic leading-relaxed text-xl mt-10">
                          {message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!showPreview ? (
              <button
                type="button"
                onClick={handlePreview}
                className="text-[#ffffff] border-b border-[#ffffff] uppercase cursor-pointer font-bold text-lg mx-auto mt-5 block"
              >
                SAVE AND PREVIEW
              </button>
            ) : (
              <div className="flex justify-center gap-x-4 mt-5">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-[#ffffff] uppercase border-b border-[#ffffff] cursor-pointer font-bold text-lg"
                >
                  BACK TO EDIT 
                </button>
              </div>
            )}

            <div className="relative">
              <div className="flex items-center gap-x-12 mt-8 justify-center">
                <h4 className="text-[60px] text-white text-center">{showPreview ? '2' : '1'}</h4>
                <h4 className="text-[30px] text-white text-center">/</h4>
                <h4 className="text-[30px] text-white text-center">2</h4>
              </div>
              
              {showPreview && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <button 
                    type="button"
                    onClick={handleCheckout}
                    className="py-7 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white hover:opacity-90 uppercase font-[800] text-black w-[280px] max-[1601px]:w-[280px] text-center"
                  >
                    Proceed To Checkout
                  </button>
                </div>
              )}
            </div>
          </Form>
        </div>
      </div>

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

      {/* Simple side cart overlay, same behaviour as couple.test._index */}
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
        registryId={registryIdFromUrl}
        guestEmail={emailFromUrl}
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

export default Message;
