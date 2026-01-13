import React, {useState} from 'react';
import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Input as Inp,
} from '@material-tailwind/react';
import {DayPicker} from 'react-day-picker';
import moment from 'moment';
import 'react-day-picker/style.css';

const DatePicker = ({
  selectedDate,
  onDateChange,
  label = 'Date',
  labelHidden = true,
  dateFormat = 'MM/DD/YYYY',
  inputProps = {},
  className = '',
  buttonLabels = {clear: 'Clear', apply: 'Apply'},
  disabledDates = [],
  placeholder = 'Select a date',
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleApply = () => {
    setShowCalendar(false);
  };

  const handleClear = () => {
    onDateChange(null); // Clear the date
  };

  return (
    <div className={`date-picker ${className}`}>
      <Popover
        open={showCalendar}
        placement="top-start"
        handler={() => setShowCalendar(!showCalendar)}
      >
        {/* Label */}
        <label  className={`block text-sm font-medium mb-1 ${labelHidden ? 'hidden' : ''}`}>{label}</label>
        <PopoverHandler>
          <div className="relative">
            <Inp
              value={selectedDate ? moment(selectedDate).format(dateFormat) : ''}
              readOnly
              {...inputProps}
              className={`cursor-pointer text-center pr-12 ${inputProps.className || ''}`}
              onClick={() => setShowCalendar(true)}
              placeholder={inputProps.placeholder || placeholder}
            />
            {/* Dropdown icon positioned on the right */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </PopoverHandler>

        {/* Calendar Popover Content */}
        <PopoverContent className="p-4 w-80 border rounded-lg shadow-md datepick">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onDateChange(date)}
            showOutsideDays
            disabled={disabledDates}
            fromYear={2025}
            toYear={2045}
            styles={{
              caption: {textAlign: 'center', marginBottom: '1rem'},
              nav: {display: 'flex', justifyContent: 'space-between'},
              navButton: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              },
              table: {width: '100%', borderCollapse: 'collapse'},
              headCell: {fontWeight: 'bold', textAlign: 'center'},
              day: {
                height: '2.5rem',
                width: '2.5rem',
                textAlign: 'center',
                lineHeight: '2.5rem',
                borderRadius: '50%',
                cursor: 'pointer',
              },
              daySelected: {
                backgroundColor: '#446184',
                color: '#fff',
                borderRadius: "100%"
              },
              dayToday: {backgroundColor: '#446184'},
              dayOutside: {color: '#9CA3AF', opacity: 0.5},
            }}
            className="rounded-md "
            captionLayout="dropdown"
            fixedWeeks
          />
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              onClick={handleClear}
            >
              {buttonLabels.clear}
            </button>
            <button
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              onClick={handleApply}
            >
              {buttonLabels.apply}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
