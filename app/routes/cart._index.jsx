import {useLoaderData, useNavigate} from '@remix-run/react';
import {json, redirect} from '@remix-run/server-runtime';
// import {request} from 'node_modules/axios/index.cjs';
import React, {useEffect, useState} from 'react';
import ButtonComponent from '~/components/Button';

// export async function loader({context}) {
//   const existingCart = JSON.parse(sessionStorage.getItem('cart')) || [];
//   console.log('🚀 ~ loader ~ existingCart:', existingCart);

//   const cartItems = [
//     {
//       id: 1,
//       name: 'Gift Item',
//       quantity: 2,
//       price: 100.0,
//     },
//     {
//       id: 1,
//       name: 'Group Gift',
//       quantity: 1,
//       price: 100.0,
//     },
//     {
//       id: 1,
//       name: 'Cash Funds',
//       quantity: 1,
//       price: 100.0,
//     },
//   ].map((item) => ({
//     ...item,
//     subTotal: item.price * item.quantity,
//   }));
//   const tax = 10.0;
//   const total =
//     cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + tax;

//   return json({cartItems, tax, total});
// }

export async function action({request, context}) {
  const formData = new URLSearchParams(await request.formData());
  const cartItems = JSON.parse(formData.get('cartItems'));

  context.session.set('cartItems', cartItems);

  return redirect('/cart/message');
}

const Cart = () => {
  // const {cartItems, tax, total} = useLoaderData();

  const [cartItems, setCartItems] = useState([]);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // UseEffect to fetch cart items from sessionStorage
  useEffect(() => {
    const storedCartItems = JSON.parse(sessionStorage.getItem('cart')) || [];

    // Example calculation for tax and total
    const calculatedTax = 10.0;
    const calculatedTotal =
      storedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ) + calculatedTax;

    setCartItems(storedCartItems);
    setTax(calculatedTax);
    setTotal(calculatedTotal);
    console.log('🚀 ~ useEffect ~ storedCartItems:', storedCartItems);
    console.log('🚀 ~ useEffect ~ calculatedTotal:', calculatedTotal);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto p-6 bg-gray-100">
      <div className="flex-1 bg-gray-200 border rounded-lg h-96"></div>

      <div className="flex-1 md:flex-[0.6] space-y-6">
        <form method="post">
          <input
            type="hidden"
            name="cartItems"
            value={JSON.stringify(cartItems)}
          />
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <button className="text-xs text-gray-500 underline hover:text-gray-700">
                      Delete Item
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-sm">Quantity</h4>
                    <p className="font-semibold">{item.quantity}</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-semibold text-sm">Contribution</h4>
                  <p className="font-semibold">{item.price}</p>
                  <h4 className="font-semibold text-sm">Sub Total</h4>
                  <p className="font-semibold">{item.subTotal}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
            <div className="flex justify-between">
              <p className="text-gray-600">Tax</p>
              <p className="font-semibold">{tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">TOTAL</p>
              <p className="font-semibold text-lg">{total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <ButtonComponent text="Finalize Gifts" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cart;
