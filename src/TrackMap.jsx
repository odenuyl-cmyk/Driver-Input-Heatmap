import React from 'react';
import RaceLine from './RaceLine';
// import './global.css';
import LapDropdown from './LapCompare';

const TrackMap = () => {
  const [count, setCount] = React.useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="track-map">
      {/*<LapDropdown options={["Compare...", "Lap 1", "Lap 2", "Lap 3", "Lap 4", "Lap 5", "Lap 6", "Lap 7", "Lap 8", "Lap 9", "Lap 10"]}/>*/}
      
        <div className="cone-counter" onClick={handleClick}>
          <div className="count-display">{count}</div>
          <button className="cone-button" ><img src="src\icecream cone.png" style={{width:30, height: 30}} alt="Cone button" /></button>
          
          
        </div>
        
      
      <h2>Track Map</h2>
      <div className="map">
        <RaceLine/>
      </div>
    </div>
  );
};

export default TrackMap;