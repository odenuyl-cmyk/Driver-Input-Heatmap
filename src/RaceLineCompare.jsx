import React, { useRef, useEffect, useState } from 'react';
import {state} from './state'


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
          x: parseFloat(item.Longitude),
          y: parseFloat(item.Latitude),
          Ax: parseFloat(item.Acc_X),
          Ay: parseFloat(item.Acc_Y),
          Az: parseFloat(item.Acc_Z)
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
          x: parseFloat(item.Longitude),
          y: parseFloat(item.Latitude),
          Ax: parseFloat(item.Acc_X),
          Ay: parseFloat(item.Acc_Y),
          Az: parseFloat(item.Acc_Z)
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

    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));

    const scaleX = canvas.width / 2;
    const scaleY = canvas.height;

    const scaled = points.map(p => ({
      x: xOffset + ((p.x - xMin) / (xMax - xMin)) * 0.9 * scaleX + 0.05 * scaleX,
      y: .5 *(canvas.height - ((p.y - yMin) / (yMax - yMin)) * 0.9 * canvas.height - 0.05 * canvas.height) + canvas.height/4,
      Ax: p.Ax,
      Ay: p.Ay,
      Az: p.Az
    }));

    for (let i = 1; i < scaled.length - 1; i++) {
      const midX = (scaled[i].x + scaled[i + 1].x) / 2;
      const midY = (scaled[i].y + scaled[i + 1].y) / 2;

      ctx.beginPath();
      ctx.moveTo(scaled[i - 1].x, scaled[i - 1].y);
      ctx.quadraticCurveTo(scaled[i].x, scaled[i].y, midX, midY);
      ctx.strokeStyle = `rgb(
        ${(scaled[i].Ax * 100) % 255},
        ${(scaled[i].Ay * 100) % 255},
        ${(scaled[i].Az * 5) % 255}
      )`;
      ctx.lineWidth = 10;
      ctx.stroke();
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