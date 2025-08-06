import {defer, json, useFetcher, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import CoupleProductCard from '~/components/CoupleProductCard';
import {useState, useRef, useEffect} from 'react';
import {CoupleProfileViewHeader} from './couple.test._index';
import SideCart from '~/components/SideCart';
import {CoupleFooter} from '~/components/CoupleFooter';

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
  const coupleId = params.id;

  const response = await context.ClientGet(
    `registries/by-userId/${coupleId}`,
    context,
  );
  const registryId = response.data[0]?.id;
  if (!response.data) throw new Response('Not Found', {status: 404});

  const [res, cashRes, shopifyCollections] = await Promise.all([
    context.ClientGet(`registryProducts/${registryId}?type=gift`, context),
    context.ClientGet(`registryProducts/${registryId}?type=cash`, context),
    context.storefront.query(COLLECTION_QUERY),
  ]);

  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`,
  );
  const products = await fetchProducts(context.storefront, ids);

  let mergedArray = [];
  if (res?.data?.length) {
    mergedArray = res.data.map((item1) => {
      const product = products?.nodes?.find(
        (item2) => item2?.id === `gid://shopify/Product/${item1.productId}`,
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
  }

  const cashFundProducts = Array.isArray(cashRes?.data)
    ? cashRes.data.map((item) => ({
        ...item,
        status: 'cashFund',
        isCashFund: true,
        availableForSale: true,
      }))
    : [];

  return defer({
    data: [...mergedArray, ...cashFundProducts],
    cashfundData: cashFundProducts,
    response,
    registryId,
    collections: shopifyCollections.collections.nodes,
  });
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

    // Get the current cart
    const cartItems = JSON.parse(context.session.get('cart') || '[]');

    // Handle cart operations
    if (clearCart === 'true') {
      context.session.set('cart', '[]');
      return json(
        {success: true, action: 'clear'},
        {
          headers: {
            'Set-Cookie': await context.session.commit(),
          },
        },
      );
    }

    if (itemId && !productData) {
      const updatedCart = cartItems.filter(
        (item) => item.id !== Number(itemId),
      );
      context.session.set('cart', JSON.stringify(updatedCart));
      return json(
        {success: true, action: 'remove', itemId},
        {
          headers: {
            'Set-Cookie': await context.session.commit(),
          },
        },
      );
    }

    if (!productData) {
      return json({success: false, error: 'Product data is required'});
    }

    const product = JSON.parse(productData);

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
        '',
      productTypeId: productTypeId,
      registryId: Number(product.registryId || response?.data[0]?.id),
      quantity: 1,
      originalId: product.id,
      isCashFund: productTypeId === 2 ? true : false,
    };


    // Update cart in session
    const updatedCart = [...cartItems, cartItem];
    context.session.set('cart', JSON.stringify(updatedCart));

    return json(
      {
        success: true,
        action: 'add',
        item: cartItem,
        message: `${cartItem.title} added to cart`,
      },
      {
        headers: {
          'Set-Cookie': await context.session.commit(),
        },
      },
    );
  } catch (error) {
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
  const {data, cashfundData, response, registryId, collections} =
    useLoaderData() || [];
  const fetcher = useFetcher();

  console.log('CoupleProfile: data from loader:', response);

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
  
  // Function to fetch cart items from API
  const fetchCartItems = async () => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    
    if (!email || !registryId) {
      return;
    }
    
    setCartLoading(true);
    try {
      const res = await fetch(`https://dev-hopsongrace.codup.io/api/cart/get-cart/${registryId}/${email}`);
      const apiData = await res.json();
      
      if (apiData.code === 200 && apiData.data && apiData.data.length > 0) {
        // Extract registryProducts from the first cart
        const cartData = apiData.data[0];
        console.log('Cart API Response:', cartData);
        console.log('Cart Items:', cartData.cartItemProducts);
        
        // Transform the API data to match SideCart expectations
        const transformedItems = (cartData.cartItemProducts || []).map(cartItem => {
          const registryProduct = cartItem.registryProduct;
          console.log('Cart Item:', cartItem);
          console.log('Registry Product:', registryProduct);
          console.log('CartItem quantity:', cartItem.quantity);
          console.log('RegistryProduct quantity:', registryProduct.quantity);
          
          // Try to find the product in our loaded data to get title and image
          const productFromData = data.find(p => 
            (p.productId && p.productId === registryProduct.productId) || 
            (p.id && p.id === registryProduct.productId)
          );
          
          return {
            id: cartItem.id,
            price: Number(cartItem.price), // Use the price from cartItem
            quantity: Number(cartItem.quantity || cartItem.purchasedQuantity || 1), // Use cartItem.quantity for purchased quantity
            title: cartItem.title || productFromData?.title || productFromData?.cashFund?.name || `Product ${registryProduct.productId}`,
            image: cartItem.image || productFromData?.images?.edges?.[0]?.node?.url || productFromData?.cashFund?.image?.fileUrl || '/placeholder.svg',
            isCashFund: registryProduct.productTypeId === 2,
            productId: registryProduct.productId,
            amount: Number(registryProduct.amount), // Keep original amount for reference
            registryProductId: registryProduct.id, // Keep registry product ID for reference
            requestedQuantity: Number(registryProduct.quantity) || 1, // Keep the original requested quantity for reference
          };
        });
        console.log('Transformed Items:', transformedItems);
        setCartItems(transformedItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch cart items on component mount and when email changes
  useEffect(() => {
    fetchCartItems();
  }, [registryId]);

  // Fetch cart items whenever sidecart is opened
  useEffect(() => {
    if (sideCartOpen) {
      fetchCartItems();
    }
  }, [sideCartOpen]);

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

  // Add popup functions
  const handleTitleClick = (product) => {
    setSelectedGiftData(product);
    setSelectedImageIndex(0); // Reset selected image for the new item
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedGiftData(null);
    setModalQuantity(1); // Reset quantity when closing modal
  };

  // Calculate still needs for modal
  const getModalStillNeeds = () => {
    if (!selectedGiftData) return 0;
    if (selectedGiftData.status === 'purchased') return 0;
    return Math.max(0, (selectedGiftData.quantity || 0) - (selectedGiftData.purchasedQuantity || 0));
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

  // Fetch cart items when email changes
  useEffect(() => {
    if (guestEmail && registryId) {
      fetchCartItems();
    }
  }, [guestEmail, registryId]);

  // Helper to call /api/cart
  const callCartApi = async (email) => {
    setIsApiLoading(true);
    try {
      const res = await fetch('https://dev-hopsongrace.codup.io/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email, registryId: Number(registryId) }),
      });
      const data = await res.json();
      setIsApiLoading(false);
      if (data.code === 200) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to initialize cart' };
      }
    } catch (e) {
      setIsApiLoading(false);
      return { success: false, error: e.message };
    }
  };

  // Helper to call /api/cart/add-to-cart/{registryId}/{userEmail}
  const callAddToCartApi = async (email, registryProductId, price, productData) => {
    setIsApiLoading(true);
    try {
      const payload = { 
        registryProductId: Number(registryProductId),
        price: Number(price),
        title: productData.title || productData.cashFund?.name || 'Product',
        image: productData.images?.edges?.[0]?.node?.url || productData.cashFund?.image?.fileUrl || '',
        description: productData.description || productData.cashFund?.note || ''
      };
      console.log('Sending to Cart API:', payload);
      
      const res = await fetch(`https://dev-hopsongrace.codup.io/api/cart/add-to-cart/${registryId}/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setIsApiLoading(false);
      if (data.code === 200) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to add to cart' };
      }
    } catch (e) {
      setIsApiLoading(false);
      return { success: false, error: e.message };
    }
  };

  // Helper to call /api/cart/add-to-cart/{registryId}/{userEmail} with quantity
  const callAddToCartApiWithQuantity = async (email, payload) => {
    setIsApiLoading(true);
    try {
      console.log('Sending to Cart API with quantity:', payload);
      
      const res = await fetch(`https://dev-hopsongrace.codup.io/api/cart/add-to-cart/${registryId}/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setIsApiLoading(false);
      if (data.code === 200) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to add to cart' };
      }
    } catch (e) {
      setIsApiLoading(false);
      return { success: false, error: e.message };
    }
  };

  // Modified Add to Cart
  const handleAddToCart = (productId, quantity = 1) => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email) {
      setPendingCartAction({ type: 'add', productId, quantity });
      setShowEmailModal(true);
      return;
    }
    const product = data.find((item) => item.id === productId);
    if (!product) return;

    // Check if product is already in cart
    const isAlreadyInCart = cartItems.some(item => item.productId === (product.productId || product.id));
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
      console.log('CoupleProfile: Stored registryId in localStorage:', product.registryId);
    }
    
    // Use the correct product ID for registryProductId
    const registryProductId = product.productId || product.id;
    const price = product.amount || 0;
    
    // Add quantity to the payload
    const payload = { 
      registryProductId: Number(registryProductId),
      price: Number(price),
      title: product.title || product.cashFund?.name || 'Product',
      image: product.images?.edges?.[0]?.node?.url || product.cashFund?.image?.fileUrl || '',
      description: product.description || product.cashFund?.note || '',
      quantity: Number(quantity)
    };
    
    callAddToCartApiWithQuantity(email, payload).then((result) => {
      if (result.success) {
        // Refresh cart items after successful addition
        fetchCartItems();
        setAlertMessage(`${product.title || 'Item'} (${quantity}) added to cart successfully`);
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
    const email = typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email) {
      setPendingCartAction({ type: 'contribute', productId, amount });
      setShowEmailModal(true);
      return;
    }
    const product = data.find((item) => item.id === productId);
    if (!product) return;

    // Check if product is already in cart
    const isAlreadyInCart = cartItems.some(item => item.productId === (product.productId || product.id));
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
      console.log('CoupleProfile: Stored registryId in localStorage:', product.registryId);
    }
    
    // Use the correct product ID for registryProductId
    const registryProductId = product.productId || product.id;
    callAddToCartApi(email, registryProductId, amount, product).then((result) => {
      if (result.success) {
        // Refresh cart items after successful contribution
        fetchCartItems();
        setAlertMessage(`$${amount} contributed to ${product.title || 'fund'} successfully`);
        setAlertType('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setAlertMessage('Failed to contribute to fund');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    });
  };

  // Modal submit handler
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const email = guestEmail.trim();
    if (!email) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestEmail', email);
    }
    // First call the initial cart API
    await callCartApi(email);
    setShowEmailModal(false);
    if (pendingCartAction) {
      if (pendingCartAction.type === 'add') {
        const product = data.find((item) => item.id === pendingCartAction.productId);
        if (product) {
          // Store registryId in localStorage when first item is added to cart
          if (typeof window !== 'undefined' && product.registryId) {
            localStorage.setItem('registryId', product.registryId);
            console.log('CoupleProfile: Stored registryId in localStorage:', product.registryId);
          }
          const registryProductId = product.productId || product.id;
          const price = product.amount || 0;
          const quantity = pendingCartAction.quantity || 1;
          
          // Add quantity to the payload
          const payload = { 
            registryProductId: Number(registryProductId),
            price: Number(price),
            title: product.title || product.cashFund?.name || 'Product',
            image: product.images?.edges?.[0]?.node?.url || product.cashFund?.image?.fileUrl || '',
            description: product.description || product.cashFund?.note || '',
            quantity: Number(quantity)
          };
          
          await callAddToCartApiWithQuantity(email, payload);
        }
      } else if (pendingCartAction.type === 'contribute') {
        const product = data.find((item) => item.id === pendingCartAction.productId);
        if (product) {
          // Store registryId in localStorage when first item is added to cart
          if (typeof window !== 'undefined' && product.registryId) {
            localStorage.setItem('registryId', product.registryId);
            console.log('CoupleProfile: Stored registryId in localStorage:', product.registryId);
          }
          const registryProductId = product.productId || product.id;
          await callAddToCartApi(email, registryProductId, pendingCartAction.amount, product);
        }
      }
      setPendingCartAction(null);
    }
  };

  // Re-add handleRemoveFromCart for SideCart
  const handleRemoveFromCart = (itemId, updatedItem = null) => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    if (!email || !registryId || !itemId) return;
    
    // Find the cart item to get the registryProductId
    const cartItem = cartItems.find(item => item.id === itemId);
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
      fetch(`https://dev-hopsongrace.codup.io/api/cart/update-quantity/${registryProductId}/${registryId}/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: updatedItem.quantity }),
      })
      .then(response => response.json())
      .then(data => {
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
      .catch(error => {
        console.error('Error updating quantity:', error);
        setAlertMessage('Error updating quantity');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      });
    } else {
      // Remove item from cart
      fetch(`https://dev-hopsongrace.codup.io/api/cart/remove-from-cart/${registryProductId}/${registryId}/${email}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      .then(response => response.json())
      .then(data => {
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
      .catch(error => {
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
    // TODO: Implement clear cart API call
    // For now, just refresh the cart
    fetchCartItems();
  };

  // Filter products
  const filteredData = data
    .filter((product) => {
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
    });

  // Calculate cart totals from API data
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * (Number(item.quantity) || 1),
    0,
  );

  // Get recommended products (unpurchased products from the same couple, excluding cash funds)
  const recommendedProducts = data
    .filter(product => 
      !product.isCashFund && 
      product.status !== 'purchased' && 
      !cartItems.some(cartItem => cartItem.productId === product.productId)
    )
    .slice(0, 4)
    .map(product => ({
      id: product.id,
      title: product.title || product.cashFund?.name || '',
      price: product.amount,
      image: product.images?.edges?.[0]?.node?.url || product.cashFund?.image?.fileUrl || '/placeholder.svg',
      productId: product.productId
    }));

  // Handle adding recommended product to cart
  const handleAddRecommendedProduct = (product) => {
    handleAddToCart(product.id);
  };

  const childCollections = collections.filter(
    (collection) => collection.metafield?.value === 'true',
  );
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
      <CoupleProfileViewHeader onCartClick={() => setSideCartOpen(true)} />
      <div className="text-center pt-[80px] container mx-auto font-sans">
        <img
          src={response?.data[0]?.events[0]?.backgroundImage?.fileUrl || "/assets/Images/couple-profile-bg.png"}
          alt="Couple"
          className="w-full h-[400px] lg:h-[600px] object-cover"
        />
        <div className="flex flex-wrap xl:flex-nowrap justify-center xl:items-end items-center -mb-10 xl:-translate-y-[200px] ">
          <div className="xl:w-4/12 w-full">
            <h1 className="md:text-[75px] my-2 max-w-[340px] leading-[1.25] prata ml-auto xl:text-left text-center xl:mx-0 mx-auto">
              {response?.data[0]?.events[0]?.coupleName}
            </h1>
          </div>
          <div className="xl:w-4/12 w-full">
            {response?.data[0]?.events[0]?.image?.fileUrl ? (
              <img
                src={response.data[0].events[0].image.fileUrl}
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
                {response?.data[0]?.events[0]?.eventDate}
              </p>
              <img
                src="/assets/Images/profile-view-page-bdr.png"
                alt="Couple"
                className="max-w-[370px] h-auto ml-auto"
              />
              <div className="text-right ">
                <p className="text-lg my-1 uppercase">
                  {response?.data[0]?.events[0]?.location}
                </p>
                <p className="text-lg my-1 uppercase">
                  {response?.data[0]?.events[0]?.city},{' '}
                  {response?.data[0]?.events[0]?.province}
                </p>
                <p className="text-lg my-1 uppercase">
                  {response?.data[0]?.events[0]?.weddingTime}
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
          {response?.data[0]?.events[0]?.welcomeMessage}
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

        <div className="filters">
          <div className="filter-item flex gap-x-12 mt-12 justify-center">
            <div
              className="relative"
              onClick={() => {
                const nextCategory =
                  selectedCategory === ''
                    ? childCollections[0]?.title || ''
                    : selectedCategory ===
                      childCollections[childCollections.length - 1]?.title
                    ? ''
                    : childCollections[
                        childCollections.findIndex(
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-12">
          {filteredData.map((product, index) => (
            console.log('product', product),
            <CoupleProductCard
              key={product.id}
              name={product.title || product.cashFund?.name || ''}
              image={
                product.images?.edges[0]?.node?.url ||
                product.cashFund?.image?.fileUrl ||
                ''
              }
              price={product.amount}
              description={product.description || product.cashFund?.note || ''}
              quantity={product.quantity}
              isGroupGift={product.isGroupPayment}
              isCashFund={product.isCashFund}
              status={product.status}
              contributedAmount={Number(product.collectedAmount) || 0}
              maxContribution={Number(product.amount) || 0}
              purchasedQuantity={Number(product.purchasedQuantity) || 0}
              isAnyAmount={product.cashFund?.isAnyAmount || false}
              onAddToCart={() => handleAddToCart(product.id)}
              onContribute={(amount) => handleContribute(product.id, amount)}
              onTitleClick={() => handleTitleClick(product)}
            />
          ))}
        </div>
      </div>
      <div className="container pt-12 md:flex-nowrap flex-wrap mx-auto flex lg:gap-8 gap-2 items-stretch flex-row-reverse">
        <div className="py-10 px-6 md:py-12 md:px-[6rem] lg:px-[8rem] bg-[#446184] relative flex items-center justify-center flex-col  lg:w-[65%] w-full max-[768px]:p-10 lg:mt-20 mt-6">
          <h3 className="text-2xl text-white lg:text-5xl 2xl:text-3xl 3xl:w-full prata max-w-[410px] text-center">
            gift any amount
          </h3>
          <img
            src="/assets/Images/white-bdr.png"
            alt="couple"
            className="max-w-[315px] mb-4 mt-4"
          />
          <h5 className="text-white text-xl font-normal">
            CONTRIBUTE TO OUR JOURNEY!
          </h5>
          <p className="text-sm lg:text-xl text-white max-w-[488px] mt-4 mb-4 font-normal text-center">
            Help us create our dream wedding, honeymoon or life experience.
            We're so grateful.
          </p>
          <div>
            <div className="flex justify-center items-center gap-x-6">
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                $100
              </button>
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                $500
              </button>
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                None
              </button>
            </div>
          </div>
        </div>
        <div className="lg:w-[35%] w-full  ">
          {' '}
          <img
            src="/assets/Images/gift.png"
            alt="Image Banner"
            className="max-[1024px]:h-full object-cover object-[80%]"
          />
        </div>
      </div>

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
        onCartChange={handleRemoveFromCart}
        onClearCart={handleClearCart}
        recommendedProducts={recommendedProducts}
        onAddRecommendedProduct={handleAddRecommendedProduct}
      />

      {isPopupOpen && selectedGiftData && (
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
                    selectedGiftData.images?.edges?.[0]?.node?.url ||
                    selectedGiftData.cashFund?.image?.fileUrl ||
                    '/placeholder.svg'
                  }
                  alt={
                    selectedGiftData.title ||
                    selectedGiftData.cashFund?.name ||
                    'Product'
                  }
                  className="w-full h-auto object-cover md:rounded-l-lg"
                />
                {/* Simplified Thumbnail Display - shows current image as a non-interactive thumbnail */}
                <div className="flex gap-2 mt-4 px-4 md:px-0">
                  <div
                    className={`border p-1 w-20 h-20 border-[#3d5a80] border-2`}
                  >
                    <img
                      src={
                        selectedGiftData.images?.edges?.[0]?.node?.url ||
                        selectedGiftData.cashFund?.image?.fileUrl ||
                        '/placeholder.svg'
                      }
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={` p-1 w-20 h-20 border-[#3d5a80] border-2`}>
                    <img
                      src={
                        selectedGiftData.images?.edges?.[0]?.node?.url ||
                        selectedGiftData.cashFund?.image?.fileUrl ||
                        '/placeholder.svg'
                      }
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={` p-1 w-20 h-20 border-[#3d5a80] border-2`}>
                    <img
                      src={
                        selectedGiftData.images?.edges?.[0]?.node?.url ||
                        selectedGiftData.cashFund?.image?.fileUrl ||
                        '/placeholder.svg'
                      }
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                  ${selectedGiftData.amount}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {/* Display Requested/Still Needs */}
                  {/* {!selectedGiftData.isCashFund && !selectedGiftData.isGroupGift && (
                  <div className="flex flex-col items-start border border-gray-300 p-2 rounded text-sm">
                    <div>
                      Requested:{' '}
                      <span className="font-medium">
                          {selectedGiftData.quantity || 'N/A'}
                      </span>
                    </div>
                    <div>
                      Still Needs:{' '}
                      <span className="font-medium">
                          {selectedGiftData.status === 'purchased' 
                            ? 0 
                            : Math.max(0, (selectedGiftData.quantity || 0) - (selectedGiftData.purchasedQuantity || 0))}
                      </span>
                    </div>
                  </div>
                  )} */}

                  {/* Display Cash Fund/Group Gift Progress */}
                  {/* {(selectedGiftData.isCashFund || selectedGiftData.isGroupGift) && (
                    <div className="flex flex-col items-start border border-gray-300 p-2 rounded text-sm">
                      <div>
                        Contributed:{' '}
                        <span className="font-medium">
                          ${(selectedGiftData.collectedAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        Remaining:{' '}
                        <span className="font-medium">
                          ${Math.max(0, (selectedGiftData.amount || 0) - (selectedGiftData.collectedAmount || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )} */}

                  {/* Quantity Selector for Regular Products */}
                  {!selectedGiftData.isCashFund && !selectedGiftData.isGroupGift && selectedGiftData.status !== 'purchased' && (
                    <div className="flex flex-col items-center justify-center mb-4">
                      <button
                        onClick={incrementModalQuantity}
                        disabled={modalQuantity >= getModalStillNeeds()}
                        className="w-8 h-8 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img src="/assets/Images/arrowDown.png" alt="plus" className="w-4 h-4 rotate-180" />
                      </button>
                      
                      <span className="mx-4 text-lg font-medium">{modalQuantity} / {getModalStillNeeds()}</span>
                      <button
                        onClick={decrementModalQuantity}
                        disabled={modalQuantity <= 1}
                        className="w-8 h-8 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img src="/assets/Images/arrowDown.png" alt="minus" className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      if (selectedGiftData.isCashFund || selectedGiftData.isGroupGift) {
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
                        (selectedGiftData.status === 'purchased') ||
                        (selectedGiftData.isCashFund && (selectedGiftData.amount || 0) - (selectedGiftData.collectedAmount || 0) <= 0) ||
                        (selectedGiftData.isGroupGift && (selectedGiftData.amount || 0) - (selectedGiftData.collectedAmount || 0) <= 0)
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'hover:bg-[#2c425e]'
                      }
                    `}
                    disabled={
                      (selectedGiftData.status === 'purchased') ||
                      (selectedGiftData.isCashFund && (selectedGiftData.amount || 0) - (selectedGiftData.collectedAmount || 0) <= 0) ||
                      (selectedGiftData.isGroupGift && (selectedGiftData.amount || 0) - (selectedGiftData.collectedAmount || 0) <= 0)
                    }
                  >
                    {selectedGiftData.status === 'purchased'
                      ? 'PURCHASED'
                      : (selectedGiftData.isCashFund || selectedGiftData.isGroupGift) && (selectedGiftData.amount || 0) - (selectedGiftData.collectedAmount || 0) <= 0
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

                <div className="mb-6">
                  <h2 className="font-medium uppercase text-xs tracking-wider mb-1 text-gray-500">
                    HOW IT WORKS:
                  </h2>
                  <p className="text-gray-700 text-sm">
                    Fill your butter keeper with 1/4" cold water to keep butter
                    soft. Change water every 3-5 days to keep butter fresh.
                  </p>
                </div>

                <div>
                  <h2 className="font-medium uppercase text-xs tracking-wider mb-1 text-gray-500">
                    DETAILS:
                  </h2>
                  <p className="text-gray-700 text-sm">H 4.25" | 4" DIA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-lg w-full max-w-sm relative"
            onSubmit={handleEmailSubmit}
            onClick={e => e.stopPropagation()}
          >
            {/* Close (cross) button */}
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              aria-label="Close"
              onClick={() => setShowEmailModal(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Enter your email to continue</h2>
            <input
              ref={emailInputRef}
              type="email"
              className="border p-2 w-full mb-4"
              placeholder="Guest Email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              disabled={isApiLoading}
            >
              {isApiLoading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        </div>
      )}

      <CoupleFooter />
    </>
  );
}

// export function CoupleProfileViewHeader({onCartClick}) {
//   return (
//     <div className="container mx-auto flex justify-between items-start pt-6 absolute top-0 left-0 right-0">
//       <img
//         src="/assets/Images/couple-header-logo.png"
//         alt="Hamburger"
//         className="w-[150px] xl:-mb-6 mb-0 h-auto -ml-10"
//       />

//       <span className="my-0 cursor-pointer" onClick={onCartClick}>

//           <img
//             src="/assets/Images/cart-icon.png"
//             alt="cart"
//             className="w-7 h-7"
//           />

//       </span>
//     </div>
//   );
// }
