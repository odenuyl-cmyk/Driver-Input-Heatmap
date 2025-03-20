import React from "react";

const SwangleButton = () => {
  const handleClick = () => {
    alert("SW Angle activated!");
  };

  return (
    <div className="button_section">
      <button onClick={handleClick} style={{ padding: "10px 20px", fontSize: "15px" }}>
        Swangle
      </button>
    </div>
  );
};

export default SwangleButton;