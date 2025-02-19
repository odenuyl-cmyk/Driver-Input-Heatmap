import React, { createContext, useState, useEffect } from "react";

export const LiveDataContext = createContext();

export const LiveDataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch("/data.json")
        .then((response) => response.json())
        .then((jsonData) => {
          setLoading(false);
          setData(jsonData[index]);
          setIndex((prevIndex) => (prevIndex + 1) % jsonData.length);
        });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [index]);

  return (
    <LiveDataContext.Provider value={{ data, loading }}>
      {children}
    </LiveDataContext.Provider>
  );
};
