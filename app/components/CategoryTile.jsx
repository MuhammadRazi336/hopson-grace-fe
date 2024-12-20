// Tile.js
import React from "react";

const Tile = ({ title, onClick }) => {
  return (
    <div
      className="bg-gray-200 flex items-center justify-center h-36 rounded-lg shadow cursor-pointer hover:bg-gray-300"
      onClick={onClick}
    >
      <span className="font-medium text-gray-800">{title}</span>
    </div>
  );
};

export default Tile;
