import React from 'react';


{/* need to check how to get in actual laptimes from data files, rn just a dict type thing */}
const LapList = () => { 
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
    </div>
  );
};

export default LapList;