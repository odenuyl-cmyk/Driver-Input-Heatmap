import React, { useState, useEffect } from 'react';
import './global.css';

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
        src="/steering-wheel-graphic.png" // img

        className="steering-wheel"
        style={{ transform: `rotate(${angle}deg)` }}
      />
    </div>
  );
};

export default SteeringWheel;
