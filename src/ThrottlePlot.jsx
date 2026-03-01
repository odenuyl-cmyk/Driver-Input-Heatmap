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
          x: parseFloat(item.t_25),
          y: parseFloat(item.FSM_throttlePos)
        }));
        setCoordinates(coordArray);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, [lapCount]);

  const data = {
    datasets: [
      {
        label: 'Throttle Position',
        data: coordinates,
        borderColor: '#AF1328',
        borderWidth: 1.0,
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
        type: 'linear',
        title: {
          display: true,
          text: 'Time (seconds?)',
          color: 'white',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Throttle Position',
          color: 'white',
          font: {
            size: 12,
          },
        },
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
