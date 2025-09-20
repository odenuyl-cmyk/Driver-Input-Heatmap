import React, { useState, useEffect } from 'react';
import './global.css';
import LapList from './LapList.jsx';
import ControlHeatmap from './ControlHeatmap.jsx';
import CanvasTest from './RaceLine.jsx';
import Spline from './TrackMap.jsx';
import TrackMap from './TrackMap.jsx';
import SteeringWheel from './SteeringWheel.jsx';
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
      {/* <h1>Driver-Input Heatmap</h1> */}
      <div className="homepage-dashboard-top">
        <TrackMap/>
        <ControlHeatmap/>
      </div>
      
      <div className="homepage-dashboard-bot">
        <LapList/>
      </div>
    </div>
  );
};

export default App;
