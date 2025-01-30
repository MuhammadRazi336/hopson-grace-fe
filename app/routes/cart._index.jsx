import {Link, useFetcher, useLoaderData} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';
import React, {useEffect, useState} from 'react';
import ButtonComponent from '~/components/Button';

export async function loader({context, params}) {
  const cartItems = context?.session?.get('cart') || '[]';
  const cart = JSON.parse(cartItems);
  const tax = 10;
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0) + tax;

  return json(
    {cartItems, tax, total},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

export async function action({request, context}) {
  const formData = await request.formData();
  const itemId = formData.get('itemId');

  let cart = JSON.parse(context?.session?.get('cart') || '[]');

  cart = cart.filter((item) => item.id !== Number(itemId));

  context.session.set('cart', JSON.stringify(cart));

  return json(
    {success: true},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

const Cart = () => {
  const {cartItems, tax, total} = useLoaderData();
  const [items, setItems] = useState(JSON.parse(cartItems));
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.success) {
      setItems((prevItems) =>
        prevItems.filter(
          (item) => item.id !== fetcher.submission?.formData.get('itemId'),
        ),
      );
      window.location.reload();
    }
  }, [fetcher.data]);

  const handleDelete = (itemId) => {
    const formData = new FormData();
    formData.append('itemId', itemId);

    fetcher.submit({itemId}, {method: 'post', action: '/cart'});
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto p-6 bg-gray-100">
      {items.length === 0 ? (
        <div className="text-center flex-1">
          <p className="text-xl font-semibold text-gray-600">
            No products found for this cart.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 bg-gray-200 border rounded-lg h-96"></div>

          <div className="flex-1 md:flex-[0.6] space-y-6">
            <form method="post">
              <input
                type="hidden"
                name="cartItems"
                value={JSON.stringify(items)}
              />
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <button
                          type="button"
                          className="text-xs delete-cart-item text-gray-500 underline hover:text-gray-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete Item
                        </button>
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
                  <p className="font-semibold">{tax}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">TOTAL</p>
                  <p className="font-semibold text-lg">{total}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <Link to="/cart/message">
                  <ButtonComponent text="Finalize Gifts" />
                </Link>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
