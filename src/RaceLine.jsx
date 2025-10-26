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
    fetch("../lap_3.json")
      .then(response => response.json())
      .then(data => {
        const coordArray = data.map(item => ({
          x: parseFloat(item.Longitude),
          y: parseFloat(item.Latitude),
          Ax: parseFloat(item.Acc_X),
          Ay: parseFloat(item.Acc_Y),
          Az: parseFloat(item.Acc_Z)
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
    canvas.width = parseFloat(canvasSize.width);
    canvas.height = parseFloat(canvasSize.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find min & max values for normalization
    const xMin = parseFloat(Math.min(...points.map(p => p.x)));
    const xMax = parseFloat(Math.max(...points.map(p => p.x)));
    const yMin = parseFloat(Math.min(...points.map(p => p.y)));
    const yMax = parseFloat(Math.max(...points.map(p => p.y)));

    // Normalize and Scale Points
    const scaledPoints = points.map(p => ({
      x: ((p.x - xMin) / (xMax - xMin)) * parseFloat(0.9*canvas.width) + parseFloat(0.05*canvas.width),
      y: canvas.height - ((p.y - yMin) / (yMax - yMin)) * parseFloat(0.9*canvas.height) - parseFloat(0.05*canvas.height), // Invert y-axis
      Ax: p.Ax,
      Ay: p.Ay,
      Az: p.Az
    }));

    // Draw spline
    // ctx.beginPath();
    // ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    
    for (let i = 1; i < scaledPoints.length - 1; i++) {
      const midX = (scaledPoints[i].x + scaledPoints[i + 1].x) / 2;
      const midY = (scaledPoints[i].y + scaledPoints[i + 1].y) / 2;
      ctx.beginPath();
      ctx.moveTo(scaledPoints[i-1].x, scaledPoints[i-1].y);
      ctx.quadraticCurveTo(scaledPoints[i].x, scaledPoints[i].y, midX, midY);
      ctx.strokeStyle = `rgb(
       ${(scaledPoints[i].Ax)*100 % 255},
       ${(scaledPoints[i].Ay)*100 % 255},
       ${(scaledPoints[i].Az)*5 % 255})`;
      ctx.lineWidth = 10;
      ctx.stroke();

      console.log('x: %f y: %f z: %f', points[i].x, points[i].y)
    }

    // setInterval(() => console.log(Date.now()), 500);

    //ctx.lineTo(scaledPoints[scaledPoints.length - 1].x, scaledPoints[scaledPoints.length - 1].y);
    //ctx.strokeStyle = `white`;
    //ctx.lineWidth = 10;
    //ctx.stroke();

  }, [points, canvasSize]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default RaceLine;