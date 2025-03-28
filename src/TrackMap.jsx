import React from 'react';
import RaceLine from './RaceLine';
import LapDropdown from './LapCompare';

const TrackMap = () => {
  const [count, setCount] = React.useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  const resetClick = () => {
    setCount(0);
  };

  return (
    <div className="track-map">
      {/*<LapDropdown options={["Compare...", "Lap 1", "Lap 2", "Lap 3", "Lap 4", "Lap 5", "Lap 6", "Lap 7", "Lap 8", "Lap 9", "Lap 10"]}/>*/}

      <h2>Track Map</h2>

      <div className="cone-counter">
        <div className="count-display">{count}</div>
        <button className="cone-reset" onClick={resetClick}><img src="src\assets\reset-icon.png" style={{width:20, height: 20}} alt="Reset Cone Button"/></button>
        <button className="cone-button" onClick={handleClick}><img src="src\assets\icecream-cone.png" style={{width:30, height: 30}} alt="Increment Cone Button"/></button>
      </div>

      <div className="map">
        <RaceLine/>
      </div>
    </div>
  );
};

export default TrackMap;