import React from "react";

const BrakeButton = () => {
  const handleClick = () => {
    alert("Brake activated!");
  };

  return (
    <div className="button_section">
      <button onClick={handleClick} style={{ padding: "10px 20px", fontSize: "15px" }}>
        Brake
      </button>
    </div>
  );
};

export default BrakeButton;