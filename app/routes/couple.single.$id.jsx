import React from 'react';
import { useLoaderData } from '@remix-run/react';

export async function loader({ params, context }) {
  const coupleId = params.id; // Access the dynamic ID
  const token = context?.session?.get('@User')?.accessToken;

  // if (!token) {
  //   throw new Response('Unauthorized', { status: 401 });
  // }

  const res = await context.ClientGet(`registries/by-userId/4`, context);

  // Check if the response contains data
  if (!res.data) {
    throw new Response('Not Found', { status: 404 }); // Handle not found
  }

  return res; // Return the couple data
}

export default function CoupleProfile() {
  const couple = useLoaderData();
  // Convert the couple object to a string for rendering
  const coupleString = JSON.stringify(couple, null, 2);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <pre>{coupleString}</pre> {/* Display the entire response as a string */}
      {/* ... existing code ... */}
    </div>
  );
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <div className="w-52 h-52 rounded-full bg-gray-300 mb-4 flex items-center justify-center">
            {/* Placeholder for couple's image */}
            <span className="text-gray-500">Image Placeholder</span>
          </div>
          <h2 className="text-2xl font-bold">{couple.name}</h2>
          <p className="text-gray-500">#{couple.hashtag}</p>
          <p className="text-gray-600 mt-2">
            {couple.date} | {couple.venue}
            <br />
            {couple.location}
          </p>
          <h3 className="text-lg font-semibold mt-4">Welcome Message</h3>
          <p className="text-gray-600 text-center">{couple.welcomeMessage}</p>
        </div>

        {/* Filter Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Filter Registry Items</h3>
          <div className="flex gap-4 mt-4">
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Category</option>
              <option value="kitchen">Kitchen</option>
              <option value="decor">Decor</option>
              <option value="electronics">Electronics</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Availability</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Price</option>
              <option value="low-to-high">Low to High</option>
              <option value="high-to-low">High to Low</option>
            </select>
          </div>
        </div>

        {/* Registry Items Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Registry Items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {couple.registryItems.map((item) => (
              <div key={item.id} className="bg-gray-200 p-4 rounded-lg">
                <div className="h-32 bg-gray-300 mb-2 flex items-center justify-center">
                  <span className="text-gray-500">Product Image</span>
                </div>
                <h4 className="font-bold">{item.name}</h4>
                <p className="text-gray-600">${item.price}</p>
                <button className="bg-black text-white px-4 py-2 rounded mt-2">
                  Add to Registry
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
