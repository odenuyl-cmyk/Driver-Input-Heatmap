import React, { useRef, useEffect } from 'react';

const CanvasTest = () => {
  const canvasRef = useRef(null);

  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 450;

    // Draw something to confirm visibility
  }, []);

  return( <canvas ref={canvasRef} style={{ border: '1px solid black', backgroundColor: 'lightgray' }} /> );
};

export default CanvasTest;
