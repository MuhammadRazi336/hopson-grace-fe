// app/components/SideCart.jsx
import {Link, useFetcher, useNavigate} from '@remix-run/react';
import React, {useEffect, useState, useRef} from 'react';
import Heading from './Heading';
import {formatPrice} from '~/utils/priceFormatter';
import ModalPortal from './ModalPortal';

export default function SideCart({
  open,
  onClose,
  cartItems: initialCartItems = '[]',
  total = 0,
  subtotal = 0,
  onCartChange,
  onClearCart,
  recommendedProducts = [], // Add this prop for recommended products
  onAddRecommendedProduct, // Add this prop for handling recommended product clicks
  cashFunds = [], // Add this prop for cash funds
  onAddCashFund, // Add this prop for adding cash funds
  registryId = '', // Current couple's registry (for checkout URL)
  guestEmail = '', // Guest email (for checkout URL)
}) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const [items, setItems] = useState(() => {
    try {
      console.log('Initial cart items:', initialCartItems);
      const parsedItems =
        typeof initialCartItems === 'string'
          ? JSON.parse(initialCartItems)
          : initialCartItems;
      console.log('Parsed initial items:', parsedItems);
      return parsedItems;
    } catch (e) {
      console.error('Error parsing initial cart items:', e);
      return [];
    }
  });

  // Update items when cartItems prop changes
  useEffect(() => {
    try {
      console.log('Cart items prop changed:', initialCartItems);
      const parsedItems =
        typeof initialCartItems === 'string'
          ? JSON.parse(initialCartItems)
          : initialCartItems;
      console.log('New parsed items:', parsedItems);
      setItems(parsedItems);
    } catch (e) {
      console.error('Error parsing cartItems:', e);
    }
  }, [initialCartItems]);

  // Log items state changes
  useEffect(() => {
    console.log('Items state updated:', items);
  }, [items]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  };

  const handleDelete = (itemId) => {
    if (!itemId) return;

    console.log('Attempting to delete item:', itemId);
    // Check if the item exists before attempting to remove
    const itemExists = items.find((item) => item.id === itemId);
    if (!itemExists) {
      console.error('Item not found in cart:', itemId);
      return;
    }

    onCartChange(itemId);
  };

  const handleClearCart = () => {
    // Only clear if there are items
    if (items.length > 0) {
      console.log('Clearing cart');
      onClearCart();
    }
  };

  // Separate regular items, cash funds, and group payment items
  const regularItems = items.filter((item) => !item?.isCashFund && !item?.isGroupPayment);
  const cartCashFunds = items.filter((item) => item?.isCashFund);
  const groupPaymentItems = items.filter((item) => item?.isGroupPayment);

  console.log('Rendering SideCart with:', {
    regularItems,
    cashFunds,
    groupPaymentItems,
    total,
    subtotal,
  });

  return (
    <ModalPortal>
      <style>{`
        .sidecart-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .sidecart-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .sidecart-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .sidecart-scroll::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .sidecart-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
      `}</style>
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 left-0 right-0 bottom-0 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 99999 }}
      >
        {/* Backdrop overlay */}
        <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Side cart panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[65%] bg-white shadow-lg transform transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{willChange: 'transform'}}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex justify-end items-center p-4">
          <button onClick={onClose} className="text-2xl cursor-pointer">
            &times;
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-[48px] text-center font-bold prata pt-5">cart</h2>
          <img
            src="/assets/Images/cart-head-bdr.png"
            alt="Hamburger"
            className="w-[150px] mx-auto -mt-4"
          />
        </div>
        <div className="p-6 space-y-10 overflow-y-auto h-[calc(100%-200px)] sidecart-scroll">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Your cart is empty
            </div>
          ) : (
            <>
              {/* Regular Items */}
              {regularItems.length > 0 && (
                <div>
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase mb-4">
                    <div className="col-span-5 text-center text-[18px] font-bold">Item</div>
                    <div className="col-span-2 text-center text-[18px] font-bold">Qty</div>
                    <div className="col-span-2 text-center text-[18px] font-bold">Price</div>
                    <div className="col-span-2 text-center text-[18px] font-bold">Subtotal</div>
                    <div className="col-span-1"></div>
                  </div>
                  {regularItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center bg-[#FAF9F6] rounded mb-4 py-8 px-4"
                    >
                      <div className="col-span-5 flex gap-4 items-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-[136px] h-[136px] object-cover rounded"
                        />
                        <div>
                          <div className="font-semibold text-[20px] leading-tight">
                            {item.title}
                          </div>
                          <div className='ivyora italic text-[16px] tracking-wider pt-2'>
                            Requested: {item.requestedQuantity}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          className="w-12 h-10 border border-gray-400 rounded text-center text-[26px]"
                          readOnly
                        />
                      </div>
                      <div className="col-span-2 text-center text-[26px]">
                        {formatPrice(item.price)}
                      </div>
                      <div className="col-span-2 text-center text-[26px]">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cash Funds */}
              {cartCashFunds.length > 0 && (
                <div>
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase mb-4">
                    <div className="col-span-5 text-center text-[18px] font-bold">Cash/Travel Funds</div>
                    <div className="col-span-2 text-center"></div>
                    <div className="col-span-2 text-center text-[18px] font-bold">Amount</div>
                    <div className="col-span-2 text-center"></div>
                    <div className="col-span-1"></div>
                  </div>
                  {cartCashFunds.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center bg-[#FAF9F6] rounded mb-4 py-8 px-4"
                    >
                      <div className="col-span-5 flex gap-4 items-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded"
                        />
                        <div>
                          <div className="font-bold text-lg leading-tight">
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center"></div>
                      <div className="col-span-2 text-center text-[26px]">
                        {formatPrice(item.price)}
                      </div>
                      <div className="col-span-2 text-center text-[26px]"></div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Group Payment Items */}
              {groupPaymentItems.length > 0 && (
                <div>
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase mb-4">
                    <div className="col-span-5 text-center text-[18px] font-bold">Group Gift</div>
                    <div className="col-span-2 text-center"></div>
                    <div className="col-span-2 text-center text-[18px] font-bold">Contribution</div>
                    <div className="col-span-2 text-center"></div>
                    <div className="col-span-1"></div>
                  </div>
                  {groupPaymentItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center bg-[#FAF9F6] rounded mb-4 py-8 px-4"
                    >
                      <div className="col-span-5 flex gap-4 items-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded"
                        />
                        <div>
                          <div className="font-bold text-lg leading-tight">
                            {item.title}
                          </div>
                          <div className='ivyora italic text-[16px] tracking-wider pt-2'>
                            ${item.amount}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center"></div>
                      <div className="col-span-2 text-center text-[26px]">
                        {formatPrice(item.price)}
                      </div>
                      <div className="col-span-2 text-center text-lg"></div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart Summary */}
              <div className="flex justify-end mt-8">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold tracking-wide text-[18px] uppercase">
                      Subtotal
                    </span>
                    <span className="text-[26px] font-medium">
                      $
                      {typeof subtotal === 'number' && !isNaN(subtotal)
                        ? subtotal.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <img
                    src="/assets/Images/cart-sum-bdr.png"
                    alt="Border"
                    className="w-auto mx-auto mt-4"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-[36px] uppercase tracking-wide">
                      Total
                    </span>
                    <span className="font-bold text-[36px]">
                      $
                      {typeof total === 'number' && !isNaN(total)
                        ? total.toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='pt-10 pb-4'>
                <Heading
                  text="add a little something extra?"
                  classes={
                    'prata text-xl lg:text-[32px] font-normal text-center max-[1024px]:m-0'
                  }
                  image={'/assets/Images/cart-sum-bdr.png'}
                  imageClasses={'max-[1024px]:max-w-[300px]'}
                />
              </div>

              {/* Combined Recommended Items Section */}
              {[...recommendedProducts, ...cashFunds].length > 0 && (
                <div className="mt-6">
                  <div className="grid grid-cols-4 gap-3">
                    {[...recommendedProducts, ...cashFunds].slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="rounded p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          if (item.isCashFund) {
                            onAddCashFund && onAddCashFund(item);
                          } else {
                            onAddRecommendedProduct && onAddRecommendedProduct(item);
                          }
                        }}
                      >
                        <div className="aspect-square mb-2">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.title}
                            className="w-[230px] h-[230px] object-cover rounded"
                          />
                        </div>
                        <div className="text-[16px] font-semibold leading-tight mb-1">
                          {item.title}
                        </div>
                        <div className="text-[18px] font-semibold text-gray-600">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-x-10 my-16">
                <button
                  onClick={onClose}
                  className="w-[360px] h-[77px] text-[18px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white border-2 border-black hover:opacity-90 uppercase font-[800] text-black max-[1601px]:w-[200px] text-center"
                >
                  continue shopping
                </button>

                <button
                  onClick={() => {
                    const email = guestEmail || (typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '') || '';
                    const regId = registryId || (typeof window !== 'undefined' ? localStorage.getItem('registryId') : '') || '';
                    const params = new URLSearchParams();
                    if (regId) params.set('registryId', String(regId));
                    if (email) params.set('email', email);
                    const query = params.toString();
                    const path = query ? `/cart/message?${query}` : '/cart/message';
                    console.log('SideCart: Navigating to', path);
                    navigate(path);
                  }}
                  className="w-[360px] h-[77px] text-[18px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white max-[1601px]:w-[200px] text-center"
                >
                  checkout now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}
