import React, { useState, useEffect } from 'react';
import BrakePlot from './BrakePlot'
import ThrottlePlot from './ThrottlePlot';
import SwanglePlot from './SwanglePlot';

const ControlHeatmap = () => {

  return (
    <div className="data-graphs">
      <h2>Data Graphs</h2>
      <div className="heatmap">
        <BrakePlot />
      </div>
      <div className="heatmap">
        <ThrottlePlot />
      </div>
      <div className="heatmap">
        <SwanglePlot />
      </div>
    </div>
  );
};

export default ControlHeatmap;