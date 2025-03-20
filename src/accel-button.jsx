import React from "react";

const AccelButton = () => {
  const handleClick = () => {
    alert("Accel activated!");
  };

  return (
    <div className="button_section">
      <button onClick={handleClick} style={{ padding: "10px 20px", fontSize: "15px" }}>
        Accel
      </button>
    </div>
  );
};

export default AccelButton;