import React, {useState} from 'react';
import {ChevronDownIcon, ChevronRightIcon} from '@heroicons/react/24/outline'; // Ensure this import is correct

const Accordiance = ({
  onChange,
  ContentComponent,
  title,
  icon = true,
  componentClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (onChange) onChange(!isOpen); // Call onChange if provided
  };

  return (
    <div>
      <div className={``}>
        <div
          onClick={toggleOpen}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="font-semibold">{title}</span>
          {icon && isOpen ? (
            <ChevronDownIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </div>
      </div>
      {isOpen && (
        <div className={`p-2 ${componentClass}`}>
          <ContentComponent />
        </div>
      )}
    </div>
  );
};

export default Accordiance;
