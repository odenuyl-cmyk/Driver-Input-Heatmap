import React from 'react';
import './styles.css';
import LapList from './LapList.jsx';
import ControlHeatmap from './ControlHeatmap.jsx';
import TrackMap from './TrackMap.jsx';

const App = () => {
  return (
    <div className="dashboard">
      <h1>Carnegie Mellon Racing</h1>
      <h2>Driver-input Heatmap</h2>
      <div className="dashboard-sections">
        {/* split up for each section in the dashboard */}
        <LapList />
        <ControlHeatmap />
        <TrackMap />
      </div>
    </div>
  );
};

export default App;
