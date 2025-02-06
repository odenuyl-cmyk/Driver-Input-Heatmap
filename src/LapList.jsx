import React, { useState, useEffect } from 'react';
import SteeringWheel from './SteeringWheel';
import './global.css';


{/* need to check how to get in actual laptimes from data files, rn just a dict type thing */}
const LapList = () => { 

  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('../data.json')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const laps = [
    { id: 1, time: '1:30.123' },
    { id: 2, time: '1:29.876' },
    { id: 3, time: '1:28.654' },
    { id: 4, time: '1:27.542 '}
  ];

  return (
    <div className="lap-list">
      <h2>Lap Times</h2>
      <ul>
        {laps.map((lap) => (
          <li key={lap.id}>Lap {lap.id}: {lap.time}</li>
        ))}
      </ul>

      {/* Steering Wheel */}
      <div className="steering-wheel-section">
        <h3>Steering Wheel</h3>
        <SteeringWheel data={data} />
      </div>
    </div>
  );
};

export default LapList;