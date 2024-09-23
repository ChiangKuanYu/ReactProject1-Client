import React from 'react'

function WeatherCard(props) {
  return (
    <div className="weather-card">
        <p>{props.Wdate}</p>
        <img src={props.Wdescription} alt="weather-icon" />
        <p>{props.Wtemp}<span>°C</span></p>
    </div>
  )
}

export default WeatherCard