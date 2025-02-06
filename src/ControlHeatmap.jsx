import React, { useState, useEffect } from 'react';

import Graph from './Graphs';
import BrakePlot from './BrakePlot'
import ThrottlePlot from './ThrottlePlot';
import SwanglePlot from './SwanglePlot';

const ControlHeatmap = () => {

  return (
    <div className="control-heatmap">
      <h3>Data Graphs</h3>
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