import React, { useRef, useEffect, useState } from 'react';

const RaceLine = () => {
  const canvasRef = useRef(null);
  const [points, setCoordinates] = useState([]);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 450;

  // Fetch JSON Data
  useEffect(() => {
    fetch('../spa_raceline.json')
      .then(response => response.json())
      .then(data => {
        const coordArray = data.map(item => ({
          x: item.x_m,
          y: item.y_m
        }));
        setCoordinates(coordArray);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  // Draw on Canvas when `points` is updated
  useEffect(() => {
    if (points.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH+30;
    canvas.height = CANVAS_HEIGHT+30;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find min & max values for normalization
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));

    // Normalize and Scale Points
    const scaledPoints = points.map(p => ({
      x: ((p.x - xMin) / (xMax - xMin)) * CANVAS_WIDTH + 15,
      y: CANVAS_HEIGHT - ((p.y - yMin) / (yMax - yMin)) * CANVAS_HEIGHT + 15 // Invert y-axis
    }));

    // Draw spline
    ctx.beginPath();
    ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);

    for (let i = 1; i < scaledPoints.length - 1; i++) {
      const midX = (scaledPoints[i].x + scaledPoints[i + 1].x) / 2;
      const midY = (scaledPoints[i].y + scaledPoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(scaledPoints[i].x, scaledPoints[i].y, midX, midY);
    }

    ctx.lineTo(scaledPoints[scaledPoints.length - 1].x, scaledPoints[scaledPoints.length - 1].y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [points]); // Re-run when `points` updates

  return (
    <canvas ref={canvasRef} style={{ backgroundColor: 'white', display: 'flex' }} />
  );
};

export default RaceLine;