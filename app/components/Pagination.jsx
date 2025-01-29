import React from 'react';

const Pagination = () => {
  return (
    <>
      <div className="my-7">
        <hr className="border-gray-500" />
        <div className="flex justify-between mt-3">
          <p className="text-gray-500">&larr; &nbsp; Previous</p>
          <ul className="flex">
            <li className="mx-4">
              <a href="#">1</a>
            </li>
          </ul>
          <p className="text-gray-500">Next &nbsp; &rarr;</p>
        </div>
      </div>
    </>
  );
};
export default Pagination;
