import React from 'react';

export default function CoupleProfile() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <div className="w-52 h-52 rounded-full bg-gray-300 mb-4 flex items-center justify-center">
            {/* Placeholder for couple's image */}
            <span className="text-gray-500">Image Placeholder</span>
          </div>
          <h2 className="text-2xl font-bold">Couple Name</h2>
          <p className="text-gray-500">#CoupleHashtag</p>
          <p className="text-gray-600 mt-2">
            January 1, 2025 2pm | Whispering Pines Event Centre
            <br />
            Calgary, Alberta, Canada
          </p>
          <h3 className="text-lg font-semibold mt-4">Welcome Message</h3>
          <p className="text-gray-600 text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
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
            {/* Example Product Card */}
            <div className="bg-gray-200 p-4 rounded-lg">
              <div className="h-32 bg-gray-300 mb-2 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <h4 className="font-bold">Product One</h4>
              <p className="text-gray-600">$499.99</p>
              <button className="bg-black text-white px-4 py-2 rounded mt-2">
                Add to Registry
              </button>
            </div>
            {/* Repeat for more products */}
            <div className="bg-gray-200 p-4 rounded-lg">
              <div className="h-32 bg-gray-300 mb-2 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <h4 className="font-bold">Product Two</h4>
              <p className="text-gray-600">$49.99</p>
              <button className="bg-black text-white px-4 py-2 rounded mt-2">
                Add to Registry
              </button>
            </div>
            {/* Add more product cards as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
