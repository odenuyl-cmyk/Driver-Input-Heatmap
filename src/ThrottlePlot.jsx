import React, { useState, useEffect } from 'react';
import {state} from './state'
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

const ThrottlePlot = () => {

  const [coordinates, setCoordinates] = useState([]);
  const [lapCount, setLapCount] = useState(state.counter - 1);
      useEffect(() => {
        // React to global state changes
        const interval = setInterval(() => {
          if (lapCount !== state.counter - 1) {
            setLapCount(state.counter - 1);
          }
        }, 100);
    
        return () => clearInterval(interval);
      }, [lapCount]);

  useEffect(() => {
    fetch(state.laps[lapCount]) // Replace with the correct path to your JSON
      .then(response => response.json())
      .then(data => {
        // NOT CORRECT DATA YET
        const coordArray = data.map(item => ({
          x: item.Acc_X,
          y: item.Acc_Z
        }));
        setCoordinates(coordArray);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, [lapCount]);

  const data = {
    labels: coordinates.map((point, index) => index),
    datasets: [
      {
        label: 'Throttle',
        data: coordinates.map(point => point.y),
        borderColor: '#AF1328',
        borderWidth: 0.2,
        fill: false,
        tension: 0.1,
        pointRadius: 0
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default ThrottlePlot;
