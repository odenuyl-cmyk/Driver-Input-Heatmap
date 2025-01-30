import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

const ThrottlePlot = () => {

  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    // Fetch the JSON data (local or API)
    fetch('../data.json') // Replace with the correct path to your JSON
      .then(response => response.json())
      .then(data => {
        // Transform the data into a coordinate array
        const coordArray = data.map(item => ({
          x: item.t_1,
          y: item.FSM_throttlePos
        }));
        setCoordinates(coordArray);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  const data = {
    labels: coordinates.map((point, index) => index),  // x-axis labels
    datasets: [
      {
        label: 'Throttle',
        data: coordinates.map(point => point.y), // y-axis values
        borderColor: 'black',
        borderWidth: '0.2',
        fill: false,
        tension: 0.1,
        pointRadius: 0
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return <Line data={data} />;
};

export default ThrottlePlot;