import React, { useState, useRef, useEffect, memo } from "react";
import {Login} from "./components/Login";
import Questionnaire from "./components/Questionnaire";
import DroneMonitor from "./components/DroneMonitor";
import Calibration from "./components/Calibration";
import End from "./components/End";
import "./App.css";
import html2canvas from 'html2canvas';
// import ScreenRecorder from "./components/ScreenRecorder";

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneCounter, setSceneCounter] = useState(1);
  const [interval, setIntervalCount] = useState(1);
  const [results, setResults] = useState([]);

  const [taskStarted, setTaskStarted] = useState(false);
  const [calibration, setCalibration] = useState(false);
  const [allTaskEnded, setallTaskEnded] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [endQuestionnaire, setEndQuestionnaire] = useState(false);
  const questionnaireRef = useRef();

  const [droneData, setDroneData] = useState({});
  const [allDronesCurrentData, setAllDronesCurrentData] = useState([]);

  const [spacebarTimestamps, setSpacebarTimestamps] = useState([]);

  const final_task = 1

  const handleLogin = (userData) => {
    // Save userData to results
    setResults((prevResults) => [...prevResults, userData]);
    // Set loggedIn state to true
    setLoggedIn(true);
  };


  const loadAllDronesData = async () => {
    const droneData = [];
    const allDronesCurrentData=[]
    for (let drone = 1; drone <= 4; drone++) {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/${sceneCounter}/${drone}/data.json`);
        if (!response.ok) {
          console.error(`Error fetching data for scene ${sceneCounter} and drone ${drone}:`, response.status, response.statusText);
          continue;
        }
        const data = await response.json();
        droneData[drone - 1] = data;

        allDronesCurrentData[drone-1] = data.timestamps[currentIndex];
      } catch (error) {
        console.error(`Error fetching data for scene ${sceneCounter} and drone ${drone}:`, error);
      }
    }
    setDroneData(droneData)
    setAllDronesCurrentData(allDronesCurrentData);
  };

  useEffect(() => {
    loadAllDronesData();
  }, []);

  // Define playData to keep track of currentIndex and corresponding allDronesCurrentData
  const playData = () => {
    if (showQuestionnaire) {
      // Do nothing; keep currentIndex the same
      return;
    }
  
    if (!taskStarted) {
      setCurrentIndex(0); // Set currentIndex to 0
      return;
    }
  
    // If taskStarted is true and showQuestionnaire is false, update currentIndex
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        if (droneData[0] && newIndex >= droneData[0].timestamps.length) {
          clearInterval(timer);
          return prevIndex;
        }
        const updatedDronesData = allDronesCurrentData.map((data, index) => {
          return droneData[index].timestamps[newIndex];
        });

        setAllDronesCurrentData(updatedDronesData);
        
        if (updatedDronesData[0]['question'] === 1) {
          setShowQuestionnaire(true);
          // setShowQuestionnaire(false);
          clearInterval(timer);
          return prevIndex + 1;
        }

        if (updatedDronesData[0]['end'] === 1) {
          if (sceneCounter === final_task) {
            setallTaskEnded(true); // Transition to End page
          } else {
            setTaskStarted(false);
            setCalibration(true); // Transition to Calibration page
          }
          clearInterval(timer);
          return prevIndex;
        }
        return newIndex;
      });
    }, 1000 / 24);
    return timer;
  };

  // Add playData to useEffect
  useEffect(() => {
    loadAllDronesData();
  }, [sceneCounter]);

  useEffect(() => {
    const timerId = playData();
  
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [taskStarted, showQuestionnaire, currentIndex, endQuestionnaire]);

  const handleCalibration = () => {
    // Update sceneCounter and reset calibration state
    setSceneCounter(sceneCounter + 1);
    setCalibration(false);
  };

  const handleQuestionnaireSubmit = (currentResult) => {
    console.log('currentResult',currentResult)
    setResults((prevResults) => {
      const updatedResults = [...prevResults, currentResult];
      return updatedResults;
    });
    setShowQuestionnaire(false);
  
    if (allDronesCurrentData[0]['end']===1) {
      if (sceneCounter === final_task) {
        setallTaskEnded(true);
      } else {
        setEndQuestionnaire(true);
      }
    }
  };

  useEffect(() => {
    if (taskStarted && currentIndex !== 0 && (currentIndex+1) % 360 === 0) {
      setIntervalCount(prevInterval => prevInterval + 1);
    }
  }, [taskStarted, currentIndex]);

  useEffect(() => {
    setIntervalCount(1); // reset interval count when scene changes
  }, [sceneCounter]);

  // useEffect(() => {
  //   const notifyServer = async (url, taskState, scene, interval, currentIndex, showQuestionnaire, calibration, allTaskEnded) => {
  //     await fetch(url, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({taskStarted: taskState, scene, interval, currentIndex, showQuestionnaire, calibration, allTaskEnded })
  //     })
  //     .then(response => response.json())
  //     .then(data => console.log(data))
  //     .catch((error) => {
  //       console.error('Error:', error);
  //     });
  //   };
  
  //   notifyServer('http://localhost:5000', taskStarted, sceneCounter, interval, currentIndex, showQuestionnaire, calibration, allTaskEnded);
  
  // }, [currentIndex]);

  useEffect(() => {
    // Send a message to the extension
    window.postMessage({ type: "CAPTURE_SCREENSHOT", payload: { currentIndex } }, "*");
}, [currentIndex]);

  return (
  <div className="App">
    <div className={loggedIn && !showQuestionnaire ? "app_container no-scroll" : "app_container"}>
      {!loggedIn ? (
        <Login onLogin={handleLogin} />
      ) :
        <>
          {calibration ? (
            <Calibration />
          ) : showQuestionnaire ? (
            <Questionnaire
              ref={questionnaireRef}
              onSubmit={handleQuestionnaireSubmit}
              sceneCounter={sceneCounter}
              allDronesCurrentData={allDronesCurrentData}
              droneData={droneData}
            />
          ) : allTaskEnded ? (
            <End results={results}  spacebarTimestamps={spacebarTimestamps}/>
          ) : (
            <DroneMonitor
              key={sceneCounter}
              taskStarted={taskStarted}
              sceneCounter={sceneCounter}
              currentIndex={currentIndex}
              currentData={allDronesCurrentData}
              droneData={droneData}
              setSpacebarTimestamps={setSpacebarTimestamps}
            />
          )}
        <div className="content-wrapper">
          <h3>Current Task: {sceneCounter}</h3>
          <div className="button-container">
            {showQuestionnaire ? (
              <button type="submit" onClick={() => questionnaireRef.current && questionnaireRef.current.handleSubmit()}>
                Submit and Proceed
              </button>
            ) : calibration ? (
              <button onClick={handleCalibration}>Next</button>
            ) : (
              !taskStarted && (
                <button onClick={() => setTaskStarted(true)}>Start</button>
              )
            )}
          </div>
        </div>
        </>
      }
    </div>
  </div>
  );
}

export default App;
