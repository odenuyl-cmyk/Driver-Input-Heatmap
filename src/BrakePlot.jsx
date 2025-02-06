import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

const BrakePlot = () => {

  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    fetch('../data.json') // Replace with the correct path to imported data fileee
      .then(response => response.json())
      .then(data => {
        const coordArray = data.map(item => ({
          x: item.t_1,
          y: item.FSM_brakePressureFront
        }));
        setCoordinates(coordArray);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  const data = {
    labels: coordinates.map((point, index) => index),
    datasets: [
      {
        label: 'Brake Pressure',
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

export default BrakePlot;
