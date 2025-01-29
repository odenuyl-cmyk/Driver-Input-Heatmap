import React, { useRef, useEffect } from 'react';

const CanvasTest = () => {
  const canvasRef = useRef(null);

  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 450;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    const points = [
      { x: 50, y: 300 },
      { x: 200, y: 100 },
      { x: 400, y: 250 },
      { x: 600, y: 50 },
      { x: 750, y: 300 }
    ];

    // Draw spline using Bézier curves
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y); // Start at the first point

      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }

      // Ensure the last point is reached
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.stroke();
    // Draw something to confirm visibility
  }, []);

  return( <canvas ref={canvasRef} style={{ border: '1px solid black', backgroundColor: 'lightgray', display: 'block' }} /> );
};

export default CanvasTest;
