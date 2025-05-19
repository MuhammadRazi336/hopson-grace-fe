import React from 'react';
import {Select, Option} from '@material-tailwind/react';
import {ChevronDownIcon} from '@heroicons/react/24/outline'; // For Heroicons v2

const CustomSelect = ({label, options, selected, setSelected}) => {
  return (
    <div className="w-full">
      {/* Dynamic Label */}
      {label && (
        <label className="text-sm font-medium text-gray-800">{label}</label>
      )}

      {/* Select Component */}
      <div className="relative">
        <Select
          value={selected?.label || ''}
          onChange={(value) => {
            const selectedOption = options.find(
              (option) => option.label === value,
            );
            setSelected(selectedOption);
          }}
          className="appearance-none rounded-none border-[#B9B4AE] border-2 bg-white text-black h-[inital] p-5"
          menuProps={{
            className: 'bg-gray-300 py-5',
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
      </div>
    </div>
  );
};

export default CustomSelect;
