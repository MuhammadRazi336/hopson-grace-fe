import React from 'react';

const Registries = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Registries</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b text-center">ID</th>
              <th className="py-2 px-4 border-b text-center">Registry Name</th>
              <th className="py-2 px-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="py-2 px-4 border-b">1</td>
              <td className="py-2 px-4 border-b">Registry One</td>
              <td className="py-2 px-4 border-b">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  View
                </button>
              </td>
            </tr>
            <tr className="text-center">
              <td className="py-2 px-4 border-b">2</td>
              <td className="py-2 px-4 border-b">Registry Two</td>
              <td className="py-2 px-4 border-b">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  View
                </button>
              </td>
            </tr>
            <tr className="text-center">
              <td className="py-2 px-4 border-b">3</td>
              <td className="py-2 px-4 border-b">Registry Three</td>
              <td className="py-2 px-4 border-b">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  View
                </button>
              </td>
            </tr>
            <tr className="text-center">
              <td className="py-2 px-4 border-b">4</td>
              <td className="py-2 px-4 border-b">Registry Four</td>
              <td className="py-2 px-4 border-b">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Registries;
