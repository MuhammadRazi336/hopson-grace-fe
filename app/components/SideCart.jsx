// app/components/SideCart.jsx
import {Link, useFetcher, useNavigate} from '@remix-run/react';
import React, {useEffect, useState} from 'react';
import Heading from './Heading';

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
}) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
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

  // Separate regular items and cash funds
  const regularItems = items.filter((item) => !item?.isCashFund);
  const cashFunds = items.filter((item) => item?.isCashFund);

  console.log('Rendering SideCart with:', {
    regularItems,
    cashFunds,
    total,
    subtotal,
  });

  return (
    <>
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
        className={`fixed top-0 right-0 h-full w-[65%] bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{willChange: 'transform'}}
      >
        <div className="flex justify-end items-center p-4">
          <button onClick={onClose} className="text-2xl cursor-pointer">
            &times;
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-4xl text-center font-bold prata pt-5">cart</h2>
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
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Subtotal</div>
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
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <div className="font-bold text-lg leading-tight">
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          className="w-12 h-10 border border-gray-400 rounded text-center text-lg"
                          readOnly
                        />
                      </div>
                      <div className="col-span-2 text-center text-lg">
                        ${item.price}
                      </div>
                      <div className="col-span-2 text-center text-lg">
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
              {cashFunds.length > 0 && (
                <div>
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase mb-4">
                    <div className="col-span-5">Cash Fund</div>
                    <div className="col-span-2 text-center"></div>
                    <div className="col-span-2 text-center">Contribution</div>
                    <div className="col-span-2 text-center"></div>
                    <div className="col-span-1"></div>
                  </div>
                  {cashFunds.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center bg-[#FAF9F6] rounded mb-4 py-8 px-4"
                    >
                      <div className="col-span-5 flex gap-4 items-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <div className="font-bold text-lg leading-tight">
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center"></div>
                      <div className="col-span-2 text-center text-lg">
                        ${item.price}
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
                    <span className="font-bold tracking-wide text-sm uppercase">
                      Subtotal
                    </span>
                    <span className="text-lg font-medium">
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
                    <span className="font-bold text-2xl uppercase tracking-wide">
                      Total
                    </span>
                    <span className="font-bold text-2xl">
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
                    'prata text-xl lg:text-3xl font-normal text-center max-[1024px]:m-0'
                  }
                  image={'/assets/Images/cart-sum-bdr.png'}
                  imageClasses={'max-[1024px]:max-w-[300px]'}
                />
              </div>

              {/* Recommended Products Section */}
              {recommendedProducts.length > 0 && (
                <div className="mt-6">
                  <div className="grid grid-cols-4 gap-3">
                    {recommendedProducts.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        className="rounded p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => onAddRecommendedProduct && onAddRecommendedProduct(product)}
                      >
                        <div className="aspect-square mb-2">
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="text-xs font-semibold leading-tight mb-1">
                          {product.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          ${product.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-x-10 mt-12">
                <button
                  onClick={onClose}
                  className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white border-2 border-black hover:opacity-90 uppercase font-[800] text-black w-[225px] max-[1601px]:w-[200px] text-center"
                >
                  continue shopping
                </button>

                <button
                  onClick={() => {
                    console.log(
                      'SideCart: Button clicked, navigating to /cart/message',
                    );
                    navigate('/cart/message');
                  }}
                  className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[225px] max-[1601px]:w-[200px] text-center"
                >
                  checkout now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
