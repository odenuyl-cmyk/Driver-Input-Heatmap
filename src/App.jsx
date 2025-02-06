import React, { useState, useEffect } from 'react';
import './global.css';
import LapList from './LapList.jsx';
import ControlHeatmap from './ControlHeatmap.jsx';
import CanvasTest from './RaceLine.jsx';
import Spline from './TrackMap.jsx';
import TrackMap from './TrackMap.jsx';
import SteeringWheel from './SteeringWheel.jsx';
import Graph from './Graphs.jsx';
import { Line } from 'react-chartjs-2';
import Header from './Header.jsx';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale } from 'chart.js';

const App = () => {
  const [data, setData] = useState([]);

  // this fetches the data from the json file that we uploaded
  useEffect(() => {
    fetch('../data.json')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  
  return (
    <div className="full-dashboard">
      <Header/>
      <div className="homepage-dashboard">
        <TrackMap />
        <ControlHeatmap />
        <LapList />
      </div>
    </div>
  );
};

export default App;
