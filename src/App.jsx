import { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentDate = new Date().toLocaleDateString();

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");

    try {
      const currentUrl =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

      const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast` +
        `?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error("City not found");
      }

      const currentData = await currentResponse.json();
      const forecastResult = await forecastResponse.json();

      setWeatherData(currentData);
      setForecastData(forecastResult.list);
    } catch (err) {
      setWeatherData(null);
      setForecastData([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getForecastDays = () => {
    const days = {};

    forecastData.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();

      if (!days[date]) {
        days[date] = [];
      }

      days[date].push(item);
    });

    return Object.entries(days)
      .slice(0, 5)
      .map(([date, items]) => {
        const temperatures = items.map((item) => item.main.temp);

        return {
          date,
          temperature: items[0].main.temp,
          feelsLike: items[0].main.feels_like,
          humidity: items[0].main.humidity,
          condition: items[0].weather[0].description,
          high: Math.max(...temperatures),
          low: Math.min(...temperatures),
        };
      });
  };

  return (
    <div className="mainpage">
      <div className="top-sec glass">
        <div className="logo">
          <h1>Weather App</h1>
        </div>

        <div className="search-box">
          <TextField
            type="text"
            placeholder="Search location..."
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                fetchWeather();
              }
            }}
          />

          <button onClick={fetchWeather} className="form-btn">
            <SearchIcon />
          </button>
          {loading && <p className="form-error">Loading weather...</p>}
          {error && <p className="form-error">{error}</p>}
        </div>
      </div>

      <div className="btm-sec">
        {weatherData && (
          <>
            <div className="live-weather glass">
              <h2>Daily Forecast</h2>

              <h1>
                {weatherData.name}, {weatherData.sys.country}
              </h1>

              <p>{currentDate}</p>

              <div>
                <h3>{weatherData.main.temp.toFixed(1)}°C</h3>
                <p>{weatherData.weather[0].description}</p>
              </div>

              <div>
                <p>High: {weatherData.main.temp_max.toFixed(1)}°C</p>
                <p>Low: {weatherData.main.temp_min.toFixed(1)}°C</p>
                <p>Wind Speed: {weatherData.wind.speed} m/s</p>
                <p>Humidity: {weatherData.main.humidity}%</p>
                <p>Sunrise: {formatTime(weatherData.sys.sunrise)}</p>
                <p>Sunset: {formatTime(weatherData.sys.sunset)}</p>
              </div>
            </div>

            <div className="forecast-weather glass">
              <h2>Five Days Forecast</h2>

              <div className="single-weather">
                {getForecastDays().map((day) => (
                  <div key={day.date}>
                    <h3>{day.date}</h3>
                    <p>Temperature: {day.temperature.toFixed(1)}°C</p>
                    <p>
                      High: {day.high.toFixed(1)}°C | Low: {day.low.toFixed(1)}
                      °C
                    </p>
                    <p>Feels like: {day.feelsLike.toFixed(1)}°C</p>
                    <p>Humidity: {day.humidity}%</p>
                    <p>{day.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
