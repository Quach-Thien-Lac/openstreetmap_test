import { useState, useEffect } from 'react'
import './WeatherInfo.css'

interface WeatherData {
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  name: string
}

interface WeatherInfoProps {
  lat: number
  lon: number
  locationName: string
}

const API_KEY = 'b4917c9e62ee367a3afb963f07dade4c'

export default function WeatherInfo({ lat, lon, locationName }: WeatherInfoProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        )
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Weather API error response:', errorData)
          throw new Error(errorData.message || 'Failed to fetch weather data')
        }
        
        const data = await response.json()
        setWeather(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to fetch weather data'
        setError(errorMessage)
        console.error('Weather API error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (lat && lon) {
      fetchWeather()
    }
  }, [lat, lon])

  if (loading) {
    return (
      <div className="weather-info loading">
        <div className="weather-spinner">⏳</div>
        <span>Loading weather...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="weather-info error">
        <span>❌ {error}</span>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  return (
    <div className="weather-info">
      <div className="weather-header">
        <h3>🌤️ Weather at {locationName}</h3>
      </div>
      
      <div className="weather-content">
        <div className="weather-main">
          <img 
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            className="weather-icon"
          />
          <div className="weather-temp">
            <span className="temp-value">{Math.round(weather.main.temp)}°C</span>
            <span className="temp-desc">{weather.weather[0].description}</span>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="weather-detail-item">
            <span className="detail-label">Feels like:</span>
            <span className="detail-value">{Math.round(weather.main.feels_like)}°C</span>
          </div>
          <div className="weather-detail-item">
            <span className="detail-label">Humidity:</span>
            <span className="detail-value">{weather.main.humidity}%</span>
          </div>
          <div className="weather-detail-item">
            <span className="detail-label">Wind:</span>
            <span className="detail-value">{weather.wind.speed} m/s</span>
          </div>
          <div className="weather-detail-item">
            <span className="detail-label">Pressure:</span>
            <span className="detail-value">{weather.main.pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  )
}
