import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {state} from './state'
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';
import { type } from '@testing-library/user-event/dist/type';

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

const BrakePlot = () => {

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
    fetch(state.laps[lapCount]) // Replace with the correct path to imported data fileee
      .then(response => response.json())
      .then(data => {
        // NOT CORRECT DATA YET 
        const coordArray = data.map(item => ({
          x: item.t_25,
          y: item.FSM_brakePressureFront
        }));
        setCoordinates(coordArray);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, [lapCount]);

  const data = {
    labels: coordinates.map((point, index) => index),
    datasets: [
      {
        label: 'Brake Pressure (Front)',
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
          text: 'Brake Pressure (PSI)',
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

export default BrakePlot;
