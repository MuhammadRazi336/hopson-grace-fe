import {defer, json, Link, useFetcher, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import CoupleProductCard from '~/components/CoupleProductCard';
import {useState, useRef, useEffect} from 'react';
import {CoupleProfileViewHeader} from './couple.test._index';
import SideCart from '~/components/SideCart';
import {CoupleFooter} from '~/components/CoupleFooter';
import Input from '~/components/Input';
import Heading from '~/components/Heading';

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

    // Get API base URL from environment
    const apiBaseUrl = context.env?.API_BASE_URL || '';

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
    apiBaseUrl = '',
    hasProducts = false,
    coupleId = null,
  } = loaderData || {};

  // Safety check: If we don't have a registry ID, show an error
  if (!registryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">
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

  console.log('Component: Safe data:', {
    safeData: safeData.length,
    safeCashfundData: safeCashfundData.length,
    safeCollections: safeCollections.length,
    hasProducts,
    registryId,
    coupleId,
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
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
      console.log('fetchCartItems: Skipping - no products or registry ID');
      setCartItems([]);
      cartItemsRef.current = [];
      return;
    }

    const email =
      typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    console.log(
      'fetchCartItems called with email:',
      email,
      'registryId:',
      registryId,
    );

    if (!email || !registryId) {
      console.log(
        'fetchCartItems: Missing email or registryId, returning early',
      );
      return;
    }

    setCartLoading(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/cart/get-cart/${registryId}/${email}`,
      );
      const apiData = await res.json();

      if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
        // Extract registryProducts from the first cart
        const cartData = apiData.data[0];
        console.log('Cart API Response:', cartData);
        console.log('Cart Items:', cartData.cartItemProducts);

        // Transform the API data to match SideCart expectations
        const transformedItems = (cartData.cartItemProducts || []).map(
          (cartItem) => {
            const registryProduct = cartItem.registryProduct;
            console.log('Cart Item:', cartItem);
            console.log('Registry Product:', registryProduct);
            console.log('CartItem quantity:', cartItem.quantity);
            console.log('RegistryProduct quantity:', registryProduct.quantity);

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
        console.log('Transformed Items:', transformedItems);
        setCartItems(transformedItems);
        // Also update the ref for immediate access
        cartItemsRef.current = transformedItems;
      } else {
        setCartItems([]);
        cartItemsRef.current = [];
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      cartItemsRef.current = [];
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch cart items on component mount and when email changes
  useEffect(() => {
    console.log(
      'useEffect triggered - guestEmail:',
      guestEmail,
      'registryId:',
      registryId,
      'hasProducts:',
      hasProducts,
    );
    if (guestEmail && registryId && hasProducts) {
      console.log('Calling fetchCartItems from useEffect');
      fetchCartItems();
    } else {
      console.log('useEffect: Skipping fetchCartItems - missing requirements');
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

  // Force re-render when cart items change and sidecart is open
  useEffect(() => {
    console.log('Cart items state changed:', cartItems);
    console.log('Cart items ref:', cartItemsRef.current);
    if (sideCartOpen && cartItems.length > 0) {
      // This will force a re-render when cart items are updated
      console.log('Cart items updated, forcing re-render for sidecart');
    }
  }, [cartItems, sideCartOpen]);

  // Watch for force render changes
  useEffect(() => {
    console.log('Force render triggered:', forceRender);
  }, [forceRender]);

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
      console.log(
        'handleCartClick: No cart items, fetching before opening sidecart',
      );
      fetchCartItems().then(() => {
        setSideCartOpen(true);
      });
    } else {
      console.log(
        'handleCartClick: Cart items already loaded, opening sidecart',
      );
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
      console.log('callCartApi: Skipping - no products or registry ID');
      return {success: false, error: 'No products available'};
    }

    setIsApiLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/cart`, {
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
      console.log('callAddToCartApi: Skipping - no products or registry ID');
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
      console.log('Sending to Cart API:', payload);

      const res = await fetch(
        `${apiBaseUrl}/api/cart/add-to-cart/${registryId}/${email}`,
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
      console.log(
        'callAddToCartApiWithQuantity: Skipping - no products or registry ID',
      );
      return {success: false, error: 'No products available'};
    }

    setIsApiLoading(true);
    try {
      console.log('Sending to Cart API with quantity:', payload);

      const res = await fetch(
        `${apiBaseUrl}/api/cart/add-to-cart/${registryId}/${email}`,
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
  const handleAddToCart = (productId, quantity = 1) => {
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

    callAddToCartApiWithQuantity(email, payload).then((result) => {
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
    });
  };

  // Modified Contribute
  const handleContribute = (productId, amount) => {
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
    callAddToCartApi(email, registryProductId, amount, product).then(
      (result) => {
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
      },
    );
  };

  // Modal submit handler - handles email submission and adds pending products to cart
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const email = guestEmail.trim();
    console.log('handleEmailSubmit: Starting with email:', email);
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
    console.log('handleEmailSubmit: Calling callCartApi with email:', email);
    await callCartApi(email);
    setShowEmailModal(false);

    // Update guest email state first to trigger useEffect
    console.log('handleEmailSubmit: Setting guestEmail state to:', email);
    setGuestEmail(email);

    // Fetch cart items directly with the email before opening sidecart
    // This ensures we have the cart data before the sidecart opens
    const emailForCart = email; // Use the email we just set
    console.log(
      'handleEmailSubmit: Fetching cart items with email:',
      emailForCart,
      'registryId:',
      registryId,
    );
    if (emailForCart && registryId) {
      setCartLoading(true);
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/cart/get-cart/${registryId}/${emailForCart}`,
        );
        const apiData = await res.json();

        if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
          // Extract registryProducts from the first cart
          const cartData = apiData.data[0];
          console.log('Cart API Response:', cartData);
          console.log('Cart Items:', cartData.cartItemProducts);

          // Transform the API data to match SideCart expectations
          const transformedItems = (cartData.cartItemProducts || []).map(
            (cartItem) => {
              const registryProduct = cartItem.registryProduct;
              console.log('Cart Item:', cartItem);
              console.log('Registry Product:', registryProduct);
              console.log('CartItem quantity:', cartItem.quantity);
              console.log(
                'RegistryProduct quantity:',
                registryProduct.quantity,
              );

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
          console.log('Transformed Items:', transformedItems);

          // Set cart items and wait for state update to complete
          console.log('About to set cart items:', transformedItems);

          // Use a Promise to ensure the state update is complete
          await new Promise((resolve) => {
            setCartItems(transformedItems);
            // Also update the ref immediately
            cartItemsRef.current = transformedItems;

            // Use a longer delay to ensure React processes the state update
            setTimeout(() => {
              console.log('State update delay completed');
              resolve();
            }, 300);
          });

          // Store the items locally to ensure they're available when opening sidecart
          const localCartItems = transformedItems;

          console.log(
            'handleEmailSubmit: Cart items set, now opening sidecart',
          );
          console.log('Local cart items:', localCartItems);
          console.log('Cart items ref:', cartItemsRef.current);

          // Force a re-render to ensure the component updates
          setForceRender((prev) => prev + 1);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
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
            console.log(
              'CoupleProfile: Stored registryId in localStorage:',
              product.registryId,
            );
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

          console.log('Adding pending product to cart:', payload);
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
            console.log(
              'CoupleProfile: Stored registryId in localStorage:',
              product.registryId,
            );
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

    console.log(
      'handleEmailSubmit: Opening sidecart, current cartItems:',
      cartItems,
    );

    // Now open the sidecart - cart items should already be loaded
    setSideCartOpen(true);
  };

  // Re-add handleRemoveFromCart for SideCart
  const handleRemoveFromCart = (itemId, updatedItem = null) => {
    if (!hasProducts || !registryId) {
      console.log(
        'handleRemoveFromCart: Skipping - no products or registry ID',
      );
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
      fetch(
        `${apiBaseUrl}/api/cart/update-quantity/${registryProductId}/${registryId}/${email}`,
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
          console.error('Error updating quantity:', error);
          setAlertMessage('Error updating quantity');
          setAlertType('error');
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        });
    } else {
      // Remove item from cart
      fetch(
        `${apiBaseUrl}/api/cart/remove-from-cart/${registryProductId}/${registryId}/${email}`,
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
          console.error('Error removing item from cart:', error);
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
      console.log('handleClearCart: Skipping - no products or registry ID');
      return;
    }

    // TODO: Implement clear cart API call
    // For now, just refresh the cart
    fetchCartItems();
  };

  // Filter products
  const filteredData =
    safeData && safeData.length > 0 && hasProducts && registryId
      ? safeData
          .filter((product) => {
            // Safety check: Ensure product exists and has required properties
            if (!product || !product.id) {
              return false;
            }

            if (selectedCategory) {
              const collectionTitles =
                product.collections?.nodes?.map((c) => c.title) || [];
              if (!collectionTitles.includes(selectedCategory)) return false;
            }

            if (availability) {
              if (product.isCashFund) {
                return availability === 'in-stock';
              }
              const isAvailable = product.availableForSale ?? true;
              const isPurchased = product.status === 'purchased';
              if (availability === 'in-stock') {
                return isAvailable && !isPurchased;
              }
              if (availability === 'out-of-stock') {
                return !isAvailable || isPurchased;
              }
            }
            return true;
          })
          .sort((a, b) => {
            if (priceSort === 'low-to-high') {
              return (a.amount ?? 0) - (b.amount ?? 0);
            }
            if (priceSort === 'high-to-low') {
              return (b.amount ?? 0) - (a.amount ?? 0);
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

  const childCollections = safeCollections.filter((collection) => {
    // Safety check: Ensure collection exists and has required properties
    if (!collection || !collection.metafield) {
      return false;
    }
    return collection.metafield?.value === 'true';
  });

  // Only process child collections if we have products and registry
  const validChildCollections =
    hasProducts && registryId ? childCollections : [];
  return (
    <>
      {showAlert && (
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
      )}
      <CoupleProfileViewHeader
        onCartClick={handleCartClick}
        showCart={hasProducts && registryId}
      />
      <div className="text-center pt-[80px] container mx-auto font-sans">
        <img
          src={
            safeResponse?.data?.[0]?.events?.[0]?.backgroundImage?.fileUrl ||
            '/assets/Images/couple-profile-bg.png'
          }
          alt="Couple"
          className="w-full h-[400px] lg:h-[600px] object-cover"
        />
        <div className="flex flex-wrap xl:flex-nowrap justify-center xl:items-end items-center -mb-10 xl:-translate-y-[200px] ">
          <div className="xl:w-4/12 w-full">
            <h1 className="md:text-[75px] my-2 max-w-[340px] leading-[1.25] prata ml-auto xl:text-left text-center xl:mx-0 mx-auto">
              {safeResponse?.data?.[0]?.user?.firstName || 'Couple'} &{' '}
              {safeResponse?.data?.[0]?.user?.fianceFirstName || 'Partner'}
            </h1>
          </div>
          <div className="xl:w-4/12 w-full">
            {safeResponse?.data?.[0]?.events?.[0]?.image?.fileUrl ? (
              <img
                src={safeResponse.data[0].events[0].image.fileUrl}
                alt="Couple's Image"
                className="rounded-full xl:w-full xl:h-full h-[300px] w-[100px] mx-auto"
              />
            ) : (
              <span className="text-gray-500">No Image Available</span>
            )}
          </div>
          <div className="xl:w-4/12 w-full">
            <div className="mr-16">
              <p className="md:text-[42px] text-right my-2 leading-[1.25] prata ml-auto">
                {safeResponse?.data?.[0]?.events?.[0]?.eventDate || 'Date TBD'}
              </p>
              <img
                src="/assets/Images/profile-view-page-bdr.png"
                alt="Couple"
                className="max-w-[370px] h-auto ml-auto"
              />
              <div className="text-right ">
                <p className="text-lg my-1 uppercase">
                  {safeResponse?.data?.[0]?.events?.[0]?.location ||
                    'Location TBD'}
                </p>
                <p className="text-lg my-1 uppercase">
                  {safeResponse?.data?.[0]?.events?.[0]?.city || 'City'},{' '}
                  {safeResponse?.data?.[0]?.events?.[0]?.province || 'Province'}
                </p>
                <p className="text-lg my-1 uppercase">
                  {safeResponse?.data?.[0]?.events?.[0]?.weddingTime ||
                    'Time TBD'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <h2 className="md:text-[42px] xl:mt-0 mt-16 font-normal ivyora">
          we are looking <span className="font-italic">SO FORWARD</span> to
          celebrating with you
        </h2>

        <p className="max-w-2xl mx-auto my-5 leading-relaxed">
          {safeResponse?.data?.[0]?.events?.[0]?.welcomeMessage ||
            'Thank you for being part of our special day!'}
        </p>
      </div>

      <div className="container mx-auto bg-[#FAF9F6] py-10 px-6">
        <h2 className="mt-0 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-5">
          our registry selections
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] h-auto mx-auto"
        />

        {/* Only show filters if there are products and collections */}
        {hasProducts && validChildCollections.length > 0 && registryId && (
          <div className="filters">
            <div className="filter-item flex gap-x-12 mt-12 justify-center">
              <div
                className="relative"
                onClick={() => {
                  const nextCategory =
                    selectedCategory === ''
                      ? validChildCollections[0]?.title || ''
                      : selectedCategory ===
                        validChildCollections[validChildCollections.length - 1]
                          ?.title
                      ? ''
                      : validChildCollections[
                          validChildCollections.findIndex(
                            (c) => c.title === selectedCategory,
                          ) + 1
                        ]?.title || '';
                  setSelectedCategory(nextCategory);
                }}
              >
                <h3 className="text-lg uppercase border-b-2 border-[#446184] cursor-pointer">
                  <strong>Categories</strong> {selectedCategory || 'All'}
                </h3>
              </div>

              <div
                className="relative"
                onClick={() => {
                  const options = ['', 'low-to-high', 'high-to-low'];
                  const currentIndex = options.indexOf(priceSort);
                  const nextIndex = (currentIndex + 1) % options.length;
                  setPriceSort(options[nextIndex]);
                }}
              >
                <h3 className="text-lg uppercase border-b-2 border-[#446184] cursor-pointer">
                  <strong>price</strong>{' '}
                  {priceSort === 'low-to-high'
                    ? 'low to high'
                    : priceSort === 'high-to-low'
                    ? 'high to low'
                    : 'All'}
                </h3>
              </div>

              <div
                className="relative"
                onClick={() => {
                  const options = ['', 'in-stock', 'out-of-stock'];
                  const currentIndex = options.indexOf(availability);
                  const nextIndex = (currentIndex + 1) % options.length;
                  setAvailability(options[nextIndex]);
                }}
              >
                <h3 className="text-lg uppercase border-b-2 border-[#446184] cursor-pointer">
                  <strong>status</strong>{' '}
                  {availability === 'in-stock'
                    ? 'Available'
                    : availability === 'out-of-stock'
                    ? 'Purchased'
                    : 'All'}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Show products if they exist, otherwise show no products message */}
        {hasProducts && registryId && safeData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-12">
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
                    onAddToCart={() => handleAddToCart(product.id)}
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
                src="/assets/Images/gift.png"
                alt="No Products"
                className="w-24 h-24 mx-auto mb-6 opacity-50"
              />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 prata">
                No Products Found
              </h3>
              <p className="text-gray-600 mb-6">
                This registry doesn't have any products or cash funds added yet.
                Check back later or contact the couple for more information.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">
                  <strong>Tip:</strong> You can still contribute to their
                  journey using the "Gift Any Amount" section below.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="py-12 w-full flex justify-center items-center">
        <div className="py-10 md:py-12 bg-[#446184] flex items-center justify-around flex-row lg:w-[70%] w-full max-[768px]:p-10 lg:mt-20 mt-6 gap-x-16">
          <div>
            <img
              src="/assets/Images/giftCard.png"
              alt="gift"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-2xl text-white lg:text-5xl 2xl:text-3xl 3xl:w-full prata max-w-[410px] text-center">
              gift any amount
            </h3>
            <img
              src="/assets/Images/white-bdr.png"
              alt="couple"
              className="max-w-[315px] mb-4 mt-4 mx-auto"
            />
            <h5 className="text-white text-xl text-center font-normal">
              CONTRIBUTE TO OUR JOURNEY!
            </h5>
            <p className="text-sm lg:text-xl text-white max-w-[488px] mt-4 mb-7 font-normal text-center">
             Help us create our dream wedding,  honeymoon or life experience. We’re so grateful.
            </p>
            <div className="flex flex-row items-center justify-center gap-x-4">
              <button
                type="button"
                className="text-black font-bold py-4 px-8 bg-[#F5F2ED] rounded-none cursor-pointer mx-auto block"
              >
                $100
              </button>
              <button
                type="button"
                className="text-black font-bold py-4 px-8 bg-[#F5F2ED] rounded-none cursor-pointer mx-auto block"
              >
                $200
              </button>
              <button
                type="button"
                className="text-black font-bold py-4 px-8 bg-[#F5F2ED] rounded-none cursor-pointer mx-auto block"
              >
                OTHER
              </button>
            </div>
          </div>
        </div>
      </div>

      {sideCartOpen && hasProducts && registryId && (
        <div
          className="fixed inset-0 bg-[#2b2b2b61] bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}
      {console.log(
        'Rendering SideCart with cartItems:',
        cartItems,
        'sideCartOpen:',
        sideCartOpen,
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
        />
      )}

      {isPopupOpen && selectedGiftData && hasProducts && registryId && (
        <div
          className="fixed inset-0  bg-[#00000073]  flex items-center justify-center z-50 p-4 overflow-y-auto"
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
                          className={`border p-1 w-20 h-20 border-[#3d5a80] border-2 cursor-pointer transition-all hover:border-[#2c425e] ${
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
                    <div className="border p-1 w-20 h-20 border-[#3d5a80] border-2">
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
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex py-32 max-[768px]:py-10 justify-center max-[768px]:flex-col max-[768px]:items-center max-[768px]:px-4 container">
              <div className="bg-steel-blue text-white py-[110px] px-[90px] lg:w-[52.083vw] pb-28 pt-[100px] relative max-[768px]:max-w-[100%] max-w-[1000px] max-[1024px]:p-6 max-[768px]:pb-20 max-[768px]:pt-14 max-[768px]:w-full text-center">
                <h3 className="text-5xl font-[400] lg:text-[2.292vw] lg:leading-[3.125vw] prata text-center max-[768px]:text-2xl afterimg">
                  let's get to know each other.
                </h3>
                <div className="mb-10">
                  <div className="flex h-full items-center">
          <form
                      className="space-y-6 max-w-full w-full mx-auto"
            onSubmit={handleEmailSubmit}
                    >
                      <div className="text-center mt-6">
                        <Heading
                          text="ENTER YOUR EMAIL"
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
                            guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)
                              ? 'Please enter a valid email address'
                              : undefined
                          }
              onBlur={(e) => {
                const email = e.target.value.trim();
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  setAlertMessage('Please enter a valid email address');
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
      )}

      <CoupleFooter />
    </>
  );
}
