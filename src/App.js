import React, { useEffect, useState } from 'react';
import "./App.css";
import Chart from 'chart.js';
import {Chart as ChartJS, defaults} from "chart.js/auto"; 
import {Line} from "react-chartjs-2";


//READ ME: App.js file contains the client code for the Samsara Charts full stack application. This file is written in React (javascript) and handles pulling the data from the backend server,
//manipulating the data, storing it in state variables and then displaying it into various charts and graphs

//Settings for Chart.js for formatting and animations
defaults.responsive = true;
defaults.maintainAspectRatio = false;
defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

const App = () => {
  //Declaring state variables to hold the data that will be rendered onto the screen 
  const [vehicleData, setVehicleData] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [humidity, setHumidity] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [doorStatus, setDoorStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    //Grabbing static sensor history data on mount of react component
    const getSensorHistory = async () => {
      try {
        const response = await fetch("http://localhost:3001/history");
        const data = await response.json();
        setSensorHistory(data.results); // Update state with history data
      } catch (error) {
        console.error('Error fetching history data:', error);
      }
    };

    //Grabbing static Vehicle Data on mount of react component and setting the vehicleData state object
    const getVehicleData = async () => {
      try {
        const response = await fetch("http://localhost:3001/vehicles");
        const data = await response.json();
        setVehicleData(data.data); // Update state with vehicle data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    //Grabbing dynamic/live data on mount of react component
    const fetchLiveData = async () => {
      try {
        //Fetch door status
        const doorStatusResponse = await fetch("http://localhost:3001/doorStatus");
        const doorStatusData = await doorStatusResponse.json();
        setDoorStatus(doorStatusData);

        // Fetch current temperature
        const temperatureResponse = await fetch("http://localhost:3001/temperature");
        const temperatureData = await temperatureResponse.json();
        const fahrenheitTemp = millidegreeCelsiusToFahrenheit(temperatureData.sensors[0].ambientTemperature);
        setTemperature(fahrenheitTemp);


        // //Fetch current humidity
        const humidityResponse = await fetch("http://localhost:3001/humidity");
        const humidityData = await humidityResponse.json();
        setHumidity(humidityData.sensors[0].humidity);

        //Get current time and set time state variable
        let time = new Date();
        let formatTime = time.toLocaleTimeString();
        setCurrentTime(formatTime);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the asynchronous functions inside useEffect to initialize data
    getSensorHistory();
    getVehicleData();
    fetchLiveData();

    // // Use and interval to Fetch data every 5 minutes
    // const fetchDataInterval = setInterval(fetchLiveData, 1 * 1000);

    // // Cleanup the interval on component unmount
    // return () => clearInterval(fetchDataInterval);

  }, []); // Empty dependency array to run once on mount for useEffect


  //method to format date from unix time stamp to HH:MM:SS and EST time zone
const formatDate = (unixTimeStamp) => {
  // Convert Unix timestamp to milliseconds
  let date = new Date(unixTimeStamp);

  // Set the time zone offset for Eastern Standard Time (EST)
  const estOffset = -5 * 60 * 60 * 1000; // UTC-5
  date.setTime(date.getTime() + estOffset);

  // Extract hours, minutes, and seconds
  let hours = date.getUTCHours();
  let minutes = "0" + date.getUTCMinutes();
  let seconds = "0" + date.getUTCSeconds();

  // Format the time string
  let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime;
}


//method used to convert the temperature reading from Millidegrees Celsius to Fahrenheit
const millidegreeCelsiusToFahrenheit = (millidegreesCelsius) => {
  const celsius = millidegreesCelsius * 0.001;
  const fahrenheit = (celsius * 9 / 5) + 32;
  return fahrenheit;
};

  return (
    <div className="App">
        <h1>Jacqueline's Samsara Sensor Charts</h1>
        <div className="dataCard combinedCard">
        <Line data={{
          labels: sensorHistory.map((data) => formatDate(data.timeMs)),
          datasets: [{
            label: "Temperature",
            data: sensorHistory.map((data) => millidegreeCelsiusToFahrenheit(data.series[1])),
            backgroundColor: "#064FF0",
            borderColor: "#064FF0",
          },
          {
            label: "Humidity",
            data: sensorHistory.map((data) => data.series[0]),
            backgroundColor: "#FF3030",
            borderColor: "#FF3030",
          }
        ]
        }}
        options={{
          elements: {
            line: {
              tension: 0.5,
            },
          },
          plugins:{
            title: {
              text: "Temperature and Humidity",
            }
          },
          scales:{
            x: {
              title:{
                display: true,
                text: "Time (HH:MM:SS | EST)"
              }
            },
            y: {
              title: {
                display: true,
                text: 'Degrees Fahrenheit',
              }
            }
          },
        }}/>
        </div>

        <div className="dataCard doorCard">
        <h4>Live Status Updates for Vehicle: </h4>
        <h4>{vehicleData ? `${vehicleData[0]?.year} ${vehicleData[0]?.make} ${vehicleData[0]?.model}` : ''}</h4>
          <h5>At time: {currentTime}</h5>
          <h5>Door Status: {doorStatus ? "Closed" : "Open"}</h5>
          <h5>Current Temperature: {temperature + " Fahrenheit"}</h5>
          <h5>Current Humidity: {humidity + "%"}</h5>
        </div>


        <div className="dataCard temperatureCard">

        <Line data={{
          labels: sensorHistory.map((data) => formatDate(data.timeMs)),
          datasets: [{
            label: "Temperature",
            data: sensorHistory.map((data) => millidegreeCelsiusToFahrenheit(data.series[1])),
            backgroundColor: "#064FF0",
            borderColor: "#064FF0",
          }
        ]
        }}
        options={{
          elements: {
            line: {
              tension: 0.5,
            },
          },
          plugins:{
            title: {
              text: "Temperature",
            }
          },
          scales:{
            x: {
              title:{
                display: true,
                text: "Time (HH:MM:SS | EST)"
              }
            },
            y: {
              title: {
                display: true,
                text: 'Degrees Fahrenheit',
              }
            }
          },
        }}/>
        </div>


        <div className="dataCard humidityCard">
        <Line data={{
          labels: sensorHistory.map((data) => formatDate(data.timeMs)),
          datasets: [
          {
            label: "Humidity",
            data: sensorHistory.map((data) => data.series[0]),
            backgroundColor: "#FF3030",
            borderColor: "#FF3030",
          }
        ]
        }}
        options={{
          elements: {
            line: {
              tension: 0.5,
            },
          },
          plugins:{
            title: {
              text: "Humidity",
            }
          },
          scales:{
            x: {
              title:{
                display: true,
                text: "Time (HH:MM:SS | EST)"
              }
            },
            y: {
              title: {
                display: true,
                text: 'Percentage (%)',
              }
            }
          },
        }}/>
        </div>
    </div>
  );
}

export default App;
 