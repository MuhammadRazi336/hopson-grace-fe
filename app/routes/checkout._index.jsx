// import React from 'react';

export default function Checkout() {
  return (
    <div className="max-w-xl mx-auto p-5 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-center text-2xl font-bold">Checkout</h1>
      <p className="text-center">Lorem Ipsum</p>
      <p className="text-center">
        Free delivery to the couple, with gifts held until after the event for a
        seamless and stress-free celebration.
      </p>

      <div className="billing-details">
        <h2 className="text-center text-xl font-semibold">Billing Details</h2>
        <form className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center w-full">
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="firstName" className="block mb-1 font-bold">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="lastName" className="block mb-1 font-bold">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="address" className="block mb-1 font-bold">
                Address *
              </label>
              <input
                type="text"
                id="address"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="city" className="block mb-1 font-bold">
                City *
              </label>
              <input
                type="text"
                id="city"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="province" className="block mb-1 font-bold">
                Province *
              </label>
              <input
                type="text"
                id="province"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="cardNumber" className="block mb-1 font-bold">
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="expiry" className="block mb-1 font-bold">
                Expiry *
              </label>
              <input
                type="text"
                id="expiry"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="cvv" className="block mb-1 font-bold">
                CVV *
              </label>
              <input
                type="text"
                id="cvv"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="form-group mb-4 w-6/12 px-2">
              <label htmlFor="email" className="block mb-1 font-bold">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="form-group mb-4 flex items-center">
            <input type="checkbox" id="subscribe" className="mr-2" />
            <label htmlFor="subscribe" className="inline">
              Subscribe to Email and receive a HG Coupon Code!
            </label>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
          >
            Checkout
          </button>
        </form>
      </div>
    </div>
  );
}
