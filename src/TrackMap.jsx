import React from 'react';
import RaceLine from './RaceLine';

const TrackMap = () => {
  return (
    <div className="track-map">
      <h2>Track Map</h2>
      <div className="map">
      <RaceLine />
      </div>
    </div>
  );
};

export default TrackMap;