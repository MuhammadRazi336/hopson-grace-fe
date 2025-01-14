import React from 'react';

const FilterBy = ({text, className}) => {
  return (
    <>
      <div>
        <p className="text-gray-950 font-bold">Filter by</p>
        <div
          className={`${className} border border-black rounded-md flex justify-between px-6 py-4 mt-0.5`}
        >
          <p className="text-gray-950">{text}</p>
          <p className="text-gray-950">&gt;</p>
        </div>
      </div>
    </>
  );
};

export default FilterBy;
