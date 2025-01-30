import React, { useState } from "react";

function LapDropdown({ options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Compare...");

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false); // Close dropdown
    if (onSelect) onSelect(option);
  };

  return (
    <div className = "dropdown">
    <div className="absolute text-left">
      {/* Button */}
      <button
        className="px-6 py-3 option"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected} ▼
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48">
          {options.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default LapDropdown;
