import React, { useState, useEffect } from 'react';
import LapList from './LapList.jsx';
import ControlHeatmap from './ControlHeatmap.jsx';
import TrackMap from './TrackMap.jsx';
import SwanglePlot from './SwanglePlot.jsx';
import Graph from './Graphs.jsx';

const LapTracker = () => {
  const [data, setData] = useState([]);
  const [laps, setLaps] = useState([]);
  const [currentLap, setCurrentLap] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetch('../data.json')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleStart = () => {
    setStartTime(Date.now());
    setIsRecording(true);
  };

  const handleStop = () => {
    if (startTime) {
      const lapTime = (Date.now() - startTime) / 1000;
      setLaps([...laps, { id: laps.length + 1, time: lapTime }]);
      setIsRecording(false);
    }
  };

  const handleLapSelect = (lapId) => {
    setCurrentLap(laps.find(lap => lap.id === lapId));
  };

  return (
    <div className="full-dashboard">
      <h1>Carnegie Mellon Racing</h1>
      <h3>Driver-Input Heatmap</h3>
      <div className="homepage-dashboard-top">
        <LapList laps={laps} onLapSelect={handleLapSelect} />
        <TrackMap />
        <ControlHeatmap data={data} currentLap={currentLap} />
        <SwanglePlot data={data} currentLap={currentLap} />
        <Graph data={data} currentLap={currentLap} />
      </div>
      <div className="lap-controls">
        <button onClick={handleStart} disabled={isRecording}>Start Lap</button>
        <button onClick={handleStop} disabled={!isRecording}>Stop Lap</button>
      </div>
    </div>
  );
};

export default LapTracker;