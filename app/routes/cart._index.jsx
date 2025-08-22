import {Link, useFetcher, useLoaderData} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';
import React, {useEffect, useState} from 'react';
import ButtonComponent from '~/components/Button';

export async function loader({context, params}) {
  // Cart is now handled by database, return empty cart
  const cartItems = '[]';
  const cart = [];
  const total = 0;

  return json({cartItems, total});
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const itemId = formData.get('itemId');
    const productData = formData.get('productData');

    // Cart is now handled by database
    let cart = [];

    // Handle delete action
    if (itemId && !productData) {
      console.log('Deleting item:', itemId);
      cart = cart.filter(item => item.id !== Number(itemId));
      return json(
        { success: true, message: 'Item removed from cart' }
      );
    }

    // Handle add to cart action
    if (productData) {
      const product = JSON.parse(productData);
      const amount = parseFloat(formData.get('amount') || product.amount || 0);
      const productTypeId = product.productTypeId || 1;

      // Check for duplicates
      const itemToAddId = productTypeId === 2 ? product.cashFund?.id : product.id;
      const isDuplicate = cart.some(item => item.id === Number(itemToAddId));

      if (isDuplicate) {
        return json({ 
          success: false, 
          error: 'This item is already in your cart' 
        });
      }

      // Add new item
      const newItem = {
        id: Number(itemToAddId),
        title: product.title || product.cashFund?.name || 'Product',
        price: productTypeId === 2 ? amount : Number(product.amount || 0),
        image: product.images?.edges?.[0]?.node?.url || product.cashFund?.image?.fileUrl || '',
        productTypeId: productTypeId,
        registryId: product.registryId,
        quantity: 1
      };

      cart.push(newItem);

      return json(
        {
          success: true,
          message: `${newItem.title} added to cart`,
          cartItems: JSON.stringify(cart)
        }
      );
    }

    return json({ 
      success: false, 
      error: 'Invalid request' 
    });

  } catch (error) {
    console.error('Error in cart action:', error);
    return json({ 
      success: false, 
      error: 'Failed to process cart action' 
    });
  }
}

const Cart = () => {
  const {cartItems, total} = useLoaderData();
  const [items, setItems] = useState(JSON.parse(cartItems));
  const fetcher = useFetcher();

  console.log(items);

  useEffect(() => {
    if (fetcher.data?.success) {
      setItems((prevItems) =>
        prevItems.filter(
          (item) =>
            item.id !== Number(fetcher.submission?.formData.get('itemId')),
        ),
      );
      window.location.reload();
    }
  }, [fetcher.data]);

  const handleDelete = (itemId) => {
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
                      <div className="w-20 h-20 bg-gray-300 rounded-md">
                        <img src={item.cashFund?.image || item.image} alt={item.cashFund?.name || item.title} className="w-full h-full object-cover rounded-md" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{item.title || item.cashFund?.name}</h4>
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
