import React, { useState } from "react";

const Card = ({ value, label, selectable = false, onCardSelect }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleSelect = () => {
    if (selectable) {
      const newSelectionState = !isSelected;
      setIsSelected(newSelectionState);
      if (onCardSelect) onCardSelect(newSelectionState);
    }
  };

  return (
    <div
      className={`w-64 h-28 bg-gray-100 border rounded-lg flex flex-col justify-center items-center p-4 
        ${selectable ? "cursor-pointer" : "cursor-default"} 
        ${isSelected ? "border-indigo-500 border-2" : "border-gray-300"}
      `}
      onClick={handleSelect}
    >
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 mt-2">{label}</div>
    </div>
  );
};

export default Card;
