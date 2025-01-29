import React from 'react';
import './styles.css';
import LapList from './LapList.jsx';
import ControlHeatmap from './ControlHeatmap.jsx';
import CanvasTest from './Canvas.jsx';
import Spline from './TrackMap.jsx';
import TrackMap from './TrackMap.jsx';
import Graph from './Graphs.jsx';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale } from 'chart.js';

const App = () => {
  const coordinates = [
    { x: 1, y: 5 },
    { x: 2, y: 10 },
    { x: 3, y: 15 },
    { x: 4, y: 20 },
    { x: 5, y: 25 },
  ];
  return (
    <div className="dashboard">
      <h1>Carnegie Mellon Racing</h1>
      <h2>Driver-input Heatmap</h2>
      <div className="dashboard-sections">
        {/* split up for each section in the dashboard */}
        {/*<LapList />
        <ControlHeatmap />
        <TrackMap />*/}
        <LapList />
        <TrackMap />
        <ControlHeatmap />
      </div>
    </div>
  );
};

export default App;
