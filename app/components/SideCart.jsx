// app/components/SideCart.jsx
export default function SideCart({open, onClose, cartItems = []}) {
  const relatedItems = [
    {
      name: 'Marble Butter Keeper',
      price: 80,
      image: '/assets/Images/product-image.png',
    },
    {
      name: 'Belle-V Icecream Scoop',
      price: 95,
      image: '/assets/Images/product-image.png',
    },
    {
      name: 'Coluna Fruit Bowl',
      price: 125,
      size: 'Medium',
      image: '/assets/Images/product-image.png',
    },
    {
      name: 'Staub Cast Iron Q4',
      price: 430,
      image: '/assets/Images/product-image.png',
    },
  ];
  const items =
    cartItems.length > 0
      ? cartItems
      : [
          {
            id: 1,
            name: 'COLUNA FRUIT BOWL',
            size: 'Medium',
            image: '/assets/Images/product-image.png',
            requested: 1,
            quantity: 1,
            price: 200,
            groupGift: false,
          },
          {
            id: 2,
            name: 'THE FOUR SEASONS MARRAKECH',
            image: '/assets/Images/product-image.png',
            price: 5000,
            groupGift: true,
            contribution: 200,
          },
        ];

  const regularItems = items.filter((item) => !item.groupGift);
  const groupGifts = items.filter((item) => item.groupGift);

  // Calculate totals
  const subtotal =
    regularItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    groupGifts.reduce((sum, item) => sum + (item.contribution || 0), 0);
  const taxes = +(subtotal * 0.13).toFixed(2);
  const total = +(subtotal + taxes).toFixed(2);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[65%] bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{willChange: 'transform'}}
    >
      <button
        onClick={onClose}
        className="text-2xl cursor-pointer absolute top-4 right-6"
      >
        &times;
      </button>
      <div className=" p-4">
        <h2 className="text-4xl text-center font-bold prata pt-5"> cart</h2>
        <img
          src="/assets/Images/cart-head-bdr.png"
          alt="Hamburger"
          className="w-[150px] mx-auto -mt-4"
        />
      </div>
      <div className="p-6 space-y-10 overflow-y-auto h-[calc(100%-80px)]">
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
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <div className="font-bold text-lg leading-tight">
                      {item.name}
                    </div>
                    {item.size && (
                      <div className="text-sm text-gray-600">
                        Size, {item.size}
                      </div>
                    )}
                    {item.requested !== undefined && (
                      <div className="italic text-gray-500 text-xs mt-1">
                        Requested: {item.requested}
                      </div>
                    )}
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
                  ${item.price * item.quantity}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Group Gifts */}
        {groupGifts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2 mt-8">
              <span className="font-bold w-9/12 text-lg uppercase tracking-wide">
                Group Gift
              </span>
              <span className="font-bold w-3/12 text-lg uppercase tracking-wide">
                Contribution
              </span>
            </div>
            {groupGifts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#FAF9F6] rounded mb-4 py-8 px-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-lg leading-tight">
                      {item.name}
                    </div>
                    {item.price && (
                      <div className="text-sm text-gray-600">${item.price}</div>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold">${item.contribution}</div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Group Gifts */}
        {groupGifts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2 mt-8">
              <span className="font-bold w-9/12 text-lg uppercase tracking-wide">
                CASH / TRAVEL FUNDS
              </span>
              <span className="font-bold w-3/12 text-lg uppercase tracking-wide">
                AMOUNT
              </span>
            </div>
            {groupGifts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#FAF9F6] rounded mb-4 py-8 px-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-lg leading-tight">
                      {item.name}
                    </div>
                    {item.price && (
                      <div className="text-sm text-gray-600">${item.price}</div>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold">${item.contribution}</div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-xl hover:bg-gray-200">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cart Summary */}
        <div className="flex justify-end mt-8">
          <div className="w-full max-w-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold tracking-wide text-sm uppercase ">
                Subtotal
              </span>
              <span className="text-lg font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold tracking-wide text-sm uppercase ">
                Taxes <span className="font-normal">(13% HST)</span>
              </span>
              <span className="text-lg font-medium">${taxes.toFixed(2)}</span>
            </div>
            <img
              src="/assets/Images/cart-sum-bdr.png"
              alt="Hamburger"
              className="w-auto  mx-auto mt-4"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-2xl uppercase tracking-wide">
                Total
              </span>
              <span className="font-bold text-2xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-[8rem]">
          <h2 className="text-3xl text-center font-bold prata pt-5">
            add a little something extra?
          </h2>
          <img
            src="/assets/Images/cart-bottom-bdr.png"
            alt="Hamburger"
            className="w-auto  mx-auto mt-4"
          />

          {/* Related Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {relatedItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white  flex flex-col items-start mb-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className=" object-cover  mb-2"
                />
                <div className=" text-lg mb-1">
                  {item.name}
                </div>
                
                <div className=" text-lg">${item.price}</div>
        
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
