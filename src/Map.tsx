import { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon issue with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png'

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

interface MapProps {
  center?: [number, number]
  zoom?: number
  onAddressSearch?: (query: string) => void
}

interface MarkerData {
  id: number
  position: [number, number]
  label: string
}

interface DistanceLine {
  from: [number, number]
  to: [number, number]
  distance: number
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export default function Map({ center = [51.505, -0.09], zoom = 13 }: MapProps) {
  const [markers, setMarkers] = useState<MarkerData[]>([
    { id: 0, position: center, label: 'Initial marker' }
  ])
  const [distanceLines, setDistanceLines] = useState<DistanceLine[]>([])
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null)
  const [firstMarkerForDistance, setFirstMarkerForDistance] = useState<number | null>(null)
  const nextIdRef = useRef(1)

  const handleMapClick = (position: [number, number]) => {
    const newMarker: MarkerData = {
      id: nextIdRef.current++,
      position,
      label: `Marker ${nextIdRef.current - 1}`
    }
    setMarkers([...markers, newMarker])
  }

  const handleMarkerClick = (markerId: number, e: L.LeafletMouseEvent) => {
    e.originalEvent.stopPropagation()
    
    if (selectedMarkerId === markerId) {
      // Deselect if clicking the same marker
      setSelectedMarkerId(null)
    } else {
      setSelectedMarkerId(markerId)
    }
  }

  const handleMarkerRightClick = (markerId: number, e: L.LeafletMouseEvent) => {
    e.originalEvent.preventDefault()
    e.originalEvent.stopPropagation()
    
    if (firstMarkerForDistance === null) {
      // First marker selected for distance measurement
      setFirstMarkerForDistance(markerId)
    } else if (firstMarkerForDistance === markerId) {
      // Clicked the same marker, cancel selection
      setFirstMarkerForDistance(null)
    } else {
      // Second marker selected, calculate distance
      const firstMarker = markers.find(m => m.id === firstMarkerForDistance)
      const secondMarker = markers.find(m => m.id === markerId)
      
      if (firstMarker && secondMarker) {
        const distance = calculateDistance(
          firstMarker.position[0],
          firstMarker.position[1],
          secondMarker.position[0],
          secondMarker.position[1]
        )
        
        const newLine: DistanceLine = {
          from: firstMarker.position,
          to: secondMarker.position,
          distance
        }
        
        setDistanceLines([...distanceLines, newLine])
      }
      
      // Reset selection
      setFirstMarkerForDistance(null)
    }
  }

  const handleMarkerDragEnd = (markerId: number, newPosition: [number, number]) => {
    // Update marker position
    setMarkers(markers.map(m => 
      m.id === markerId ? { ...m, position: newPosition } : m
    ))
  }

  const handleMarkerDoubleClick = (markerId: number, e: L.LeafletMouseEvent) => {
    e.originalEvent.stopPropagation()
    
    // Get the marker's position before removing it
    const markerToRemove = markers.find(m => m.id === markerId)
    
    // Remove marker
    setMarkers(markers.filter(m => m.id !== markerId))
    
    // Remove associated distance lines
    if (markerToRemove) {
      setDistanceLines(distanceLines.filter(line => 
        !(line.from[0] === markerToRemove.position[0] && line.from[1] === markerToRemove.position[1]) &&
        !(line.to[0] === markerToRemove.position[0] && line.to[1] === markerToRemove.position[1])
      ))
    }
    
    if (selectedMarkerId === markerId) {
      setSelectedMarkerId(null)
    }
    if (firstMarkerForDistance === markerId) {
      setFirstMarkerForDistance(null)
    }
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={handleMapClick} />
      
      {/* Draw distance lines */}
      {distanceLines.map((line, idx) => (
        <Polyline 
          key={idx} 
          positions={[line.from, line.to]} 
          color="blue"
          weight={3}
          opacity={0.6}
        />
      ))}
      
      {/* Draw markers */}
      {markers.map((marker) => (
        <Marker 
          key={marker.id} 
          position={marker.position}
          draggable={true}
          eventHandlers={{
            click: (e) => handleMarkerClick(marker.id, e),
            contextmenu: (e) => handleMarkerRightClick(marker.id, e),
            dblclick: (e) => handleMarkerDoubleClick(marker.id, e),
            dragend: (e) => {
              const newPos: [number, number] = [e.target.getLatLng().lat, e.target.getLatLng().lng]
              handleMarkerDragEnd(marker.id, newPos)
            },
          }}
          opacity={
            selectedMarkerId === marker.id ? 0.6 : 
            firstMarkerForDistance === marker.id ? 0.7 : 
            1
          }
        >
          <Popup>
            <strong>{marker.label}</strong> <br />
            Coordinates: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)} <br />
            <small>
              Left-click to select/deselect<br />
              Right-click to measure distance<br />
              Double-click to remove<br />
              {firstMarkerForDistance === marker.id && "⚡ Right-click another marker"}
            </small>
          </Popup>
        </Marker>
      ))}
      
      {/* Display distance labels */}
      {distanceLines.map((line, idx) => {
        const midLat = (line.from[0] + line.to[0]) / 2
        const midLon = (line.from[1] + line.to[1]) / 2
        return (
          <Marker
            key={`distance-${idx}`}
            position={[midLat, midLon]}
            icon={L.divIcon({
              className: 'distance-label',
              html: `<div style="background: white; padding: 4px 8px; border-radius: 4px; border: 2px solid blue; font-weight: bold; white-space: nowrap; color: black; font-size: 14px;">${line.distance.toFixed(2)} km</div>`,
              iconSize: [100, 30],
              iconAnchor: [50, 15]
            })}
            interactive={false}
          />
        )
      })}
    </MapContainer>
  )
}
