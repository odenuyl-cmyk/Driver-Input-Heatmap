import React from 'react';
import RaceLine from './RaceLine';
import RaceLineCompare from './RaceLineCompare';
import LapDropdown from './LapCompare';
import {state} from './state'

const TrackMap = ({mode, setMode}) => {
  const [count, setCount] = React.useState(1);
  const [compareLap1, setCompareLap1] = React.useState(1);
  const [compareLap2, setCompareLap2] = React.useState(1);
  const [dataVersion, setDataVersion] = React.useState(state.version);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (dataVersion !== state.version) {
        setDataVersion(state.version);
        setCount(state.counter);
        setMode(state.mode);
        setCompareLap1(state.lapCompare1 + 1);
        setCompareLap2(state.lapCompare2 + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [dataVersion]);

  const decreaseClick = () => {
    if (count > 1){
      setCount(count - 1);
      state.counter -= 1;
    }
  };

  const increaseClick = () => {
    if (count < (state.laps).length){
      setCount(count + 1);
      state.counter += 1;
    }
  };

  const resetClick = () => {
    if (mode == 1){
      setCount(1);
      state.counter = 1;
    } else if (mode == 2){
      setCompareLap1(1);
      state.lapCompare1 = 1;
      setCompareLap2(1);
      state.lapCompare2 = 1;
    }
  };

  const toggleClick = () => {
    if (mode == 1){
      setMode(2);
      state.mode = 2;
    } else if (mode == 2){
      setMode(1);
      state.mode = 1;
    }
  };

  const decreaseCompare1 = () => {
    if (compareLap1 > 1){
      setCompareLap1(compareLap1 - 1);
      state.lapCompare1 -= 1;
    }
  };

  const increaseCompare1 = () => {
    if (compareLap1 < (state.laps).length){
      setCompareLap1(compareLap1 + 1);
      state.lapCompare1 += 1;
    }
  };

  const decreaseCompare2 = () => { 
    if (compareLap2 > 1){
      setCompareLap2(compareLap2 - 1);
      state.lapCompare2 -= 1;
    }
  };

  const increaseCompare2 = () => {
    if (compareLap2 < (state.laps).length){
      setCompareLap2(compareLap2 + 1);
      state.lapCompare2 += 1;
    }
  };

  
  if (mode == 1){
    return (
      <div className="track-map">
        {/*<LapDropdown options={["Compare...", "Lap 1", "Lap 2", "Lap 3", "Lap 4", "Lap 5", "Lap 6", "Lap 7", "Lap 8", "Lap 9", "Lap 10"]}/>*/}

        <h2>Track Map</h2>

        <div className="cone-counter">
          <div className="count-display">Mode: Single Lap ({count})</div>
          <button className="cone-reset" onClick={resetClick}><img src="src\assets\reset-icon.png" style={{width:20, height: 20}} alt="Reset Cone Button"/></button>
          <button className="cone-button" onClick={decreaseClick}>-</button>
          <button className="cone-button" onClick={increaseClick}>+</button>
          <button className="cone-button" onClick={toggleClick}>TOGGLE MODE</button>
        </div>

        <div className="map">
            <RaceLine />
        </div>
      </div>
    );
  } else if (mode == 2){
    return (
      <div className="track-map">
        {/*<LapDropdown options={["Compare...", "Lap 1", "Lap 2", "Lap 3", "Lap 4", "Lap 5", "Lap 6", "Lap 7", "Lap 8", "Lap 9", "Lap 10"]}/>*/}

        <h2>Track Map</h2>

        <div className="cone-counter">
          <div className="count-display">Mode: Compare Laps ({state.lapCompare1} and {state.lapCompare2})</div>
          <button className="cone-reset" onClick={resetClick}><img src="src\assets\reset-icon.png" style={{width:20, height: 20}} alt="Reset Cone Button"/></button>
          <button className="cone-button" onClick={decreaseCompare1}>First -</button>
          <button className="cone-button" onClick={increaseCompare1}>First +</button>
          <button className="cone-button" onClick={decreaseCompare2}>Second -</button>
          <button className="cone-button" onClick={increaseCompare2}>Second +</button>
          <button className="cone-button" onClick={toggleClick}>TOGGLE MODE</button>
        </div>

        <div className="map">
          <RaceLineCompare />
        </div>
      </div>
    );
  }
};

export default TrackMap;
