import { useState } from 'react'
import './App.css'
import Map from './Map'
import AddressSearch from './AddressSearch'

function App() {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])
  const [mapZoom, setMapZoom] = useState(13)

  const handleSearchResult = (lat: number, lon: number, displayName: string) => {
    setMapCenter([lat, lon])
    setMapZoom(15)
    console.log('Search result:', displayName)
  }

  return (
    <div className="app-container">
      <h1>OpenStreetMap React App</h1>
      <AddressSearch onSearchResult={handleSearchResult} />
      <div className="map-wrapper">
        <Map center={mapCenter} zoom={mapZoom} key={`${mapCenter[0]}-${mapCenter[1]}`} />
      </div>
    </div>
  )
}

export default App
