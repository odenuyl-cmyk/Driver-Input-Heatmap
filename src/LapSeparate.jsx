import React, { useState, useEffect } from 'react';

const LapTracker = () => {

    const [coordinates, setCoordinates] = useState([]);
  
    useEffect(() => {
      // Fetch the JSON data (local or API)
      fetch('../data.json') // Replace with the correct path to your JSON
        .then(response => response.json())
        .then(data => {
          // Transform the data into a coordinate array
          const coordArray = data.map(item => ({
            x: item.t_1,
            y: item.FSM_throttlePos
          }));
          setCoordinates(coordArray);
        })
        .catch(error => console.error('Error fetching the data:', error));
    }, []);
};