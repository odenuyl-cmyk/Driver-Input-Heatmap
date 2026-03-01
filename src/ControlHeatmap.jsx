import React, { useState, useEffect } from 'react';
import {state} from './state'
// for the graphs
import BrakePlot from './BrakePlot'
import ThrottlePlot from './ThrottlePlot';
import SwanglePlot from './SwanglePlot';
// following are for the variable buttons
import BrakeButton from './brake-button.jsx';
import ThrottleButton from './throttle-button.jsx';
import AccelButton from './accel-button.jsx';
import SwangleButton from './swangle-button.jsx';

const ControlHeatmap = () => {
  return (
    <div className="data-graphs">
      <h2>Data Graphs</h2>

      {/* note: no actions linked yet, graphs don't get toggled on/off with buttons yet */}
      {/* <div className="buttons-container"> New div to hold all the buttons */}
        {/* <BrakeButton/> */}
        {/* <ThrottleButton/> */}
        {/* <AccelButton/> */}
        {/* <SwangleButton/> */}
      {/* </div> */}

      <div className="heatmap">
        <BrakePlot />
      </div>
      <div className="heatmap">
        <ThrottlePlot />
      </div>
      {/* <div className="heatmap"> */}
        {/* <SwanglePlot /> */}
      {/* </div> */}
    </div>
  );
};

export default ControlHeatmap;