// app/components/SideCart.jsx
import { Link, useFetcher } from '@remix-run/react';
import React, {useEffect, useState} from 'react';

export default function SideCart({open, onClose, cartItems: initialCartItems = '[]', total = 0, subtotal = 0, onCartChange, onClearCart}) {
  const fetcher = useFetcher();
  const [items, setItems] = useState(() => {
    try {
      console.log('Initial cart items:', initialCartItems);
      const parsedItems = typeof initialCartItems === 'string' 
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
      const parsedItems = typeof initialCartItems === 'string'
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
    const itemExists = items.find(item => item.id === itemId);
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
    subtotal
  });

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[65%] bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{willChange: 'transform'}}
    >
      <div className="flex justify-between items-center p-4">
        <button
          onClick={handleClearCart}
          className={`text-sm ${items.length > 0 ? 'text-red-600 hover:text-red-800' : 'text-gray-400 cursor-not-allowed'}`}
          disabled={items.length === 0}
        >
          Clear Cart
        </button>
        <button
          onClick={onClose}
          className="text-2xl cursor-pointer"
        >
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
      <div className="p-6 space-y-10 overflow-y-auto h-[calc(100%-80px)]">
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
                        value={item.quantity || 1}
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
                    <div className="col-span-2 flex justify-center">
                    </div>
                    <div className="col-span-2 text-center text-lg">
                      ${item.price}
                    </div>
                    <div className="col-span-2 text-center text-lg">
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

            {/* Cart Summary */}
            <div className="flex justify-end mt-8">
              <div className="w-full max-w-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold tracking-wide text-sm uppercase">
                    Subtotal
                  </span>
                  <span className="text-lg font-medium">
                    ${typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal.toFixed(2) : '0.00'}
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
                  <span className="font-bold text-2xl">${typeof total === 'number' && !isNaN(total) ? total.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-x-10 mt-12">
              <button 
                onClick={onClose}
                className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white border-2 border-black hover:opacity-90 uppercase font-[800] text-black w-[225px] max-[1601px]:w-[200px] text-center"
              >
                continue shopping
              </button>

              <Link to="/cart/message">
                <button 
                  className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[225px] max-[1601px]:w-[200px] text-center"
                >
                  checkout now
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
