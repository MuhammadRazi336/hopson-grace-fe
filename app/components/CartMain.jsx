import { Link } from '@remix-run/react';

export function CartMain({ layout }) {
  // Static data for cart items
  const cartItems = [
    {
      id: 1,
      title: 'Gift Item',
      quantity: 2,
      price: 100,
      subtotal: 200,
    },
    {
      id: 2,
      title: 'Group Gift',
      contribution: 100,
    },
    {
      id: 3,
      title: 'Cash Funds',
      contribution: 100,
    },
  ];

  const tax = 10;
  const total =
    cartItems.reduce((acc, item) => {
      return acc + (item.subtotal || item.contribution);
    }, 0) + tax;

  return (
    <div className="cart-main">
      <div className="cart-header">
        <h1>Your Cart</h1>
      </div>
      <div className="cart-details">
        <div className="cart-items">
          <ul>
            {cartItems.map((item) => (
              <li key={item.id} className="cart-line">
                <div className="cart-item">
                  <p>{item.title}</p>
                  {item.quantity ? (
                    <>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price.toFixed(2)}</p>
                      <p>Subtotal: ${item.subtotal.toFixed(2)}</p>
                    </>
                  ) : (
                    <p>Contribution: ${item.contribution.toFixed(2)}</p>
                  )}
                  <button className="delete-item">Delete Item</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="cart-summary">
          <h4>Totals</h4>
          <p>Tax: ${tax.toFixed(2)}</p>
          <p>Total: ${total.toFixed(2)}</p>
        </div>
      </div>
      <div className="cart-footer">
        <Link to="/products" className="continue-shopping">
          Continue Shopping
        </Link>
        <button className="finalize-gifts">Finalize Gifts</button>
      </div>
    </div>
  );
}
