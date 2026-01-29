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

  // Draw on Canvas when `points1` or `canvasSize` updates
  useEffect(() => {
    if (points1.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    //canvas.width = parseFloat(canvasSize.width);
    //canvas.height = parseFloat(canvasSize.height);

    ctx.clearRect(0, canvas.height/4, canvas.width/2, canvas.height/2);

    // Find min & max values for normalization
    const xMin = parseFloat(Math.min(...points1.map(p => p.x)));
    const xMax = parseFloat(Math.max(...points1.map(p => p.x)));
    const yMin = parseFloat(Math.min(...points1.map(p => p.y)));
    const yMax = parseFloat(Math.max(...points1.map(p => p.y)));

    // Normalize and Scale Points
    const scaleX = canvas.width / 2;
    const scaleY = canvas.height / 2;

    const scaledPoints1 = points1.map(p => ({
      x: ((p.x - xMin) / (xMax - xMin)) * 0.9 * scaleX + 0.05 * scaleX,
      y: scaleY - ((p.y - yMin) / (yMax - yMin)) * 0.9 * scaleY - 0.05 * scaleY + scaleY/2,
      Ax: p.Ax,
      Ay: p.Ay,
      Az: p.Az
    }));

    // Draw spline
    // ctx.beginPath();
    // ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    
    for (let i = 1; i < scaledPoints1.length - 1; i++) {
      const midX = (scaledPoints1[i].x + scaledPoints1[i + 1].x) / 2;
      const midY = (scaledPoints1[i].y + scaledPoints1[i + 1].y) / 2;
      ctx.beginPath();
      ctx.moveTo(scaledPoints1[i-1].x, scaledPoints1[i-1].y);
      ctx.quadraticCurveTo(scaledPoints1[i].x, scaledPoints1[i].y, midX, midY);
      ctx.strokeStyle = `rgb(
      ${(scaledPoints1[i].Ax)*100 % 255},
      ${(scaledPoints1[i].Ay)*100 % 255},
      ${(scaledPoints1[i].Az)*5 % 255})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      console.log('x: %f y: %f z: %f', points1[i].x, points1[i].y)
    }

    // setInterval(() => console.log(Date.now()), 500);

    //ctx.lineTo(scaledPoints[scaledPoints.length - 1].x, scaledPoints[scaledPoints.length - 1].y);
    //ctx.strokeStyle = `white`;
    //ctx.lineWidth = 10;
    //ctx.stroke();

  }, [points1, canvasSize]);

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

  // Draw on Canvas when `points2` or `canvasSize` updates
  useEffect(() => {
    if (points2.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    //canvas.width = parseFloat(canvasSize.width);
    //canvas.height = parseFloat(canvasSize.height);

    ctx.clearRect(canvas.width/2, canvas.height/4, canvas.width/2, canvas.height/2);

    // Find min & max values for normalization
    const xMin = parseFloat(Math.min(...points2.map(p => p.x)));
    const xMax = parseFloat(Math.max(...points2.map(p => p.x)));
    const yMin = parseFloat(Math.min(...points2.map(p => p.y)));
    const yMax = parseFloat(Math.max(...points2.map(p => p.y)));

    // Normalize and Scale Points
    const scaleX = canvas.width / 2;
    const scaleY = canvas.height / 2;

    const scaledPoints2 = points2.map(p => ({
      x: scaleX + ((p.x - xMin) / (xMax - xMin)) * 0.9 * scaleX + 0.05 * scaleX,
      y: scaleY + scaleY - ((p.y - yMin) / (yMax - yMin)) * 0.9 * scaleY - 0.05 * scaleY - scaleY/2,
      Ax: p.Ax,
      Ay: p.Ay,
      Az: p.Az
    }));

    // Draw spline
    // ctx.beginPath();
    // ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    
    for (let i = 1; i < scaledPoints2.length - 1; i++) {
      const midX = (scaledPoints2[i].x + scaledPoints2[i + 1].x) / 2;
      const midY = (scaledPoints2[i].y + scaledPoints2[i + 1].y) / 2;
      ctx.beginPath();
      ctx.moveTo(scaledPoints2[i-1].x, scaledPoints2[i-1].y);
      ctx.quadraticCurveTo(scaledPoints2[i].x, scaledPoints2[i].y, midX, midY);
      ctx.strokeStyle = `rgb(
      ${(scaledPoints2[i].Ax)*100 % 255},
      ${(scaledPoints2[i].Ay)*100 % 255},
      ${(scaledPoints2[i].Az)*5 % 255})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      console.log('x: %f y: %f z: %f', points2[i].x, points2[i].y)
    }

    // setInterval(() => console.log(Date.now()), 500);

    //ctx.lineTo(scaledPoints[scaledPoints.length - 1].x, scaledPoints[scaledPoints.length - 1].y);
    //ctx.strokeStyle = `white`;
    //ctx.lineWidth = 10;
    //ctx.stroke();

  }, [points2, canvasSize]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default RaceLineCompare;