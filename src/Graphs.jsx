import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

const Graph = ({ coordinates }) => {
  const data = {
    labels: coordinates.map((point, index) => index),  // x-axis labels
    datasets: [
      {
        label: 'Brake',
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

export default Graph;