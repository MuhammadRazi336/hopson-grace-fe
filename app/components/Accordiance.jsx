import React, {useState} from 'react';
import {ChevronRightIcon} from '@heroicons/react/24/outline'; // Ensure this import is correct
import {Link} from '@remix-run/react';

const Accordiance = ({
  onChange,
  ContentComponent,
  title,
  icon = true,
  componentClass,
  link,
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
          {icon && (
            <Link to={link || '#'}>
              <ChevronRightIcon className="w-5 h-5 hover:text-blue-500" />
            </Link>
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
