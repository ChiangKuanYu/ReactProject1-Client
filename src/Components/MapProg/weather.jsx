import axios from "axios";
import React,{ useState, useEffect} from "react";
import "./weather.css";
import { FaWind,FaWater } from "react-icons/fa";
import WeatherCard from "./weatherCard";
import contacts from "./contact";


const WEA = process.env.REACT_APP_WEA;

const Weather = (props) => {
    const location = {
        lat:props.location.latitude,
        lon:props.location.longitude
    };
    const {lat,lon} = location;
    const [dailyForecast, setDailyForecase] = useState(contacts);
    const [weatherInfo, setWeatherInfo] = useState({
        temperature:0,
        description:0,
        humidity:0,
        wind:0,
        OWdate:"2024-08-09",
        OWtime:"08:00:00"
    });

    function imgSelect(Weatherdesc){
        var img = '';
        switch (Weatherdesc) {
            case 'Clear':
                img = 'images/clear.png';
                break;
            case 'Rain':
                img = 'images/rain.png';
                break;
            case 'Snow':
                img = 'images/snow.png';
                break;
            case 'Clouds':
                img = 'images/cloud.png';
                break;
            case 'Haze':
                img = 'images/mist.png';
                break;
            default:
                img = '';
        }
        return img;
    };

    const getWeatherInfo = async (event) => {
        const { data } = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${event.lat}&lon=${event.lon}&units=metric&appid=${WEA}`
        );
        // console.log(data);
        
        var time = new Date();
        let firstTime = 0;
        const hr = time.getHours();
        setDailyForecase((data.list).filter(e => e.dt_txt.substring(11,13) === "00"));
        // console.log((data.list).filter(e => e.dt_txt.substring(11,13) === "00"));
        
        
        for (firstTime = 0; firstTime < 40; firstTime++) {
            var openWhr = parseInt(data.list[firstTime].dt_txt.substring(11,13));
            if ((0 <= (openWhr-hr) && (openWhr-hr)<3) || (openWhr-hr)<-20 ) break  //如 i 等於 3 時，跳過一次目前正在執行的迴圈
        }

        // console.log(data.list[firstTime]);
        
        setWeatherInfo({
            weatherImg:data.list[firstTime].weather[0].main,
            temperature:data.list[firstTime].main.temp,
            description:data.list[firstTime].weather[0].description,
            humidity:data.list[firstTime].main.humidity,
            wind:data.list[firstTime].wind.speed,
            OWdate:data.list[firstTime].dt_txt.substring(5,10),
            OWtime:data.list[firstTime].dt_txt.substring(11,16)
        });


    };

    useEffect(() => {
        getWeatherInfo({lat,lon});
    }, [lat,lon]);
    
  return (
    <>
    <div className="weather-box1">
        <h1>{weatherInfo.OWdate}   {weatherInfo.OWtime}</h1>
        <hr />
        <div className="weather-info">
            <div className="weather-temp">
                <img src={imgSelect(weatherInfo.weatherImg)} alt="weatherIcon" />
                <p className="temp">{parseInt(weatherInfo.temperature)}<span>°C</span></p>
            </div>
            {/* 天氣 */}
            <div className="weather-description">
                <i className="fa-solid fa-water"></i>
                <div className="text-title">
                    <p><span>{weatherInfo.description}</span></p>
                </div>
                <hr />
                <div className="weather-details">
                    {/* 濕度  */}
                    <div className="humidity">
                        <FaWater size={30} className="mr-3" />
                        <div className="text">
                            <span className="number">{weatherInfo.humidity}</span><span className="unit">%</span>
                            <p>Humidity</p>
                        </div>
                    </div>
                    {/* 風速 */}
                    <div className="wind">
                        <FaWind size={40} className="mr-3" />
                        <div className="text">
                            <span className="number">{weatherInfo.wind}</span><span className="unit">Km/h</span>
                            <p>Wind</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="weather-box2">
        <h1>Daily Forcecast</h1>
        <hr />
        <div className="daily-forecast">
            {dailyForecast.map((dailyData,index)=>
                <WeatherCard 
                    key={`daily-${index}`}
                    Wdate={dailyData.dt_txt.substring(5,10)}
                    Wtemp={dailyData.main.temp}
                    Wdescription={imgSelect(dailyData.weather[0].main)}
                />
            )}
        </div>
    </div>
    </>
  )
}

export default Weather;