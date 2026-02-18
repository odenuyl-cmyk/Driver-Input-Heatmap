import React, { useState, useEffect } from 'react';

const SteeringWheel = ({ data }) => {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (data.length > 0) {
      const latestAngle = data[data.length - 1].FSM_steeringWheelAngle / 1000; // convert to degrees
      setAngle(latestAngle);
    }
  }, [data]);

  return (
    <div className="steering-wheel-section justify-center">
      <img
        src="/imgs/steering-wheel-graphic.png"
        className="steering-wheel"
        style={{ transform: `rotate(${angle}deg)` }}
      />

      {/* TODO: needs to add to this so that it takes in real time data */}
      <div className="steering-wheel-angle-display">Angle Display Placeholder</div>
    </div>
  );
};

export default SteeringWheel;
