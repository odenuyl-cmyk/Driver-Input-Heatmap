import React from 'react';
import RaceLine from './RaceLine';
import './global.css';
import LapDropdown from './LapCompare';

const TrackMap = () => {
  return (
    <div className="track-map">
      {/*<LapDropdown options={["Compare...", "Lap 1", "Lap 2", "Lap 3", "Lap 4", "Lap 5", "Lap 6", "Lap 7", "Lap 8", "Lap 9", "Lap 10"]}/>*/}
      <h3>Track Map</h3>
      <div className="map">
      <RaceLine/>
      </div>
    </div>
  );
};

export default TrackMap;