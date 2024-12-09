import React, { useState } from "react";
import { Popover, PopoverHandler, PopoverContent ,Input as Inp} from "@material-tailwind/react";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import "react-day-picker/style.css";

const DatePicker = ({
                      selectedDate,
                      onDateChange,
                      label = "Date",
                      dateFormat = "MM/DD/YYYY",
                      inputProps = {},
                      className = "",
                      buttonLabels = { clear: "Clear", apply: "Apply" },
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
      <Popover open={showCalendar} placement="top-start" handler={() => setShowCalendar(!showCalendar)}>
        {/* Label */}
        <label className="block text-sm font-medium mb-1">{label}</label>
        <PopoverHandler>
          <Inp
            value={selectedDate ? moment(selectedDate).format(dateFormat) : ""}
            readOnly
            {...inputProps}
            className={`cursor-pointer ${inputProps.className || ""}`}
            onClick={() => setShowCalendar(true)}
            placeholder="Select a date"
            icon={<i className="fas fa-calendar-alt" />}
          />
        </PopoverHandler>

        {/* Calendar Popover Content */}
        <PopoverContent className="p-4 w-80 border rounded-lg shadow-md">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onDateChange(date)}
            showOutsideDays
            styles={{
              caption: { textAlign: "center", marginBottom: "1rem" },
              nav: { display: "flex", justifyContent: "space-between" },
              navButton: { background: "none", border: "none", cursor: "pointer" },
              table: { width: "100%", borderCollapse: "collapse" },
              headCell: { fontWeight: "bold", textAlign: "center" },
              day: {
                height: "2.5rem",
                width: "2.5rem",
                textAlign: "center",
                lineHeight: "2.5rem",
                borderRadius: "50%",
                cursor: "pointer",
              },
              daySelected: {
                backgroundColor: "#374151",
                color: "#fff",
              },
              dayToday: { backgroundColor: "#E5E7EB" },
              dayOutside: { color: "#9CA3AF", opacity: 0.5 },
            }}
            className="rounded-md"
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
