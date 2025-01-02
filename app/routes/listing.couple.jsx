import React from 'react';
// import { Link } from 'react-router-dom';

const couples = [
  { id: 1, name: 'John and Jane Doe' },
  { id: 2, name: 'Mike and Mary Smith' },
  { id: 3, name: 'Tom and Lucy Brown' },
  { id: 4, name: 'Chris and Anna Johnson' },
];

const ListingCouple = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Couples Listing</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-center">Couple Name</th>
            <th className="py-2 px-4 border-b text-center">Image</th>
            <th className="py-2 px-4 border-b text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {couples.map((couple) => (
            <tr key={couple.id}>
              <td className="py-2 px-4 border-b text-center">{couple.name}</td>
              <td className="py-2 px-4 border-b text-center">
                <img src={`path/to/coupleImage.png`} alt="Couple" className="w-16 h-16 mx-auto" />
              </td>
              <td className="py-2 px-4 border-b text-center">
                <a href={`/single/couple`}>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    View Profile
                  </button>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListingCouple;
