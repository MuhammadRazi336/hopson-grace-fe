import {defer, json, useFetcher, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import CoupleProductCard from '~/components/CoupleProductCard';
import { useState, useRef, useEffect } from 'react';
import { CoupleProfileViewHeader } from './couple.test._index';
import SideCart from '~/components/SideCart';
import { CoupleFooter } from '~/components/CoupleFooter';

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

export async function loader({ params, context }) {
  const coupleId = params.id;

  const response = await context.ClientGet(`registries/by-userId/${coupleId}`, context);
  const registryId = response.data[0]?.id;
  if (!response.data) throw new Response('Not Found', { status: 404 });

  const [res, cashRes, shopifyCollections] = await Promise.all([
    context.ClientGet(`registryProducts/${registryId}?type=gift`, context),
    context.ClientGet(`registryProducts/${registryId}?type=cash`, context),
    context.storefront.query(COLLECTION_QUERY),
  ]);

  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`
  );
  const products = await fetchProducts(context.storefront, ids);
  
  let mergedArray = [];
  if (res?.data?.length) {
    mergedArray = res.data.map((item1) => {
      const product = products?.nodes?.find(
        (item2) => item2?.id === `gid://shopify/Product/${item1.productId}`
      );
      let status = item1.isPurchased ? 'purchased' : item1.productTypeId === 2 ? 'cashFund' : 'addToCart';
      return {
        status,
        isCashFund: item1.productTypeId === 2 ? true : item1.isCashFund ?? false,
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

  // Get cart data from session
  let cartItems = [];
  try {
    console.log('Session in loader:', context.session);
    const cartData = context.session.get('cart');
    console.log('Cart data from session:', cartData);
    cartItems = cartData ? JSON.parse(cartData) : [];
    console.log('Parsed cart items:', cartItems);
  } catch (error) {
    console.error('Error accessing cart data in loader:', error);
    cartItems = [];
  }

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  return defer({
    data: [...mergedArray, ...cashFundProducts],
    cashfundData: cashFundProducts,
    response,
    registryId,
    collections: shopifyCollections.collections.nodes,
    cart: {
      items: cartItems,
      total: cartTotal
    }
  });
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const clearCart = formData.get('clearCart');
    const itemId = formData.get('itemId');
    const productData = formData.get('productData');

    console.log('Action received:', { clearCart, itemId, productData });

    // Ensure we have access to session
    if (!context.session) {
      console.error('Session not available');
      return json({ 
        success: false, 
        error: 'Session not available' 
      }, { status: 500 });
    }

    // Get the current cart
    const cartItems = JSON.parse(context.session.get('cart') || '[]');
    console.log('Current cart items:', cartItems);

    // Handle cart operations
    if (clearCart === 'true') {
      context.session.set('cart', '[]');
      console.log('Clearing cart');
      return json(
        { success: true, action: 'clear' },
        {
          headers: {
            'Set-Cookie': await context.session.commit()
          }
        }
      );
    }

    if (itemId && !productData) {
      console.log('Removing item from cart:', itemId);
      const updatedCart = cartItems.filter(item => item.id !== Number(itemId));
      context.session.set('cart', JSON.stringify(updatedCart));
      console.log('Updated cart after removal:', updatedCart);
      return json(
        { success: true, action: 'remove', itemId },
        {
          headers: {
            'Set-Cookie': await context.session.commit()
          }
        }
      );
    }

    if (!productData) {
      console.error('No product data provided');
      return json({ success: false, error: 'Product data is required' });
    }

    const product = JSON.parse(productData);
    console.log('Parsed product data:', product);

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
      addItemId = product.cashFund?.id || product.productId || product.cashFundId || product.id;
      if (!addItemId || isNaN(Number(addItemId))) {
        console.error('Cash fund contribution missing ID:', product);
        return json({ success: false, error: 'Cash fund contribution missing ID' });
      }
      addItemId = Number(addItemId);
    } else {
      addItemId = getNumericId(product.id);
    }

    console.log('Processed item ID:', { addItemId, originalId: product.id });

    if (!addItemId) {
      console.error('Invalid product ID:', product.id);
      return json({ success: false, error: 'Invalid product ID' });
    }

    // Check for duplicates before adding to cart
    const isDuplicate = cartItems.some(item => {
      const duplicateCheck = productTypeId === 2 
        ? item.originalId === product.id 
        : item.id === addItemId;
      console.log('Duplicate check:', { 
        itemInCart: item, 
        newItem: { id: addItemId, originalId: product.id },
        isDuplicate: duplicateCheck 
      });
      return duplicateCheck;
    });

    if (isDuplicate) {
      console.log('Duplicate item detected');
      return json({
        success: false,
        error: 'This item is already in your cart'
      }, { status: 400 });
    }

    // Create cart item
    const cartItem = {
      id: addItemId,
      title: product.title || product.cashFund?.name || 'Product',
      price: productTypeId === 2 ? amount : Number(product.amount || 0),
      image: product.images?.edges?.[0]?.node?.url || product.cashFund?.image?.fileUrl || '',
      productTypeId: productTypeId,
      registryId: Number(product.registryId || response?.data[0]?.id),
      quantity: 1,
      originalId: product.id,
      isCashFund: productTypeId === 2 ? true : false
    };

    console.log('New cart item:', cartItem);

    // Update cart in session
    const updatedCart = [...cartItems, cartItem];
    context.session.set('cart', JSON.stringify(updatedCart));
    console.log('Updated cart:', updatedCart);

    return json(
      {
        success: true,
        action: 'add',
        item: cartItem,
        message: `${cartItem.title} added to cart`
      },
      {
        headers: {
          'Set-Cookie': await context.session.commit()
        }
      }
    );

  } catch (error) {
    console.error('Error in action:', error);
    return json({ 
      success: false, 
      error: error.message || 'Failed to add item to cart' 
    }, { status: 500 });
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
  const { data, cashfundData, response, registryId, collections, cart } = useLoaderData() || [];
  const fetcher = useFetcher();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [sideCartOpen, setSideCartOpen] = useState(false);

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data) {
      if (!fetcher.data.success) {
        setAlertMessage(fetcher.data.error);
        setAlertType('error');
      } else {
        setAlertMessage(fetcher.data.message || 'Cart updated successfully');
        setAlertType('success');
      }
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  }, [fetcher.data]);

  const onClose = () => setSideCartOpen(false);

  const handleAddToCart = (productId) => {
    const product = data.find((item) => item.id === productId);
    if (!product) return;

    // Ensure registryId is included
    const productWithRegistry = {
      ...product,
      registryId: registryId
    };

    fetcher.submit(
      {
        productData: JSON.stringify(productWithRegistry)
      },
      { method: 'post' }
    );
  };

  const handleRemoveFromCart = (itemId) => {
    fetcher.submit(
      { itemId },
      { method: 'post' }
    );
  };

  const handleClearCart = () => {
    fetcher.submit(
      { clearCart: 'true' },
      { method: 'post' }
    );
  };

  const handleContribute = (productId, amount) => {
    const product = data.find((item) => item.id === productId);
    if (!product) return;

    // Ensure registryId is included
    const productWithRegistry = {
      ...product,
      registryId: registryId,
      amount: amount
    };

    fetcher.submit(
      {
        productData: JSON.stringify(productWithRegistry)
      },
      { method: 'post' }
    );
  };

  // Filter products
  const filteredData = data
  .filter((product) => {
    if (selectedCategory) {
      const collectionTitles = product.collections?.nodes?.map((c) => c.title) || [];
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

  // Calculate cart totals
  const cartTotal = cart.items.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  const childCollections = collections.filter(
    (collection) => collection.metafield?.value === "true"
  );
  return (
    <>
      {showAlert && (
        <div className={`fixed top-4 right-4 ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}>
          <div className="flex items-center">
            {alertType === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
      <CoupleProfileViewHeader onCartClick={() => setSideCartOpen(true)} />
      <div className="text-center pt-[80px] container mx-auto font-sans">
        <img
          src="/assets/Images/couple-profile-bg.png"
          alt="Couple"
          className="w-full h-auto"
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
                <p className="text-lg my-1 uppercase">{response?.data[0]?.events[0]?.location}</p>
                <p className="text-lg my-1 uppercase">{response?.data[0]?.events[0]?.city}, {response?.data[0]?.events[0]?.province}</p>
                <p className="text-lg my-1 uppercase">{response?.data[0]?.events[0]?.weddingTime}</p>
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
            <div className="relative" onClick={() => {
              const nextCategory = selectedCategory === '' ? (childCollections[0]?.title || '') : 
                selectedCategory === childCollections[childCollections.length - 1]?.title ? '' :
                childCollections[childCollections.findIndex(c => c.title === selectedCategory) + 1]?.title || '';
              setSelectedCategory(nextCategory);
            }}>
              <h3 className="text-lg uppercase border-b-2 border-[#446184] cursor-pointer">
                <strong>Categories</strong> {selectedCategory || 'All'}
              </h3>
            </div>

            <div className="relative" onClick={() => {
              const options = ['', 'low-to-high', 'high-to-low'];
              const currentIndex = options.indexOf(priceSort);
              const nextIndex = (currentIndex + 1) % options.length;
              setPriceSort(options[nextIndex]);
            }}>
              <h3 className="text-lg uppercase border-b-2 border-[#446184] cursor-pointer">
                <strong>price</strong> {priceSort === 'low-to-high' ? 'low to high' : 
                                     priceSort === 'high-to-low' ? 'high to low' : 'All'}
              </h3>
            </div>

            <div className="relative" onClick={() => {
              const options = ['', 'in-stock', 'out-of-stock'];
              const currentIndex = options.indexOf(availability);
              const nextIndex = (currentIndex + 1) % options.length;
              setAvailability(options[nextIndex]);
            }}>
              <h3 className="text-lg uppercase border-b-2 border-[#446184] cursor-pointer">
                <strong>status</strong> {availability === 'in-stock' ? 'Available' :
                                      availability === 'out-of-stock' ? 'Purchased' : 'All'}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-12">
          {filteredData.map((product, index) => (
              <CoupleProductCard
                key={product.id}
            name={product.title || product.cashFund?.name || ''}
            image={product.images?.edges[0]?.node?.url || product.cashFund?.image?.fileUrl || ''}
                price={product.amount}
            description={product.description || product.cashFund?.note || ''}
                isGroupGift={product.isGroupPayment}
                isCashFund={product.isCashFund}
                status={product.status}
                contributedAmount={Number(product.collectedAmount) || 0}
                maxContribution={Number(product.amount) || 0}
                onAddToCart={() => handleAddToCart(product.id)}
                onContribute={(amount) => handleContribute(product.id, amount)}
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
        cartItems={cart.items}
        total={cart.total}
        subtotal={cart.total}
        onCartChange={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />


      {/* {isPopupOpen && selectedGiftData && (
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
              <div className="relative py-8 pl-8">
                <img
                  src={selectedGiftData.image || '/placeholder.svg'}
                  alt={selectedGiftData.name}
                  className="w-full h-auto object-cover md:rounded-l-lg"
                />
                <div className="flex gap-2 mt-4 px-4 md:px-0">
                  <div
                    className={`border p-1 w-20 h-20 border-[#3d5a80] border-2`}
                  >
                    <img
                      src={selectedGiftData.image || '/placeholder.svg'}
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={` p-1 w-20 h-20 border-[#3d5a80] border-2`}>
                    <img
                      src={selectedGiftData.image || '/placeholder.svg'}
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={` p-1 w-20 h-20 border-[#3d5a80] border-2`}>
                    <img
                      src={selectedGiftData.image || '/placeholder.svg'}
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col">
                <div className="uppercase text-sm tracking-wider text-gray-700 font-medium">
                  HOPSON GRACE
                </div>
                <h1 className="text-3xl md:text-4xl font-serif mt-2 mb-4">
                  {selectedGiftData.name}
                </h1>
                <div className="text-xl font-medium mb-6">
                  ${selectedGiftData.price}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex flex-col items-start border border-gray-300 p-2 rounded text-sm">
                    <div>
                      Requested:{' '}
                      <span className="font-medium">
                        {selectedGiftData.requested !== undefined
                          ? selectedGiftData.requested
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      Still Needs:{' '}
                      <span className="font-medium">
                        {selectedGiftData.stillNeeds !== undefined
                          ? selectedGiftData.stillNeeds
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`bg-[#3d5a80] text-white py-3 px-6 uppercase text-sm tracking-wider flex-grow rounded transition-colors
                      ${
                        selectedGiftData.stillNeeds === 0 ||
                        selectedGiftData.status === 'gifted'
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'hover:bg-[#2c425e]'
                      }
                    `}
                    disabled={
                      selectedGiftData.stillNeeds === 0 ||
                      selectedGiftData.status === 'gifted'
                    }
                  >
                    {selectedGiftData.stillNeeds === 0 ||
                    selectedGiftData.status === 'gifted'
                      ? selectedGiftData.status === 'gifted'
                        ? 'GIFTED'
                        : 'NOT AVAILABLE'
                      : selectedGiftData.buttonLabel || 'ADD TO CART'}
                  </button>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                  {selectedGiftData.description ||
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
      )} */}


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