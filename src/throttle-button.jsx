import React from "react";

const ThrottleButton = () => {
  const handleClick = () => {
    alert("Throttle activated!");
  };

  return (
    <div className="button_section">
      <button onClick={handleClick} style={{ padding: "10px 20px", fontSize: "15px" }}>
        Throttle
      </button>
    </div>
  );
};

export default ThrottleButton;