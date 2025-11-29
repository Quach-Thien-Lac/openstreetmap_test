import { useState } from 'react'
import './App.css'
import Map from './Map'
import AddressSearch from './AddressSearch'
import WeatherInfo from './WeatherInfo'
import TranslationWidget from './TranslationWidget'

function App() {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])
  const [mapZoom, setMapZoom] = useState(13)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lon: number
    name: string
  } | null>(null)

  const handleSearchResult = (lat: number, lon: number, displayName: string) => {
    setMapCenter([lat, lon])
    setMapZoom(15)
    setSelectedLocation({ lat, lon, name: displayName })
    console.log('Search result:', displayName)
  }

  return (
    <div className="app-container">
      <h1>Location Search</h1>
      <AddressSearch onSearchResult={handleSearchResult} />
      <TranslationWidget />
      {selectedLocation && (
        <>
          <WeatherInfo 
            lat={selectedLocation.lat} 
            lon={selectedLocation.lon} 
            locationName={selectedLocation.name}
          />
        </>
      )}
      <div className="map-wrapper">
        <Map center={mapCenter} zoom={mapZoom} key={`${mapCenter[0]}-${mapCenter[1]}`} />
      </div>
    </div>
  )
}

export default App
