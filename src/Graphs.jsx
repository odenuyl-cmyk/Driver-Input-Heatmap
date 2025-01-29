import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

const Graph = ({ coordinates }) => {
  const data = {
    labels: coordinates.map((point, index) => index + 1),  // x-axis labels
    datasets: [
      {
        label: 'Graph Data',
        data: coordinates.map(point => point.y), // y-axis values
        borderColor: 'black',
        fill: false,
        tension: 0.1,
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