import {defer, json, Link, useFetcher, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import CoupleProductCard from '~/components/CoupleProductCard';
import {useState, useRef, useEffect} from 'react';
import {CoupleProfileViewHeader} from './couple.test._index';
import SideCart from '~/components/SideCart';
import Input from '~/components/Input';
import Heading from '~/components/Heading';
import headingBottomCurve from '../assets/Images/heading-bottom-curve.png';
import {Footer} from '~/components/Footer';
import AlertPortal from '~/components/AlertPortal';
import ModalPortal from '~/components/ModalPortal';

const COLLECTION_QUERY = `#graphql
query {
  collections(first: 20) {
    nodes {
      id
      title
      description
      metafield(namespace: "parent", key: "collection") {
        key
        value
        namespace
        type
      }
    }
  }
}`;

export async function loader({params, context}) {
  try {
    const sessionUser = context?.session?.get?.('@User');
    const isLoggedIn = Boolean(
      sessionUser?.accessToken || sessionUser?.token || sessionUser?.user?.id,
    );
    const coupleId = params.id;
    console.log('Loader: Starting with coupleId:', coupleId);

    // Safety check: Ensure coupleId exists
    if (!coupleId) {
      console.log('Loader: No couple ID provided');
      throw new Response('Couple ID is required', {status: 400});
    }

    const response = await context.ClientGet(
      `registries/by-userId/${coupleId}`,
      context,
    );
    console.log('Loader: Registry response:', response);

    // Check if registry exists
    if (!response.data || response.data.length === 0) {
      console.log('Loader: No registry data found');
      throw new Response('Registry not found', {status: 404});
    }

    const registryId = response.data[0]?.id;
    if (!registryId) {
      console.log('Loader: Invalid registry ID');
      throw new Response('Invalid registry', {status: 400});
    }
    console.log('Loader: Registry ID:', registryId);

    // Safety check: Ensure context has required methods
    if (!context.ClientGet || typeof context.ClientGet !== 'function') {
      console.log('Loader: ClientGet method not available');
      throw new Response('Service unavailable', {status: 503});
    }

    const [res, cashRes, shopifyCollections] = await Promise.all([
      context
        .ClientGet(`registryProducts/${registryId}?type=gift`, context)
        .catch((error) => {
          console.warn(
            'Loader: Gift products query failed, using empty array:',
            error,
          );
          return {data: []};
        }),
      context
        .ClientGet(`registryProducts/${registryId}?type=cash`, context)
        .catch((error) => {
          console.warn(
            'Loader: Cash fund query failed, using empty array:',
            error,
          );
          return {data: []};
        }),
      context.storefront?.query?.(COLLECTION_QUERY).catch((error) => {
        console.warn(
          'Loader: Collections query failed, using empty array:',
          error,
        );
        return {collections: {nodes: []}};
      }),
    ]);

    console.log('Loader: Gift products response:', res);
    console.log('Loader: Cash fund response:', cashRes);

    // Get API base URL from environment with fallback
    const apiBaseUrl = context.env?.API_BASE_URL || 'https://dev-hopsongrace.codup.io';

    // Handle case where there are no gift products
    let mergedArray = [];
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      console.log('Loader: Processing gift products, count:', res.data.length);
      const ids = res.data
        .map((product) => `gid://shopify/Product/${product.productId}`)
        .filter(Boolean); // Filter out any undefined/null IDs

      if (ids.length > 0) {
        try {
          console.log('Loader: Fetching Shopify products for IDs:', ids);
          const products = await fetchProducts(context.storefront, ids);
          console.log('Loader: Shopify products response:', products);

          mergedArray = res.data.map((item1) => {
            const product = products?.nodes?.find(
              (item2) =>
                item2?.id === `gid://shopify/Product/${item1.productId}`,
            );
            let status = item1.isPurchased
              ? 'purchased'
              : item1.productTypeId === 2
              ? 'cashFund'
              : 'addToCart';
            return {
              status,
              isCashFund:
                item1.productTypeId === 2 ? true : item1.isCashFund ?? false,
              availableForSale: product?.availableForSale ?? true,
              ...item1,
              ...(product || {}),
            };
          });
        } catch (shopifyError) {
          console.warn(
            'Loader: Shopify API failed, using fallback data:',
            shopifyError,
          );
          // Fallback: use the registry data without Shopify enrichment
          mergedArray = res.data.map((item1) => ({
            status: item1.isPurchased ? 'purchased' : 'addToCart',
            isCashFund:
              item1.productTypeId === 2 ? true : item1.isCashFund ?? false,
            availableForSale: true,
            ...item1,
          }));
        }
        console.log('Loader: Merged gift products:', mergedArray);
      }
    } else {
      console.log('Loader: No gift products found');
    }

    // Handle case where there are no cash fund products
    const cashFundProducts =
      Array.isArray(cashRes?.data) && cashRes.data.length > 0
        ? cashRes.data.map((item) => ({
            ...item,
            status: 'cashFund',
            isCashFund: true,
            availableForSale: true,
          }))
        : [];
    console.log('Loader: Cash fund products:', cashFundProducts);

    // Combine all products
    const allProducts = [...mergedArray, ...cashFundProducts];
    console.log('Loader: All products combined:', allProducts);
    console.log('Loader: Total product count:', allProducts.length);

    // Safety check: Ensure we have valid data structure
    const safeResponse = response || {};
    const safeCollections = shopifyCollections?.collections?.nodes || [];
    const hasProducts = allProducts.length > 0;

    return defer({
      data: allProducts,
      cashfundData: cashFundProducts,
      response: safeResponse,
      registryId,
      collections: safeCollections,
      apiBaseUrl,
      hasProducts,
      coupleId, // Add coupleId for reference
      isLoggedIn,
    });
  } catch (error) {
    console.error('Loader: Error occurred:', error);
    // If it's already a Response object, re-throw it
    if (error instanceof Response) {
      throw error;
    }
    // Otherwise, throw a generic error
    throw new Response(`Internal server error: ${error.message}`, {
      status: 500,
    });
  }
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const clearCart = formData.get('clearCart');
    const itemId = formData.get('itemId');
    const productData = formData.get('productData');

    // Ensure we have access to session
    if (!context.session) {
      return json(
        {
          success: false,
          error: 'Session not available',
        },
        {status: 500},
      );
    }

    // Safety check: Ensure context has required methods
    if (!context.ClientGet || typeof context.ClientGet !== 'function') {
      return json(
        {
          success: false,
          error: 'Service unavailable',
        },
        {status: 503},
      );
    }

    // Cart operations are now handled by database
    const cartItems = [];

    // Handle cart operations
    if (clearCart === 'true') {
      return json({success: true, action: 'clear'});
    }

    if (itemId && !productData) {
      return json({success: true, action: 'remove', itemId});
    }

    if (!productData) {
      return json({success: false, error: 'Product data is required'});
    }

    let product;
    try {
      product = JSON.parse(productData);
    } catch (parseError) {
      return json({success: false, error: 'Invalid product data format'});
    }

    // Safety check: Ensure product has required properties
    if (!product || (!product.id && !product.productId)) {
      return json({success: false, error: 'Invalid product data'});
    }

    const amount = parseFloat(formData.get('amount') || product.amount || 0);
    const productTypeId = product.productTypeId || 1;

    // Extract numeric ID from Shopify GID
    const getNumericId = (gid) => {
      if (!gid) return null;
      const matches = gid.match(/\/Product\/(\d+)/);
      return matches ? parseInt(matches[1]) : null;
    };

    let addItemId;
    if (productTypeId === 2) {
      addItemId =
        product.cashFund?.id ||
        product.productId ||
        product.cashFundId ||
        product.id;
      if (!addItemId || isNaN(Number(addItemId))) {
        return json({
          success: false,
          error: 'Cash fund contribution missing ID',
        });
      }
      addItemId = Number(addItemId);
    } else {
      addItemId = getNumericId(product.id);
    }

    if (!addItemId) {
      return json({success: false, error: 'Invalid product ID'});
    }

    // Check for duplicates before adding to cart
    const isDuplicate = cartItems.some((item) => {
      const duplicateCheck =
        productTypeId === 2
          ? item.originalId === product.id
          : item.id === addItemId;
      return duplicateCheck;
    });

    if (isDuplicate) {
      return json(
        {
          success: false,
          error: 'This item is already in your cart',
        },
        {status: 400},
      );
    }

    // Create cart item
    const cartItem = {
      id: addItemId,
      title: product.title || product.cashFund?.name || 'Product',
      price: productTypeId === 2 ? amount : Number(product.amount || 0),
      image:
        product.images?.edges?.[0]?.node?.url ||
        product.cashFund?.image?.fileUrl ||
        '/assets/Images/placeholder.png',
      productTypeId: productTypeId,
      registryId: Number(product.registryId || 0),
      quantity: 1,
      originalId: product.id,
      isCashFund: productTypeId === 2 ? true : false,
      isGroupPayment: product.isGroupPayment || false,
    };

    return json({
      success: true,
      action: 'add',
      item: cartItem,
      message: `${cartItem.title} added to cart`,
    });
  } catch (error) {
    console.error('Action error:', error);
    return json(
      {
        success: false,
        error: error.message || 'Failed to add item to cart',
      },
      {status: 500},
    );
  }
}

async function hashCartId(cartId) {
  const encoder = new TextEncoder();
  const data = encoder.encode(cartId);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

export default function CoupleProfile() {
  const loaderData = useLoaderData();
  console.log('Component: Loader data received:', loaderData);

  // If no loader data, show loading or error state
  if (!loaderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">
            Loading...
          </h1>
          <p className="text-gray-600">
            Please wait while we load the registry information.
          </p>
        </div>
      </div>
    );
  }

  // Ensure we have valid data with fallbacks
  const {
    data = [],
    cashfundData = [],
    response = {},
    registryId = null,
    collections = [],
    apiBaseUrl = 'https://dev-hopsongrace.codup.io',
    hasProducts = false,
    coupleId = null,
    isLoggedIn = false,
  } = loaderData || {};

  // Safety check: If we don't have a registry ID, show an error
  if (!registryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#FD446F] mb-4">
            Registry Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            We couldn't find the registry you're looking for.
          </p>
          <p className="text-sm text-gray-500">
            Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  const fetcher = useFetcher();

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  const safeCashfundData = Array.isArray(cashfundData) ? cashfundData : [];
  const safeCollections = Array.isArray(collections) ? collections : [];
  const safeResponse = response || {};

  const eventCity = safeResponse?.data?.[0]?.events?.[0]?.city || '';
  const eventProvince = safeResponse?.data?.[0]?.events?.[0]?.province || '';

  // Filters for "our registry selections" (aligned with dashboard.registry._index)
  const [priceSort, setPriceSort] = useState('low-to-high'); // 'low-to-high' | 'high-to-low'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'gifted' | 'ungifted'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'gifts' | 'cashfunds'
  const [openFilter, setOpenFilter] = useState(null); // null | 'category' | 'price' | 'status'
  const filterRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [sideCartOpen, setSideCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Add missing popup state variables
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedGiftData, setSelectedGiftData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalQuantity, setModalQuantity] = useState(1); // Add quantity state for modal

  // Move guestEmail state to the top, before useEffect hooks
  const [guestEmail, setGuestEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('guestEmail') || '';
    }
    return '';
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingCartAction, setPendingCartAction] = useState(null); // { type: 'add'|'contribute', productId, amount }
  const [isApiLoading, setIsApiLoading] = useState(false);
  const emailInputRef = useRef();

  // Add a ref to track cart items for immediate access
  const cartItemsRef = useRef([]);

  // Add a state variable to force re-renders
  const [forceRender, setForceRender] = useState(0);
  // Function to fetch cart items from API
  const fetchCartItems = async () => {
    // Don't try to fetch cart items if there are no products or no registry ID
    if (!hasProducts || !registryId) {
      setCartItems([]);
      cartItemsRef.current = [];
      return;
    }

    const email =
      typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email || !registryId) {
      return;
    }

    setCartLoading(true);
    try {
      // Ensure apiBaseUrl is set and encode email for URL
      const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
      const encodedEmail = encodeURIComponent(email);
      const res = await fetch(
        `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
      );
      const apiData = await res.json();

      if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
        // Extract registryProducts from the first cart
        const cartData = apiData.data[0];

        // Transform the API data to match SideCart expectations
        const transformedItems = (cartData.cartItemProducts || []).map(
          (cartItem) => {
            const registryProduct = cartItem.registryProduct;

            // Try to find the product in our loaded data to get title and image
            const productFromData = safeData.find(
              (p) =>
                (p.productId && p.productId === registryProduct.productId) ||
                (p.id && p.id === registryProduct.productId),
            );

            return {
              id: cartItem.id,
              price: Number(cartItem.price) || 0, // Use the price from cartItem with fallback
              quantity: Number(
                cartItem.quantity || cartItem.purchasedQuantity || 1,
              ), // Use cartItem.quantity for purchased quantity
              title:
                cartItem.title ||
                productFromData?.title ||
                productFromData?.cashFund?.name ||
                `Product ${registryProduct.productId}`,
              image:
                cartItem.image ||
                productFromData?.images?.edges?.[0]?.node?.url ||
                productFromData?.cashFund?.image?.fileUrl ||
                '/assets/Images/placeholder.png',
              isCashFund: registryProduct.productTypeId === 2,
              productId: registryProduct.productId,
              amount: Number(registryProduct.amount) || 0, // Keep original amount for reference
              registryProductId: registryProduct.id, // Keep registry product ID for reference
              requestedQuantity: Number(registryProduct.quantity) || 1, // Keep the original requested quantity for reference
              isGroupPayment: registryProduct.isGroupPayment || false,
            };
          },
        );
        setCartItems(transformedItems);
        // Also update the ref for immediate access
        cartItemsRef.current = transformedItems;
      } else {
        setCartItems([]);
        cartItemsRef.current = [];
      }
    } catch (error) {
      setCartItems([]);
      cartItemsRef.current = [];
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch cart items on component mount and when email changes
  useEffect(() => {
      if (guestEmail && registryId && hasProducts) {
      fetchCartItems();
    } else {
      setCartItems([]);
      cartItemsRef.current = [];
    }
  }, [guestEmail, registryId, hasProducts]);

  // Fetch cart items whenever sidecart is opened, but only if we don't already have items
  useEffect(() => {
    if (sideCartOpen && cartItems.length === 0 && hasProducts && registryId) {
      fetchCartItems();
    }
  }, [sideCartOpen, cartItems.length, hasProducts, registryId]);

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data) {
      if (!fetcher.data.success) {
        setAlertMessage(fetcher.data.error);
        setAlertType('error');
      } else {
        setAlertMessage(fetcher.data.message || 'Cart updated successfully');
        setAlertType('success');
        // Refresh cart items after successful cart operation
        fetchCartItems();
      }
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  }, [fetcher.data]);

  const onClose = () => setSideCartOpen(false);

  // Handle cart click from header - ensure we have email and cart items
  const handleCartClick = () => {
    // Don't allow cart to open if there are no products
    if (!hasProducts || !registryId) {
      setAlertMessage('No products available in this registry');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const email =
      typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email) {
      setAlertMessage('Please enter your email first');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // If we don't have cart items loaded, fetch them first
    if (cartItems.length === 0) {
      fetchCartItems().then(() => {
        setSideCartOpen(true);
      });
    } else {
      setSideCartOpen(true);
    }
  };

  // Add popup functions
  const handleTitleClick = (product) => {
    // Don't allow popup to open if there are no products
    if (!hasProducts || !registryId) {
      setAlertMessage('No products available in this registry');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setSelectedGiftData(product);
    setSelectedImageIndex(0); // Reset selected image for the new item
    setIsPopupOpen(true);
  };

  // Validate selectedImageIndex when product data changes
  useEffect(() => {
    if (selectedGiftData && selectedGiftData.images?.edges) {
      const maxIndex = selectedGiftData.images.edges.length - 1;
      if (selectedImageIndex > maxIndex) {
        setSelectedImageIndex(0);
      }
    }
  }, [selectedGiftData, selectedImageIndex]);

  // Handle body scroll lock when popup is open
  useEffect(() => {
    const appClipElement = document.getElementById('app-clip');
    const appScaleElement = document.getElementById('app-scale');
    
    if (isPopupOpen && appClipElement) {
      // Disable vertical scroll when popup is open
      appClipElement.style.overflowY = 'hidden';
      appScaleElement.style.position = 'fixed';
      appScaleElement.style.top = '0';
    } else if (appClipElement) {
      // Restore vertical scroll when popup is closed
      appClipElement.style.overflowY = 'auto';
      appScaleElement.style.position = 'static';
      appScaleElement.style.top = '0';
    }

    // Cleanup on unmount
    return () => {
      const appClipElement = document.getElementById('app-clip');
      if (appClipElement) {
        appClipElement.style.overflowY = 'auto';
        appScaleElement.style.position = 'static';
        appScaleElement.style.top = '0';
      }
    };
  }, [isPopupOpen]);

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedGiftData(null);
    setModalQuantity(1); // Reset quantity when closing modal
  };

  // Calculate still needs for modal
  const getModalStillNeeds = () => {
    if (!selectedGiftData) return 0;
    if (selectedGiftData.status === 'purchased') return 0;
    return Math.max(
      0,
      (selectedGiftData.quantity || 0) -
        (selectedGiftData.purchasedQuantity || 0),
    );
  };

  // Handle quantity changes in modal
  const incrementModalQuantity = () => {
    const stillNeeds = getModalStillNeeds();
    if (modalQuantity < stillNeeds) {
      setModalQuantity(modalQuantity + 1);
    }
  };

  const decrementModalQuantity = () => {
    if (modalQuantity > 1) {
      setModalQuantity(modalQuantity - 1);
    }
  };

  // Fetch cart items when email changes
  useEffect(() => {
    if (guestEmail && registryId && hasProducts) {
      fetchCartItems();
    } else {
      setCartItems([]);
      cartItemsRef.current = [];
    }
  }, [guestEmail, registryId, hasProducts]);

  // Helper to call /api/cart
  const callCartApi = async (email) => {
    if (!hasProducts || !registryId) {
      return {success: false, error: 'No products available'};
    }

    setIsApiLoading(true);
    try {
      // Ensure apiBaseUrl is set
      const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
      const res = await fetch(`${baseUrl}/api/cart`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userEmail: email,
          registryId: Number(registryId),
        }),
      });
      const data = await res.json();
      setIsApiLoading(false);
      if (data.code === 200) {
        return {success: true, data};
      } else {
        return {
          success: false,
          error: data.message || 'Failed to initialize cart',
        };
      }
    } catch (e) {
      setIsApiLoading(false);
      return {success: false, error: e.message};
    }
  };

  // Helper to call /api/cart/add-to-cart/{registryId}/{userEmail}
  const callAddToCartApi = async (
    email,
    registryProductId,
    price,
    productData,
  ) => {
    if (!hasProducts || !registryId) {
      return {success: false, error: 'No products available'};
    }

    setIsApiLoading(true);
    try {
      const payload = {
        registryProductId: Number(registryProductId),
        price: Number(price),
        title: productData.title || productData.cashFund?.name || 'Product',
        image:
          productData.images?.edges?.[0]?.node?.url ||
          productData.cashFund?.image?.fileUrl ||
          '',
        description:
          productData.description || productData.cashFund?.note || '',
      };

      // Ensure apiBaseUrl is set and encode email for URL
      const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
      const encodedEmail = encodeURIComponent(email);
      const res = await fetch(
        `${baseUrl}/api/cart/add-to-cart/${registryId}/${encodedEmail}`,
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      setIsApiLoading(false);
      if (data.code === 200) {
        return {success: true, data};
      } else {
        return {success: false, error: data.message || 'Failed to add to cart'};
      }
    } catch (e) {
      setIsApiLoading(false);
      return {success: false, error: e.message};
    }
  };

  // Helper to call /api/cart/add-to-cart/{registryId}/{userEmail} with quantity
  const callAddToCartApiWithQuantity = async (email, payload) => {
    if (!hasProducts || !registryId) {
      return {success: false, error: 'No products available'};
    }

    setIsApiLoading(true);
    try {

      // Ensure apiBaseUrl is set and encode email for URL
      const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
      const encodedEmail = encodeURIComponent(email);
      const res = await fetch(
        `${baseUrl}/api/cart/add-to-cart/${registryId}/${encodedEmail}`,
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      setIsApiLoading(false);
      if (data.code === 200) {
        return {success: true, data};
      } else {
        return {success: false, error: data.message || 'Failed to add to cart'};
      }
    } catch (e) {
      setIsApiLoading(false);
      return {success: false, error: e.message};
    }
  };

  // Modified Add to Cart
  const handleAddToCart = async (productId, quantity = 1) => {
    // Don't allow adding to cart if there are no products
    if (!hasProducts || !registryId) {
      setAlertMessage('No products available in this registry');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const email =
      typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email) {
      setPendingCartAction({type: 'add', productId, quantity});
      setShowEmailModal(true);
      return;
    }

    // Ensure a cart exists for this email + registry before adding items.
    // This is important when the same guestEmail is used for a different couple/registry.
    const initResult = await callCartApi(email);
    if (!initResult.success) {
      setAlertMessage(initResult.error || 'Failed to initialize cart');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const product = safeData.find((item) => item.id === productId);
    if (!product) return;

    // Check if product is already in cart - prevent duplication
    const isAlreadyInCart = cartItems.some(
      (item) => item.productId === (product.productId || product.id),
    );
    if (isAlreadyInCart) {
      setAlertMessage('This item is already in your cart');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // Store registryId in localStorage when first item is added to cart
    if (typeof window !== 'undefined' && product.registryId) {
      localStorage.setItem('registryId', product.registryId);
      console.log(
        'CoupleProfile: Stored registryId in localStorage:',
        product.registryId,
      );
    }

    // Use the correct product ID for registryProductId
    const registryProductId = product.productId || product.id;
    const price = product.amount || 0;

    // Add quantity to the payload
    const payload = {
      registryProductId: Number(registryProductId),
      price: Number(price),
      title: product.title || product.cashFund?.name || 'Product',
      image:
        product.images?.edges?.[0]?.node?.url ||
        product.cashFund?.image?.fileUrl ||
        '',
      description: product.description || product.cashFund?.note || '',
      quantity: Number(quantity),
    };

    const result = await callAddToCartApiWithQuantity(email, payload);
    if (result.success) {
      // Refresh cart items after successful addition
      fetchCartItems();
      setAlertMessage(
        `${product.title || 'Item'} (${quantity}) added to cart successfully`,
      );
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } else {
      setAlertMessage('Failed to add item to cart');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Modified Contribute
  const handleContribute = async (productId, amount) => {
    // Don't allow contributing if there are no products
    if (!hasProducts || !registryId) {
      setAlertMessage('No products available in this registry');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const email =
      typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email) {
      setPendingCartAction({type: 'contribute', productId, amount});
      setShowEmailModal(true);
      return;
    }

    // Ensure a cart exists for this email + registry before contributing.
    const initResult = await callCartApi(email);
    if (!initResult.success) {
      setAlertMessage(initResult.error || 'Failed to initialize cart');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const product = safeData.find((item) => item.id === productId);
    if (!product) return;

    // Check if product is already in cart - prevent duplication
    const isAlreadyInCart = cartItems.some(
      (item) => item.productId === (product.productId || product.id),
    );
    if (isAlreadyInCart) {
      setAlertMessage('This item is already in your cart');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // Store registryId in localStorage when first item is added to cart
    if (typeof window !== 'undefined' && product.registryId) {
      localStorage.setItem('registryId', product.registryId);
      console.log(
        'CoupleProfile: Stored registryId in localStorage:',
        product.registryId,
      );
    }
    // Use the correct product ID for registryProductId
    const registryProductId = product.productId || product.id;
    const result = await callAddToCartApi(email, registryProductId, amount, product);
    if (result.success) {
      // Refresh cart items after successful contribution
      fetchCartItems();
      setAlertMessage(
        `$${amount} contributed to ${product.title || 'fund'} successfully`,
      );
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } else {
      setAlertMessage('Failed to contribute to fund');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Modal submit handler - handles email submission and adds pending products to cart
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const email = guestEmail.trim();
    if (!email) return;

    // Email validation - check if it's a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage('Please enter a valid email address');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestEmail', email);
      console.log('handleEmailSubmit: Stored email in localStorage:', email);
    }
    // First call the initial cart API
    await callCartApi(email);
    setShowEmailModal(false);

    // Update guest email state first to trigger useEffect
    setGuestEmail(email);

    // Fetch cart items directly with the email before opening sidecart
    // This ensures we have the cart data before the sidecart opens
      const emailForCart = email; // Use the email we just set
    if (emailForCart && registryId) {
      setCartLoading(true);
      try {
        // Ensure apiBaseUrl is set and encode email for URL
        const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
        const encodedEmail = encodeURIComponent(emailForCart);
        const res = await fetch(
          `${baseUrl}/api/cart/get-cart/${registryId}/${encodedEmail}`,
        );
        const apiData = await res.json();

        if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
          // Extract registryProducts from the first cart
          const cartData = apiData.data[0];

          // Transform the API data to match SideCart expectations
          const transformedItems = (cartData.cartItemProducts || []).map(
            (cartItem) => {
              const registryProduct = cartItem.registryProduct;

              // Try to find the product in our loaded data to get title and image
              const productFromData = safeData.find(
                (p) =>
                  (p.productId && p.productId === registryProduct.productId) ||
                  (p.id && p.id === registryProduct.productId),
              );

              return {
                id: cartItem.id,
                price: Number(cartItem.price), // Use the price from cartItem
                quantity: Number(
                  cartItem.quantity || cartItem.purchasedQuantity || 1,
                ), // Use cartItem.quantity for purchased quantity
                title:
                  cartItem.title ||
                  productFromData?.title ||
                  productFromData?.cashFund?.name ||
                  `Product ${registryProduct.productId}`,
                image:
                  cartItem.image ||
                  productFromData?.images?.edges?.[0]?.node?.url ||
                  productFromData?.cashFund?.image?.fileUrl ||
                  '/placeholder.svg',
                isCashFund: registryProduct.productTypeId === 2,
                productId: registryProduct.productId,
                amount: Number(registryProduct.amount), // Keep original amount for reference
                registryProductId: registryProduct.id, // Keep registry product ID for reference
                requestedQuantity: Number(registryProduct.quantity) || 1, // Keep the original requested quantity for reference
              };
            },
          );

          // Set cart items and wait for state update to complete
          // Use a Promise to ensure the state update is complete
          await new Promise((resolve) => {
            setCartItems(transformedItems);
            // Also update the ref immediately
            cartItemsRef.current = transformedItems;

            // Use a longer delay to ensure React processes the state update
            setTimeout(() => {
              resolve();
            }, 300);
          });

          // Store the items locally to ensure they're available when opening sidecart
          const localCartItems = transformedItems;

          // Force a re-render to ensure the component updates
          setForceRender((prev) => prev + 1);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        setCartItems([]);
      } finally {
        setCartLoading(false);
      }
    }

    // Handle pending cart action first (add product to cart)
    // This ensures the product is added to cart when email is submitted
    if (pendingCartAction) {
      if (pendingCartAction.type === 'add') {
        const product = safeData.find(
          (item) => item.id === pendingCartAction.productId,
        );
        if (product) {
          // Store registryId in localStorage when first item is added to cart
          if (typeof window !== 'undefined' && product.registryId) {
            localStorage.setItem('registryId', product.registryId);
          }

          const registryProductId = product.productId || product.id;
          const price = product.amount || 0;
          const quantity = pendingCartAction.quantity || 1;

          // Add quantity to the payload
          const payload = {
            registryProductId: Number(registryProductId),
            price: Number(price),
            title: product.title || product.cashFund?.name || 'Product',
            image:
              product.images?.edges?.[0]?.node?.url ||
              product.cashFund?.image?.fileUrl ||
              '',
            description: product.description || product.cashFund?.note || '',
            quantity: Number(quantity),
          };

          const result = await callAddToCartApiWithQuantity(email, payload);

          if (result.success) {
            // Show success alert
            setAlertMessage(
              `${
                product.title || 'Item'
              } (${quantity}) added to cart successfully`,
            );
            setAlertType('success');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          } else {
            // Show error alert
            setAlertMessage('Failed to add item to cart');
            setAlertType('error');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          }
        }
      } else if (pendingCartAction.type === 'contribute') {
        const product = safeData.find(
          (item) => item.id === pendingCartAction.productId,
        );
        if (product) {
          // Store registryId in localStorage when first item is added to cart
          if (typeof window !== 'undefined' && product.registryId) {
            localStorage.setItem('registryId', product.registryId);
            }

          const registryProductId = product.productId || product.id;
          const result = await callAddToCartApi(
            email,
            registryProductId,
            pendingCartAction.amount,
            product,
          );

          if (result.success) {
            // Show success alert
            setAlertMessage(
              `$${pendingCartAction.amount} contributed to ${
                product.title || 'fund'
              } successfully`,
            );
            setAlertType('success');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          } else {
            // Show error alert
            setAlertMessage('Failed to contribute to fund');
            setAlertType('error');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          }
        }
      }

      // Clear the pending action
      setPendingCartAction(null);
    }

    // Now open the sidecart - cart items should already be loaded
    setSideCartOpen(true);
  };

  // Re-add handleRemoveFromCart for SideCart
  const handleRemoveFromCart = (itemId, updatedItem = null) => {
    if (!hasProducts || !registryId) {
      return;
    }

    const email =
      typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email || !registryId || !itemId) return;

    // Find the cart item to get the registryProductId
    const cartItem = cartItems.find((item) => item.id === itemId);
    if (!cartItem) return;

    // Use registryProductId from the cart item
    const registryProductId = cartItem.registryProductId;
    if (!registryProductId) {
      setAlertMessage('Invalid cart item');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // If updatedItem is provided, this is a quantity update
    if (updatedItem && updatedItem.quantity !== cartItem.quantity) {
      // Update quantity in cart
      // Ensure apiBaseUrl is set and encode email for URL
      const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
      const encodedEmail = encodeURIComponent(email);
      fetch(
        `${baseUrl}/api/cart/update-quantity/${registryProductId}/${registryId}/${encodedEmail}`,
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({quantity: updatedItem.quantity}),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 200) {
            // Refresh cart items after successful update
            fetchCartItems();
            setAlertMessage('Quantity updated successfully');
            setAlertType('success');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          } else {
            setAlertMessage('Failed to update quantity');
            setAlertType('error');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          }
        })
        .catch((error) => {
          setAlertMessage('Error updating quantity');
          setAlertType('error');
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        });
    } else {
      // Remove item from cart
      // Ensure apiBaseUrl is set and encode email for URL
      const baseUrl = apiBaseUrl || 'https://dev-hopsongrace.codup.io';
      const encodedEmail = encodeURIComponent(email);
      fetch(
        `${baseUrl}/api/cart/remove-from-cart/${registryProductId}/${registryId}/${encodedEmail}`,
        {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
        },
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 200) {
            // Refresh cart items after successful removal
            fetchCartItems();
            setAlertMessage('Item removed from cart successfully');
            setAlertType('success');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          } else {
            setAlertMessage('Failed to remove item from cart');
            setAlertType('error');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          }
        })
        .catch((error) => {
          setAlertMessage('Error removing item from cart');
          setAlertType('error');
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        });
    }
  };

  // Re-add handleClearCart for SideCart
  const handleClearCart = () => {
    if (!hasProducts || !registryId) {
      return;
    }

    // TODO: Implement clear cart API call
    // For now, just refresh the cart
    fetchCartItems();
  };

  // Helpers to determine gifted status and amounts (similar to dashboard.registry._index)
  const isProductGifted = (product) => {
    if (typeof product.isPurchased === 'boolean') {
      return product.isPurchased;
    }
    const quantity = Number(product.quantity) || 1;
    const purchasedQuantity = Number(product.purchasedQuantity) || 0;
    const stillNeeds = Math.max(0, quantity - purchasedQuantity);
    return stillNeeds === 0;
  };

  const isFundGifted = (fund) => {
    const totalAmount = Number(fund.amount) || 0;
    const collectedAmount = Number(fund.collectedAmount) || 0;
    const remainingAmount = Math.max(0, totalAmount - collectedAmount);
    const isAnyAmount = fund.cashFund?.isAnyAmount || false;

    if (typeof fund.isPurchased === 'boolean') {
      return fund.isPurchased;
    }

    return !isAnyAmount && remainingAmount === 0;
  };

  const getProductAmount = (product) => {
    const priceObj = product.variants?.edges?.[0]?.node?.priceV2;
    if (priceObj && priceObj.amount) {
      return Number(priceObj.amount) || 0;
    }
    return Number(product.amount) || 0;
  };

  const getFundAmount = (fund) => Number(fund.amount) || 0;

  // Filter products for "our registry selections"
  const filteredData =
    safeData && safeData.length > 0 && hasProducts && registryId
      ? safeData
          .filter((product) => {
            if (!product || !product.id) return false;

            // Category filter: gifts vs cash funds
            if (categoryFilter === 'gifts' && product.isCashFund) {
              return false;
            }
            if (categoryFilter === 'cashfunds' && !product.isCashFund) {
              return false;
            }

            // Status filter: gifted vs ungifted
            if (statusFilter === 'gifted') {
              return product.isCashFund
                ? isFundGifted(product)
                : isProductGifted(product);
            }
            if (statusFilter === 'ungifted') {
              return !(product.isCashFund
                ? isFundGifted(product)
                : isProductGifted(product));
            }

            return true;
          })
          .sort((a, b) => {
            if (priceSort === 'low-to-high') {
              const aAmount = a.isCashFund
                ? getFundAmount(a)
                : getProductAmount(a);
              const bAmount = b.isCashFund
                ? getFundAmount(b)
                : getProductAmount(b);
              return aAmount - bAmount;
            }
            if (priceSort === 'high-to-low') {
              const aAmount = a.isCashFund
                ? getFundAmount(a)
                : getProductAmount(a);
              const bAmount = b.isCashFund
                ? getFundAmount(b)
                : getProductAmount(b);
              return bAmount - aAmount;
            }
            return 0;
          })
      : [];

  // Calculate cart totals from API data
  const cartTotal = cartItems.reduce((sum, item) => {
    // Safety check: Ensure item has valid price and quantity
    if (
      !item ||
      typeof item.price !== 'number' ||
      typeof item.quantity !== 'number'
    ) {
      return sum;
    }
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  // Get recommended products (unpurchased products from the same couple, excluding cash funds)
  const recommendedProducts =
    safeData && safeData.length > 0 && hasProducts && registryId
      ? safeData
          .filter((product) => {
            // Safety check: Ensure product exists and has required properties
            if (!product || !product.id) {
              return false;
            }

            return (
              !product.isCashFund &&
              product.status !== 'purchased' &&
              !cartItems.some(
                (cartItem) => cartItem.productId === product.productId,
              )
            );
          })
          .slice(0, 4)
          .map((product) => ({
            id: product.id,
            title: product.title || 'Unnamed Product',
            price: product.amount || 0,
            image:
              product.images?.edges?.[0]?.node?.url ||
              '/assets/Images/placeholder.png',
            productId: product.productId || product.id,
          }))
      : [];

  // Get recommended cash funds (unpurchased cash funds from the same couple)
  const recommendedCashFunds =
    safeCashfundData && safeCashfundData.length > 0 && hasProducts && registryId
      ? safeCashfundData
          .filter((cashFund) => {
            // Safety check: Ensure cash fund exists and has required properties
            if (!cashFund || !cashFund.id) {
              return false;
            }

            return (
              cashFund.status !== 'purchased' &&
              !cartItems.some(
                (cartItem) => cartItem.productId === cashFund.productId,
              )
            );
          })
          .slice(0, 4)
          .map((cashFund) => ({
            id: cashFund.id,
            title: cashFund.cashFund?.name || 'Unnamed Cash Fund',
            price: cashFund.amount || 0,
            image:
              cashFund.cashFund?.image?.fileUrl ||
              '/assets/Images/placeholder.png',
            productId: cashFund.productId || cashFund.id,
            isCashFund: true, // Add this property to identify cash funds
          }))
      : [];

  // Handle adding recommended product to cart
  const handleAddRecommendedProduct = (product) => {
    handleAddToCart(product.id);
  };

  // Category label for filters
  const categoryLabel =
    categoryFilter === 'all'
      ? 'All'
      : categoryFilter === 'gifts'
      ? 'Gifts'
      : categoryFilter === 'cashfunds'
      ? 'Cash Funds'
      : 'All';

  // Close open filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterTriggerClass =
    'text-[18px] uppercase flex gap-[10px] items-center lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.938vw] xl:leading-[1.938vw] 2xl:leading-[1.938vw] cursor-pointer border-0 bg-transparent p-0 font-inherit';

  const Arrow = ({isOpen}) => (
    <svg
      width="13"
      height="11"
      viewBox="0 0 13 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${
        isOpen ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M7.06524 10.5C6.68034 11.1667 5.71809 11.1667 5.33319 10.5L0.13704 1.5C-0.24786 0.833333 0.233266 0 1.00307 0L11.3954 0C12.1652 0 12.6463 0.833333 12.2614 1.5L7.06524 10.5Z"
        fill="black"
      />
    </svg>
  );
  return (
    <>
      {showAlert && (
        <AlertPortal>
          <div
            className={`fixed top-4 right-4 ${
              alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}
          >
            <div className="flex items-center">
              {alertType === 'success' ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
              <span>{alertMessage}</span>
            </div>
          </div>
        </AlertPortal>
      )}
      <CoupleProfileViewHeader
        onCartClick={handleCartClick}
        showCart={hasProducts && registryId}
      />
      <div className="text-center pt-[80px] lg:max-w-[93.385vw] mx-auto font-sans">
        <img
          src={
            safeResponse?.data?.[0]?.events?.[0]?.backgroundImage?.fileUrl ||
            '/assets/Images/couple-profile-bg.png'
          }
          alt="Couple"
          className="w-full h-[400px] lg:h-[620px] object-cover"
        />
        <div className="flex flex-wrap xl:flex-nowrap justify-center items-start -mb-10 xl:-translate-y-[200px]">
          <div className="lg:w-[calc(100% - 36.979vw)] w-full mt-[250px]">
            <h1 className="md:text-[75px] my-2 max-w-[340px] leading-[1.25] font-[400] lowercase prata ml-[3.646vw] lg:text-[4.479vw] lg:leading-[4.792vw] text-center mx-auto">
              {safeResponse?.data?.[0]?.user?.firstName || 'Couple'} &{' '}
              {safeResponse?.data?.[0]?.user?.fianceFirstName || 'Partner'}
            </h1>
          </div>
          <div className="lg:w-[36.979vw] lg:min-w-[36.979vw] lg:min-h-[36.979vw] lg:h-[36.979vw] w-full">
            {safeResponse?.data?.[0]?.events?.[0]?.image?.fileUrl ? (
              <img
                src={safeResponse.data[0].events[0].image.fileUrl}
                alt="Couple's Image"
                className="rounded-full xl:w-full xl:h-full h-[300px] w-[100px] mx-auto"
              />
            ) : (
              <div className='placeholders mt-[70px] flex flex-col items-center justify-center absolute inset-0 z-[20] pointer-events-none rounded-full bg-[#F5F2ED] h-[400px] w-[400px] mx-auto object-cover'>
                        <img 
                          src="/assets/Images/copyrightLogo.png" 
                          alt='placeholder' 
                          className='w-[8vw] h-[7.5vw] brightness-0 object-contain' 
                          onError={(e) => console.error('Failed to load copyrightLogo.png', e)}
                          onLoad={() => console.log('copyrightLogo.png loaded successfully')}
                        />
                        <img 
                          src="/assets/Images/placeholder-line.png" 
                          alt='placeholder' 
                          className='object-contain w-[16.042vw] h-[4px] mt-2' 
                          onError={(e) => console.error('Failed to load placeholder-line.png', e)}
                          onLoad={() => console.log('placeholder-line.png loaded successfully')}
                        />
                      </div>
            )}
          </div>
          <div className="lg:w-[calc(100% - 36.979vw)] w-full mt-[250px]">
            <div className="mr-16">
              <p className="md:text-[42px] text-right my-2 leading-[1.25] prata ml-auto lg:text-[2.5vw] lg:leading-[2.917vw]">
                {safeResponse?.data?.[0]?.events?.[0]?.eventDate || 'Date TBD'}
              </p>
              <img
                src="/assets/Images/profile-view-page-bdr.png"
                alt="Couple"
                className="max-w-[300px] lg:max-w-[19.219vw] h-auto ml-auto"
              />
              <div className="text-right ">
                <p className="text-lg my-1 uppercase font-[500] lg:text-[1.146vw] lg:leading-[1.563vw]">
                  {safeResponse?.data?.[0]?.events?.[0]?.location || ''}
                </p>
                <p className="text-lg my-1 uppercase font-[500] lg:text-[1.146vw] lg:leading-[1.563vw]">
                  {eventCity}
                  {eventCity && eventProvince ? ', ' : ''}
                  {eventProvince}
                </p>
              </div>
            </div>
          </div>
        </div>

        {safeResponse?.data?.[0]?.events?.[0]?.welcomeMessage ?
        <>
        <p className="w-[58.073vw] max-w-[100%] text-[16px] tracking-[0.5px] lg:text-[1.875vw] lg:leading-[2.604vw] mx-auto mt-5 mb-[7.552vw] leading-relaxed">
          {safeResponse?.data?.[0]?.events?.[0]?.welcomeMessage}
        </p>
        </> : <>
        <h2 className="text-[42px] -tracking-[0.3px] mb-[9px] lg:text-[2.917vw] lg:leading-[3.125vw] xl:mt-0 mt-16 font-normal prata">
          we are looking <span className="font-italic">so forward</span> to
          celebrating with you
        </h2>
        </>
        }
      </div>

      <div className="w-[92.135vw] max-w-[100%] mx-auto bg-[#FAF9F6] py-[5.469vw] px-[5.99vw]">
        <h2 className="mt-0 lg:text-[2.5vw] lg:leading-[1.875vw] text-[24px] prata text-center font-normal mb-5">
          our registry selections
        </h2>
        <img
          src={headingBottomCurve}
          alt="Couple"
          className="max-w-[33.021vw] h-auto mx-auto"
        />

        {/* Filters (match dashboard.registry "your registry selections") */}
        {hasProducts && registryId && (
          <div className="filters" ref={filterRef}>
            <div className="filter-item flex gap-x-[5.208vw] mt-[5.052vw] justify-center max-[1024px]:flex-wrap max-[1024px]:gap-[20px] items-start">
              {/* Categories dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={filterTriggerClass}
                  onClick={() =>
                    setOpenFilter(openFilter === 'category' ? null : 'category')
                  }
                >
                  <strong>Categories</strong> {categoryLabel}{' '}
                  <Arrow isOpen={openFilter === 'category'} />
                </button>
                {openFilter === 'category' && (
                  <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#FAF9F6] border border-[#1F1D1B] rounded shadow-lg z-50 py-1">
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setCategoryFilter('all');
                        setOpenFilter(null);
                      }}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setCategoryFilter('gifts');
                        setOpenFilter(null);
                      }}
                    >
                      Gifts
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setCategoryFilter('cashfunds');
                        setOpenFilter(null);
                      }}
                    >
                      Cash Funds
                    </button>
                  </div>
                )}
              </div>

              {/* Price dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={filterTriggerClass}
                  onClick={() =>
                    setOpenFilter(openFilter === 'price' ? null : 'price')
                  }
                >
                  <strong>price</strong>{' '}
                  {priceSort === 'low-to-high' ? 'low to high' : 'high to low'}{' '}
                  <Arrow isOpen={openFilter === 'price'} />
                </button>
                {openFilter === 'price' && (
                  <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-[#FAF9F6] border border-[#1F1D1B] rounded shadow-lg z-50 py-1">
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setPriceSort('low-to-high');
                        setOpenFilter(null);
                      }}
                    >
                      low to high
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setPriceSort('high-to-low');
                        setOpenFilter(null);
                      }}
                    >
                      high to low
                    </button>
                  </div>
                )}
              </div>

              {/* Status dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={filterTriggerClass}
                  onClick={() =>
                    setOpenFilter(openFilter === 'status' ? null : 'status')
                  }
                >
                  <strong>status</strong>{' '}
                  {statusFilter === 'gifted'
                    ? 'Gifted'
                    : statusFilter === 'ungifted'
                    ? 'Ungifted'
                    : 'All'}{' '}
                  <Arrow isOpen={openFilter === 'status'} />
                </button>
                {openFilter === 'status' && (
                  <div className="absolute top-full left-0 mt-1 min-w-[140px] bg-[#FAF9F6] border border-[#1F1D1B] rounded shadow-lg z-50 py-1">
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setStatusFilter('all');
                        setOpenFilter(null);
                      }}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setStatusFilter('gifted');
                        setOpenFilter(null);
                      }}
                    >
                      Gifted
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent"
                      onClick={() => {
                        setStatusFilter('ungifted');
                        setOpenFilter(null);
                      }}
                    >
                      Ungifted
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show products if they exist, otherwise show no products message */}
        {hasProducts && registryId && safeData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2.083vw] p-0 mt-[5.885vw]">
            {filteredData
              .map((product, index) => {
                console.log('Product:', product);
                // Safety check: Ensure product has required properties
                if (!product || !product.id) {
                  console.warn('Skipping invalid product:', product);
                  return null;
                }

                return (
                  <CoupleProductCard
                    key={product.id || index}
                    name={
                      product.title ||
                      product.cashFund?.name ||
                      'Unnamed Product'
                    }
                    image={
                      product.images?.edges?.[0]?.node?.url ||
                      product.cashFund?.image?.fileUrl ||
                      '/assets/Images/placeholder.png'
                    }
                    price={product.amount || 0}
                    description={
                      product.description ||
                      product.cashFund?.note ||
                      'No description available'
                    }
                    quantity={product.quantity || 1}
                    isGroupGift={product.isGroupPayment || false}
                    isCashFund={product.isCashFund || false}
                    status={product.status || 'addToCart'}
                    contributedAmount={Number(product.collectedAmount) || 0}
                    maxContribution={Number(product.amount) || 0}
                    purchasedQuantity={Number(product.purchasedQuantity) || 0}
                    isAnyAmount={product.cashFund?.isAnyAmount || false}
                    onAddToCart={(selectedQuantity) =>
                      handleAddToCart(product.id, selectedQuantity)
                    }
                    onContribute={(amount) =>
                      handleContribute(product.id, amount)
                    }
                    onTitleClick={() => handleTitleClick(product)}
                  />
                );
              })
              .filter(Boolean)}{' '}
            {/* Filter out null products */}
          </div>
        ) : (
          <div className="text-center py-16 px-6 mt-12">
            <div className="max-w-md mx-auto">
              <img
                src="/assets/Images/NoProduct.png"
                alt="No Products"
                className="w-36 h-36 mx-auto mb-6 opacity-50"
              />
              {isLoggedIn && (
                <h3 className="text-[22px] font-semibold text-[#1F1D1B] mb-4">
                  No Products Found
                </h3>
              )}
              <p className="text-[#1F1D1B] mb-6">
                {isLoggedIn
                  ? 'Add gifts to get your registry started.'
                  : 'IT\'S QUIET HERE FOR NOW'}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="pt-[8.073vw] pb-[8.542vw] w-full flex justify-center items-center">
        <div className="py-[2.917vw] md:py-20 bg-[#446184] flex items-center justify-around flex-row lg:w-[92.135vw] w-full max-[768px]:p-10 mt-6 gap-x-8">
          <div>
            <img
              src="/assets/Images/giftCard.png"
              alt="gift"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center justify-center pr-[10.417vw]">
            <h3 className="text-2xl text-white lg:text-[2.292vw] 3xl:w-full prata max-w-[410px] text-center">
              give the gift of choice
            </h3>
            <img
              src="/assets/Images/white-bdr.png"
              alt="couple"
              className="max-w-[315px] lg:max-w-[16.927vw] lg:w-[16.927vw] mb-[1.875vw] mt-4 mx-auto"
            />
            <p className="text-sm lg:text-[26px] lg:leading-[1.667vw] text-white lg:max-w-[31.615vw] max-w-[488px] mt-4 mb-10 font-normal text-center">
              A Registry gift card helps the couple choose exactly what they need, when they are ready.
            </p>
            <Link to="/dashboard/giftcards">
              <button
                type="button"
                className="text-black text-[18px] leading-[18px] font-bold py-4 lg:h-[3.779vw] lg:w-[12vw] px-4 bg-[#F5F2ED] rounded-none cursor-pointer mx-auto block"
              >
                PURCHASE
              </button>
            </Link>
          </div>
        </div>
      </div>

      {sideCartOpen && hasProducts && registryId && (
        <div
          className="fixed inset-0 bg-[#2b2b2b61] bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}
      {hasProducts && registryId && (
        <SideCart
          key={`cart-${cartItems.length}-${JSON.stringify(
            cartItems.map((item) => item.id),
          )}-${forceRender}`}
          open={sideCartOpen}
          onClose={onClose}
          cartItems={cartItems}
          total={cartTotal}
          subtotal={cartTotal}
          onCartChange={handleRemoveFromCart}
          onClearCart={handleClearCart}
          recommendedProducts={recommendedProducts}
          onAddRecommendedProduct={handleAddRecommendedProduct}
          cashFunds={recommendedCashFunds}
          onAddCashFund={(cashFund) => handleAddToCart(cashFund.id)}
          registryId={registryId}
          guestEmail={guestEmail}
        />
      )}

      {isPopupOpen && selectedGiftData && hasProducts && registryId && (
        <div
          className="fixed inset-0  bg-[#00000073]  flex items-center justify-center z-50 p-4 overflow-auto scale-[1.5]"
          onClick={closePopup}
        >
          <div
            className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800"
            >
              X
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
              {/* Product Image Section */}
              <div className="relative py-8 pl-8 md:pr-0 pr-8">
                <img
                  src={
                    selectedGiftData.images?.edges?.[selectedImageIndex]?.node
                      ?.url ||
                    selectedGiftData.cashFund?.image?.fileUrl ||
                    '/assets/Images/placeholder.png'
                  }
                  alt={
                    selectedGiftData.title ||
                    selectedGiftData.cashFund?.name ||
                    'Product'
                  }
                  className="w-full h-auto object-cover md:rounded-l-lg"
                />
                {/* Interactive Thumbnail Display - clicking changes main image */}
                <div className="flex gap-2 mt-4 px-4 md:px-0">
                  {/* Only show thumbnails if there are multiple images */}
                  {selectedGiftData.images?.edges &&
                  selectedGiftData.images.edges.length > 1 ? (
                    <>
                      {selectedGiftData.images.edges.map((imageEdge, index) => (
                        <div
                          key={index}
                          className={`p-1 w-20 h-20 border-[#3d5a80] border-2 cursor-pointer transition-all hover:border-[#2c425e] ${
                            selectedImageIndex === index
                              ? 'border-[#2c425e] border-4'
                              : ''
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={
                              imageEdge.node?.url ||
                              '/assets/Images/placeholder.png'
                            }
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </>
                  ) : (
                    // Fallback: show single thumbnail for cash funds or single images
                    <div className="p-1 w-20 h-20 border-[#3d5a80] border-2">
                      <img
                        src={
                          selectedGiftData.images?.edges?.[0]?.node?.url ||
                          selectedGiftData.cashFund?.image?.fileUrl ||
                          '/assets/Images/placeholder.png'
                        }
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details Section */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="uppercase text-sm tracking-wider text-gray-700 font-medium">
                  HOPSON GRACE
                </div>
                <h1 className="text-3xl md:text-4xl font-serif mt-2 mb-4">
                  {selectedGiftData.title ||
                    selectedGiftData.cashFund?.name ||
                    'Product'}
                </h1>
                <div className="text-xl font-medium mb-6">
                  ${selectedGiftData.amount || 0}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {/* Quantity Selector for Regular Products */}
                  {!selectedGiftData.isCashFund &&
                    !selectedGiftData.isGroupGift &&
                    selectedGiftData.status !== 'purchased' && (
                      <div className="flex flex-col items-center justify-center mb-4">
                        <button
                          onClick={incrementModalQuantity}
                          disabled={modalQuantity >= getModalStillNeeds()}
                          className="w-8 h-8 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <img
                            src="/assets/Images/arrowDown.png"
                            alt="plus"
                            className="w-4 h-4 rotate-180"
                          />
                        </button>

                        <span className="mx-4 text-lg font-medium">
                          {modalQuantity} / {getModalStillNeeds()}
                        </span>
                        <button
                          onClick={decrementModalQuantity}
                          disabled={modalQuantity <= 1}
                          className="w-8 h-8 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <img
                            src="/assets/Images/arrowDown.png"
                            alt="minus"
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      if (
                        selectedGiftData.isCashFund ||
                        selectedGiftData.isGroupGift
                      ) {
                        // For cash funds and group gifts, you might want to show a contribution input
                        // For now, let's just close the popup
                        closePopup();
                      } else {
                        // For regular products, add to cart with quantity
                        handleAddToCart(selectedGiftData.id, modalQuantity);
                        closePopup();
                      }
                    }}
                    className={`bg-[#3d5a80] text-white py-3 px-6 uppercase text-sm tracking-wider flex-grow rounded transition-colors
                      ${
                        selectedGiftData.status === 'purchased' ||
                        (selectedGiftData.isCashFund &&
                          (selectedGiftData.amount || 0) -
                            (selectedGiftData.collectedAmount || 0) <=
                            0) ||
                        (selectedGiftData.isGroupGift &&
                          (selectedGiftData.amount || 0) -
                            (selectedGiftData.collectedAmount || 0) <=
                            0)
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'hover:bg-[#2c425e]'
                      }
                    `}
                    disabled={
                      selectedGiftData.status === 'purchased' ||
                      (selectedGiftData.isCashFund &&
                        (selectedGiftData.amount || 0) -
                          (selectedGiftData.collectedAmount || 0) <=
                          0) ||
                      (selectedGiftData.isGroupGift &&
                        (selectedGiftData.amount || 0) -
                          (selectedGiftData.collectedAmount || 0) <=
                          0)
                    }
                  >
                    {selectedGiftData.status === 'purchased'
                      ? 'PURCHASED'
                      : (selectedGiftData.isCashFund ||
                          selectedGiftData.isGroupGift) &&
                        (selectedGiftData.amount || 0) -
                          (selectedGiftData.collectedAmount || 0) <=
                          0
                      ? 'FULLY FUNDED'
                      : selectedGiftData.buttonLabel || 'ADD TO CART'}
                  </button>
                </div>

                {/* Product Description */}
                <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                  {selectedGiftData.description ||
                    selectedGiftData.cashFund?.note ||
                    "Keep your butter spreadable and fresh in this butter keeper, a French invention when refrigeration didn't exist. Marble naturally keeps butter cool, and the French naturally know their way around the kitchen. Need we say more?"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && hasProducts && registryId && (
        <ModalPortal>
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div
            className="w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex py-32 max-[768px]:py-10 justify-center max-[768px]:flex-col max-[768px]:items-center max-[768px]:px-4 container">
              <div className="bg-steel-blue text-white py-[110px] px-[90px] lg:w-[52.083vw] pb-28 pt-[100px] relative max-[768px]:max-w-[100%] max-w-[1000px] max-[1024px]:p-6 max-[768px]:pb-20 max-[768px]:pt-14 max-[768px]:w-full text-center">

              <button
          onClick={() => setShowEmailModal(false)}
          className="absolute top-6 right-6 text-white text-3xl font-light hover:opacity-70 transition"
          aria-label="Close modal"
        >
          &times;
        </button>

                <h3 className="text-5xl font-[400] lg:text-[2.292vw] lg:leading-[3.125vw] prata text-center max-[768px]:text-2xl afterimg">
                ready to purchase your gift for the couple?
                </h3>
                <div className="mb-10">
                  <div className="flex h-full items-center">
                    <form
                      className="space-y-6 max-w-full w-full mx-auto"
                      onSubmit={handleEmailSubmit}
                    >
                      <div className="text-center mt-6">
                        <Heading
                          text="Enter your email to continue."
                          classes="font-normal text-[22px] m-0"
                        />
                      </div>
                      <div className="max-w-md mx-auto">
                        <Input
                          ref={emailInputRef}
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="Email Address *"
                          name="email"
                          type="email"
                          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                          classNameLabel="text-center"
                          error={
                            guestEmail &&
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)
                              ? 'Please enter a valid email address'
                              : undefined
                          }
                          onBlur={(e) => {
                            const email = e.target.value.trim();
                            if (
                              email &&
                              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                            ) {
                              setAlertMessage(
                                'Please enter a valid email address',
                              );
                              setAlertType('error');
                              setShowAlert(true);
                              setTimeout(() => setShowAlert(false), 3000);
                            }
                          }}
                          required
                        />
                      </div>

                      {/* Back and Next buttons */}
                      <div className="flex justify-between mt-8 absolute bottom-6 left-6 right-6 steps-btns-hover">
                        <button
                          type="button"
                          onClick={() => setShowEmailModal(false)}
                          className="flex items-center uppercase font-bold gap-2 z-10"
                        >
                          <img src="" alt="" className="rotate-180" />
                        </button>
                        <button
                          type="submit"
                          className="flex items-center uppercase font-bold gap-2 z-10"
                          disabled={isApiLoading}
                        >
                          {isApiLoading ? 'Processing...' : 'Continue'}
                          <img src="/assets/Images/arrow.png" alt="" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                {/* <div className="step absolute bottom-6 max-[768px]:bottom-2.5 right-0 left-0 text-center flex items-center gap-2 justify-center">
                  <span className="text-6xl max-[768px]:text-4xl">1</span>
                  <span className="text-3xl max-[768px]:text-lg font-normal">/</span>
                  <span className="text-3xl max-[768px]:text-lg font-normal">1</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      <Footer />
    </>
  );
}
