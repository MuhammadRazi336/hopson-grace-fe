// app/components/SideCart.jsx
import {Link, useFetcher, useNavigate} from '@remix-run/react';
import React, {useEffect, useState, useRef} from 'react';
import Heading from './Heading';
import {formatPrice} from '~/utils/priceFormatter';
import ModalPortal from './ModalPortal';
import {isRegistryGiftCardTitle} from '~/utils/helpers.js';

/** Max units allowed for this cart line (requested cap + still-needs when reliable). */
function getMaxCartQuantity(item) {
  // Cash-fund "The Registry Gift Card" rows often arrive with stillNeeds === 0 because
  // purchasedQuantity vs quantity does not match physical-gift semantics; cap by requested qty.
  if (isRegistryGiftCardTitle(item?.title)) {
    const req = Number(item.requestedQuantity);
    return Number.isFinite(req) && req > 0 ? req : 999;
  }
  const requested = Number(item.requestedQuantity);
  const requestedCap =
    Number.isFinite(requested) && requested > 0 ? requested : 999;

  if (typeof item.stillNeeds === 'number' && item.stillNeeds > 0) {
    return Math.min(item.stillNeeds, requestedCap);
  }
  // stillNeeds 0 / missing / unreliable — do not lock max to current line qty (blocks 2→3 when Requested: 3)
  return requestedCap;
}

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
  hideDeleteButtons = false, // When true, hide X/delete buttons for all items
  showExtrasSection = true, // Controls "add a little something extra" section
  showFooterActions = true, // Controls Continue/Checkout buttons
  hideExtrasHeading = false, // When true, hide "add a little something extra" heading
  allowQuantityEdit = true, // When true, +/- adjust quantity via onCartChange(itemId, { ...item, quantity })
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

  const canEditQuantity =
    allowQuantityEdit && typeof onCartChange === 'function';

  const handleDelete = (itemId) => {
    if (!itemId) return;

    console.log('Attempting to delete item:', itemId);
    // Check if the item exists before attempting to remove
    const itemExists = items.find(
      (item) => String(item.id) === String(itemId),
    );
    if (!itemExists) {
      console.error('Item not found in cart:', itemId);
      return;
    }

    onCartChange?.(itemId);
  };

  const handleQuantityStep = (item, delta) => {
    if (!canEditQuantity || !item?.id) return;
    const current = Number(item.quantity) || 1;
    const max = getMaxCartQuantity(item);
    let next;
    if (delta > 0) {
      next = Math.min(max, current + 1);
      if (next <= current) return;
    } else {
      next = Math.max(1, current - 1);
      if (next >= current) return;
    }
    onCartChange(item.id, {...item, quantity: next});
  };

  const handleClearCart = () => {
    // Only clear if there are items
    if (items.length > 0) {
      console.log('Clearing cart');
      onClearCart();
    }
  };

  // Separate regular items, cash funds, and group payment items (registry gift card = gift row)
  const regularItems = items.filter(
    (item) =>
      (!item?.isCashFund && !item?.isGroupPayment) ||
      (item?.isCashFund && isRegistryGiftCardTitle(item.title)),
  );
  const cartCashFunds = items.filter(
    (item) => item?.isCashFund && !isRegistryGiftCardTitle(item.title),
  );
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
                      className="grid grid-cols-12 gap-4 items-center bg-[#FAF9F6] rounded mb-4 p-8"
                    >
                      <div className="col-span-5 flex gap-4 items-center">
                        {isRegistryGiftCardTitle(item.title) ? (
                          <div className="w-[136px] h-[136px] shrink-0 bg-[#446184] rounded flex items-center justify-center overflow-hidden">
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
                            className="w-[136px] h-[136px] object-cover rounded"
                          />
                        )}
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
                        {canEditQuantity ? (
                          <div className="flex flex-col items-center justify-center gap-0">
                            <button
                              type="button"
                              onClick={() => handleQuantityStep(item, 1)}
                              disabled={
                                (Number(item.quantity) || 1) >=
                                getMaxCartQuantity(item)
                              }
                              className="w-8 h-8 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <img
                                src="/assets/Images/arrowDown.png"
                                alt=""
                                className="w-4 h-4 rotate-180"
                              />
                            </button>
                            <span className="text-[26px] leading-tight min-w-[2ch] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityStep(item, -1)}
                              disabled={(Number(item.quantity) || 1) <= 1}
                              className="w-8 h-8 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                            >
                              <img
                                src="/assets/Images/arrowDown.png"
                                alt=""
                                className="w-4 h-4"
                              />
                            </button>
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            className="w-12 h-10 border border-gray-400 rounded text-center text-[26px]"
                            readOnly
                          />
                        )}
                      </div>
                      <div className="col-span-2 text-center text-[26px]">
                        {formatPrice(item.price)}
                      </div>
                      <div className="col-span-2 text-center text-[26px]">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </div>
                      {!hideDeleteButtons && (
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200"
                          >
                            &times;
                          </button>
                        </div>
                      )}
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
                      {!hideDeleteButtons && (
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200"
                          >
                            &times;
                          </button>
                        </div>
                      )}
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
                      {!hideDeleteButtons && (
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200"
                          >
                            &times;
                          </button>
                        </div>
                      )}
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
                </div>
              </div>

              {showExtrasSection && (
                <>
                  {!hideExtrasHeading && (
                    <div className="pt-10 pb-4">
                      <Heading
                        text="add a little something extra?"
                        classes={
                          'prata text-xl lg:text-[32px] font-normal text-center max-[1024px]:m-0'
                        }
                        image={'/assets/Images/cart-sum-bdr.png'}
                        imageClasses={'max-[1024px]:max-w-[300px]'}
                      />
                    </div>
                  )}

                  {/* Combined Recommended Items Section */}
                  {[...recommendedProducts, ...cashFunds].length > 0 && (
                    <div className="mt-6">
                      <div className="grid grid-cols-4 gap-3">
                        {[...recommendedProducts, ...cashFunds]
                          .slice(0, 4)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="rounded p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                if (item.isCashFund) {
                                  onAddCashFund && onAddCashFund(item);
                                } else {
                                  onAddRecommendedProduct &&
                                    onAddRecommendedProduct(item);
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
                </>
              )}

              {showFooterActions && (
                <div className="flex justify-center gap-x-10 my-16">
                  <button
                    onClick={onClose}
                    className="w-[360px] h-[77px] text-[18px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white border-2 border-black hover:opacity-90 uppercase font-[800] text-black max-[1601px]:w-[200px] text-center"
                  >
                    continue shopping
                  </button>

                  <button
                    onClick={() => {
                      const email =
                        guestEmail ||
                        (typeof window !== 'undefined'
                          ? localStorage.getItem('guestEmail')
                          : '') ||
                        '';
                      const regId =
                        registryId ||
                        (typeof window !== 'undefined'
                          ? localStorage.getItem('registryId')
                          : '') ||
                        '';
                      const params = new URLSearchParams();
                      if (regId) params.set('registryId', String(regId));
                      if (email) params.set('email', email);
                      const query = params.toString();
                      const path = query
                        ? `/cart/message?${query}`
                        : '/cart/message';
                      console.log('SideCart: Navigating to', path);
                      navigate(path);
                    }}
                    className="w-[360px] h-[77px] text-[18px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white max-[1601px]:w-[200px] text-center"
                  >
                    checkout now
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}
