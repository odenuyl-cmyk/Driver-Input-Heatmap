import React from 'react';
import Graph from './Graphs';

const ControlHeatmap = () => {
  const coordinates = [
    { x: 1, y: 5 },
    { x: 2, y: 10 },
    { x: 3, y: 15 },
    { x: 4, y: 20 },
    { x: 5, y: 25 },
  ];

  console.log("Rendering ControlHeatmap with coordinates:", coordinates);

  return (
    <div className="control-heatmap">
      <h2>Brake & Throttle Map</h2>
      <div className="heatmap">
        <Graph coordinates={coordinates} />
      </div>
      <div className="heatmap">
        <Graph coordinates={coordinates} />
      </div>
      <div className="heatmap">
        <Graph coordinates={coordinates} />
      </div>
    </div>
  );
};

export default ControlHeatmap;