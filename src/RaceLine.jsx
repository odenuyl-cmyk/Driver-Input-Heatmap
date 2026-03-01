import React, { useRef, useEffect, useState } from 'react';
import {state} from './state'

const normalize = (value, min, max) => {
  const range = max - min;
  if (range === 0) return 0;
  return (value - min) / range;
};

//for (let i = 0; i < state.mode; i++) {
  const RaceLine = () => {
    const [lapCount, setLapCount] = useState(state.counter - 1);
    const [dataVersion, setDataVersion] = useState(state.version);
    useEffect(() => {
      // React to global state changes
      const interval = setInterval(() => {
        if (lapCount !== state.counter - 1) {
          setLapCount(state.counter - 1);
        }
        if (dataVersion !== state.version) {
          setDataVersion(state.version);
        }
      }, 100);

      return () => clearInterval(interval);
    }, [lapCount, dataVersion]);


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
      // const laps = ["../lap_1.json", "../lap_2.json", "../lap_3.json", "../lap_4.json", "../lap_5.json"];
      const lapPath = state.laps[lapCount];
      if (!lapPath) {
        setCoordinates([]);
        return;
      }
      fetch(lapPath)
        .then(response => response.json())
        .then(data => {
          const coordArray = data.map(item => ({
            x: parseFloat(item.Movella_Latitude),
            y: parseFloat(item.Movella_Longitude),
            Ax: parseFloat(item.Movella_AccX),
            Ay: parseFloat(item.Movella_AccY),
            Az: parseFloat(item.Movella_AccZ),
            Brake: parseFloat(item.FSM_brakePressureFront),
            Throttle: parseFloat(item.FSM_throttlePos)
          }));
          setCoordinates(coordArray);
        })
        .catch(error => console.error('Error fetching the data:', error));
    }, [lapCount, dataVersion]);

    // Draw on Canvas when `points` or `canvasSize` updates
    useEffect(() => {
      if (points.length === 0 || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = parseFloat(canvasSize.width);
      canvas.height = parseFloat(canvasSize.height);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Find min & max values for normalization
      let xMin = Infinity;
      let xMax = -Infinity;
      let yMin = Infinity;
      let yMax = -Infinity;
      let brakeMin = Infinity;
      let brakeMax = -Infinity;
      let throttleMin = Infinity;
      let throttleMax = -Infinity;

      for (const p of points) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
        if (p.Brake < brakeMin) brakeMin = p.Brake;
        if (p.Brake > brakeMax) brakeMax = p.Brake;
        if (p.Throttle < throttleMin) throttleMin = p.Throttle;
        if (p.Throttle > throttleMax) throttleMax = p.Throttle;
      }

      //const brakeMin = parseFloat(Math.min(...points.map(p => p.Brake)));
      //const brakeMax = parseFloat(Math.max(...points.map(p => p.Brake)));

      // Normalize and Scale Points
      const scaledPoints = points.map(p => ({
        x: ((p.x - xMin) / (xMax - xMin)) * parseFloat(0.9*canvas.width) + parseFloat(0.05*canvas.width),
        y: canvas.height - ((p.y - yMin) / (yMax - yMin)) * parseFloat(0.9*canvas.height) - parseFloat(0.05*canvas.height), // Invert y-axis
        Ax: p.Ax,
        Ay: p.Ay,
        Az: p.Az,
        Brake: normalize(p.Brake, brakeMin, brakeMax),
        Throttle: normalize(p.Throttle, throttleMin, throttleMax)
      }));

      // Draw spline
      // ctx.beginPath();
      // ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      
      for (let i = 1; i < scaledPoints.length - 1; i++) {
        const midX = (scaledPoints[i].x + scaledPoints[i + 1].x) / 2;
        const midY = (scaledPoints[i].y + scaledPoints[i + 1].y) / 2;
        ctx.beginPath();
        if (isNaN(midX) || isNaN(midY)) continue;
        ctx.moveTo(scaledPoints[i-1].x, scaledPoints[i-1].y);
        ctx.quadraticCurveTo(scaledPoints[i].x, scaledPoints[i].y, midX, midY);
        ctx.strokeStyle = `rgb(
        ${Math.floor(scaledPoints[i].Brake * 255)},
        ${Math.floor(scaledPoints[i].Throttle * 255)},
        ${0})`;
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
//}

export default RaceLine;
