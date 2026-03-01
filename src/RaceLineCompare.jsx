import React, { useRef, useEffect, useState } from 'react';
import {state} from './state'

const normalize = (value, min, max) => {
  const range = max - min;
  if (range === 0) return 0;
  return (value - min) / range;
};

const RaceLineCompare = () => {
  const [lapCount1, setLapCount1] = useState(state.lapCompare1);
  useEffect(() => {
    // React to global state changes
    const interval = setInterval(() => {
      if (lapCount1 !== state.lapCompare1) {
        setLapCount1(state.lapCompare1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [lapCount1]);

  const [lapCount2, setLapCount2] = useState(state.lapCompare2);
  useEffect(() => {
    // React to global state changes
    const interval = setInterval(() => {
      if (lapCount2 !== state.lapCompare2) {
        setLapCount2(state.lapCompare2);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [lapCount2]);

  const canvasRef = useRef(null);
  const [points1, setCoordinates1] = useState([]);
  const [points2, setCoordinates2] = useState([]);
  
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
    fetch(state.laps[lapCount1 - 1])
      .then(response => response.json())
      .then(data => {
        const coordArray1 = data.map(item => ({
          x: parseFloat(item.Movella_Latitude),
          y: parseFloat(item.Movella_Longitude),
          Ax: parseFloat(item.Movella_AccX),
          Ay: parseFloat(item.Movella_AccY),
          Az: parseFloat(item.Movella_AccZ),
          Brake: parseFloat(item.FSM_brakePressureFront),
          Throttle: parseFloat(item.FSM_throttlePos)
        }));
        setCoordinates1(coordArray1);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, [lapCount1]);

  useEffect(() => {
    // const laps = ["../lap_1.json", "../lap_2.json", "../lap_3.json", "../lap_4.json", "../lap_5.json"];
    fetch(state.laps[lapCount2 - 1])
      .then(response => response.json())
      .then(data => {
        const coordArray2 = data.map(item => ({
          x: parseFloat(item.Movella_Latitude),
          y: parseFloat(item.Movella_Longitude),
          Ax: parseFloat(item.Movella_AccX),
          Ay: parseFloat(item.Movella_AccY),
          Az: parseFloat(item.Movella_AccZ),
          Brake: parseFloat(item.FSM_brakePressureFront),
          Throttle: parseFloat(item.FSM_throttlePos)
        }));
        setCoordinates2(coordArray2);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, [lapCount2]);

  useEffect(() => {
  if (!canvasRef.current) return;
  if (!points1.length && !points2.length) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const drawLap = (points, xOffset = 0) => {
    if (!points.length) return;

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

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    const scaled = points.map(p => ({
      x: xOffset + ((p.x - xMin) / xRange) * 0.9 * (canvas.width / 2) + 0.05 * (canvas.width / 2),
      y: 0.5*(canvas.height - ((p.y - yMin) / yRange) * 0.9 * canvas.height -0.05 * canvas.height) + canvas.height/4,
      Ax: p.Ax,
      Ay: p.Ay,
      Az: p.Az,
      Brake: normalize(p.Brake, brakeMin, brakeMax),
      Throttle: normalize(p.Throttle, throttleMin, throttleMax)
    }));

    for (let i = 1; i < scaled.length - 1; i++) {
        const midX = (scaled[i].x + scaled[i + 1].x) / 2;
        const midY = (scaled[i].y + scaled[i + 1].y) / 2;
        ctx.beginPath();
        if (isNaN(midX) || isNaN(midY)) continue;
        ctx.moveTo(scaled[i-1].x, scaled[i-1].y);
        ctx.quadraticCurveTo(scaled[i].x, scaled[i].y, midX, midY);
        ctx.strokeStyle = `rgb(
        ${Math.floor(scaled[i].Brake * 255)},
        ${Math.floor(scaled[i].Throttle * 255)},
        ${0})`;
        ctx.lineWidth = 10;
        ctx.stroke();

        console.log('x: %f y: %f z: %f', points[i].x, points[i].y)
      }
  };

  drawLap(points1, 0);
  drawLap(points2, canvas.width / 2);

}, [points1, points2, canvasSize]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default RaceLineCompare;