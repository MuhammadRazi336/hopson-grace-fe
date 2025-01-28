import {useLoaderData, useNavigate, useParams} from '@remix-run/react';
import {json, redirect} from '@remix-run/server-runtime';
import React, {useEffect, useState} from 'react';
import ButtonComponent from '~/components/Button';

export async function loader({context, params}) {
  const cartItems = context?.session?.get('cart');
  // const cartIdFromParams = params.cartId;

  // if (!cartItems) {
  //   throw new Response('Cart is empty', {status: 404});
  // }

  const cart = JSON.parse(cartItems);

  // const matchingCart = cart.find((item) => item.cartId === cartIdFromParams);

  // if (!matchingCart) {
  //   throw new Response('Cart not found', {status: 404});
  // }
  const tax = 10;
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0) + tax;
  return {cartItems, tax, total};
}

export async function action({request, context}) {
  return redirect('/cart/message');
}

const Cart = () => {
  const {cartId} = useParams();
  const {cartItems, tax, total} = useLoaderData();

  const items = Array.isArray(JSON.parse(cartItems))
    ? JSON.parse(cartItems)
    : [];

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
                        <button className="text-xs text-gray-500 underline hover:text-gray-700">
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
                <ButtonComponent text="Finalize Gifts" type="submit" />
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
