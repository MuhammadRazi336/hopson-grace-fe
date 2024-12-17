import React from "react";
import { Select, Option } from "@material-tailwind/react";
import { ChevronDownIcon } from '@heroicons/react/24/outline'; // For Heroicons v2

const CustomSelect = ({ label, options, selected, setSelected }) => {
  return (
    <div className="w-full space-y-1">
      {/* Dynamic Label */}
      {label && <label className="text-sm font-medium text-gray-800">{label}</label>}

      {/* Select Component */}
      <div className="relative">
        <Select
          value={selected?.label || ""}
          onChange={(value) => {
            const selectedOption = options.find((option) => option.label === value);
            console.log(selectedOption,"po")
            setSelected(selectedOption);
          }}
          className="appearance-none px-4 py-5 border border-gray-300 rounded-md w-full text-left flex items-center bg-gray-300"
          menuProps={{
            className:"bg-gray-300 py-5"
          }}
        >
          {/* Render the options */}
          {options.map((option) => (
            <Option
              key={option.value}
              value={option.label}
              className="hover:bg-gray-200 text-sm text-center py-2"
            >
              {option.label}
            </Option>
          ))}
        </Select>

        {/* Chevron Icon */}
        <ChevronDownIcon className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};

export default CustomSelect;
