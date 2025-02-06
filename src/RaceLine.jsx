import React, { useRef, useEffect, useState } from 'react';

const RaceLine = () => {
  const canvasRef = useRef(null);
  const [points, setCoordinates] = useState([]);
  
  // Automatically track container size
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current?.parentElement) {
        setCanvasSize({
          width: canvasRef.current.parentElement.clientWidth,
          height: canvasRef.current.parentElement.clientHeight,
        });
      }
    };

    updateCanvasSize(); // Initial size
    window.addEventListener("resize", updateCanvasSize);
    
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

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

  // Draw on Canvas when `points` or `canvasSize` updates
  useEffect(() => {
    if (points.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find min & max values for normalization
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));

    // Normalize and Scale Points
    const scaledPoints = points.map(p => ({
      x: ((p.x - xMin) / (xMax - xMin)) * canvasSize.width,
      y: canvasSize.height - ((p.y - yMin) / (yMax - yMin)) * canvasSize.height // Invert y-axis
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
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 10;
    ctx.stroke();

  }, [points, canvasSize]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default RaceLine;