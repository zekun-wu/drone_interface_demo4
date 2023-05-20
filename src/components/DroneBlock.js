import React, { useState, useEffect, useMemo } from 'react';
import './DroneMonitor.css';
import rotorIcon from './icons/rotor.png';
import cameraIcon from './icons/camera.png';
import weatherIcon from './icons/weather.png';
import sunIcon from './icons/weather/sun.png';
import rainIcon from './icons/weather/rain.png';
import snowIcon from './icons/weather/snow.png';
import fogIcon from './icons/weather/fog.png';
import extremeIcon from './icons/weather/extreme_weather.png';
import windIcon from './icons/wind.png';
import landingIcon from './icons/landing.png';
import flyIcon from './icons/zone/fly.png';
import noflyIcon from './icons/zone/no_fly.png';
import speedIcon from './icons/speed.png';
import horizontalIcon from './icons/speed/horizontal.png';
import verticalIcon from './icons/speed/vertical.png';
import batteryIcon from './icons/battery.png';
import altitudeIcon from './icons/altitude.png';
import distanceIcon from './icons/distance.png';
import elapsedIcon from './icons/elapsed.png';

const DroneBlock = ({ droneData, droneNumber, highlightStatus, isFrozen, latestData}) => {

  // console.log('currentData in DroneBlock:',latestData)

  const [currentIndex, setCurrentIndex] = useState(0);

  const weatherIcons = [
    { value: "sunny", icon: sunIcon, highlight: null },
    { value: "rainy", icon: rainIcon, highlight: null},
    { value: "snowy", icon: snowIcon, highlight: null },
    { value: "foggy", icon: fogIcon, highlight: null },
    { value: "extreme", icon: extremeIcon, highlight: highlightStatus },
  ];

  const zoneIcons = [
    { value: "no-fly zone", icon: noflyIcon, highlight: highlightStatus },
    { value: "fly zone", icon: flyIcon, highlight: null},
  ];

  const icons = [
    {
      name: 'battery',
      icon: batteryIcon,
    },
    {
      name: 'wind',
      icon: windIcon,
    },
    {
      name: 'rotor',
      icon: rotorIcon,
    },
    {
      name: 'zone',
      icon: flyIcon,
    },
    {
      name: 'horizontal_speed',
      icon: horizontalIcon,
    },
    {
      name: 'vertical_speed',
      icon: verticalIcon,
    },
    {
      name: 'altitude',
      icon: altitudeIcon,
    },
    {
      name: 'distance',
      icon: distanceIcon,
    }
  ];

  const getIconValue = useMemo(() => {
    const iconValues = {

      rotor: () => {
        const value = latestData.zone === 1 ? 'working' : (latestData.zone === 0 ? 'off' : 'unknown');
        const highlight = latestData.rotor === 0 ? highlightStatus : null;
        return { value, highlight };
      },

      weather: () => {
        const icon = weatherIcons[latestData.weather] || { value: 'unknown', highlight: latestData.weather === 4 ? highlightStatus : null };
        return icon;
      },

      wind: () => {
        const value = latestData.wind ? (latestData.wind).toFixed(1) + 'm/s' : 'unknown';
        const highlight = (100*latestData.wind).toFixed(0)> 1000 ? highlightStatus : null;
        return { value, highlight};
      },

      battery: () => {
        const value = latestData.battery ? (100 * latestData.battery).toFixed(0) + '%' : 'unknown';
        const highlight = (100 * latestData.battery).toFixed(0)<=10 ? highlightStatus : null;
        return { value, highlight };
      },

      horizontal_speed: () => {
        const value = latestData.horizontal_speed ? (latestData.horizontal_speed).toFixed(0) + 'm/s' : 'unknown';
        return { value, highlight: null };
      },

      vertical_speed: () => {
        const value = latestData.vertical_speed !== undefined && latestData.vertical_speed  !== null? (latestData.vertical_speed).toFixed(1) + 'm/s' : 'unknown';
        return { value, highlight: null };
      },

      altitude: () => {
        const value = latestData.altitude !== undefined && latestData.altitude !== null ? (latestData.altitude).toFixed(0) + 'm' : 'unknown';
        return { value, highlight: null };
      },

      distance: () => {
        const value = latestData.distance ? latestData.distance.toFixed(0) + 'm' : 'unknown';
        return { value, highlight: null };
      },  

      time: () => {
        const value = latestData.time ? latestData.time.toFixed(0) + 's' : 'unknown';
        return { value, highlight: null };
      },

      camera: () => {
        const value = latestData.camera === 1 ? 'working' : 'MALF';
        const highlight = latestData.camera === 0 ?  highlightStatus:null;
        return { value, highlight };
      },

      landing: () => {
        const value = latestData.landing === 1 ? 'possible' : 'not possible';
        const highlight = latestData.landing === 0 ? highlightStatus : null;
        return { value, highlight };
      },
      zone: () => {
        // const icon = zoneIcons[latestData.zone] || { value: 'unknown', highlight: latestData.nofly === 0 ? highlightStatus : null };
        const value = latestData.zone === 1 ? 'fly zone' : (latestData.zone === 0 ? 'no-fly' : 'unknown');
        const highlight = latestData.zone === 0 ? highlightStatus : null;        
        return { value, highlight };
      },
    };
  
    return (iconKey) => {
      const iconValue = iconValues[iconKey];

      if (!iconValue) {
        return { value: 'unknown', highlight: null };
      }
  
      const result = iconValue();

      if (result.value === undefined) {
        return { value: 'unknown', highlight: null };
      }
  
      return result;
    };
  }, [latestData, highlightStatus]);

  const IconComponent = ({ iconData }) => {

    const { name, getIcon,icon } = iconData;
    const { value, highlight } = getIconValue(name);


    return (
      <div className="icon-wrapper">
        <div
          className="icon"
          title={`${name}: ${latestData[name] || 0}`}
          style={{
            backgroundImage: `url(${getIcon ? getIcon(latestData[name]) : icon})`,
            // border: highlight === 1 ? 'yellow' : 'none',
            backgroundColor: highlight === 1 ? 'yellow' : 'none',
          }}
        ></div>
        <span className="icon-text">{value}</span>


      </div>
    );
  };

  // const handleTimestampChange = (timestampIndex) => {
  //   setCurrentTimestamp(timestampIndex);

  //   if (timestampIndex === timestamps.length - 1) {
  //     onDataPlayed(); // Call the onDataPlayed function when the data has been played
  //   }
  // };

  // Second useEffect for updating latestData when currentIndex changes

  return (
    <div className="drone-block">
      <div className="drone-number">Drone {droneNumber}</div>
      {/* <div className="top-right-info">
        <span className="distance-text">{getIconValue("distance").value}</span>
        <span className="elapsed-text">{getIconValue("time").value}</span>
      </div> */}
      <div className="icon-grid">
          {icons.slice(0, 8).map((iconData, index) => (
            <IconComponent key={index} iconData={iconData} />
          ))}
      </div>
    </div>
  );
};

export default DroneBlock;