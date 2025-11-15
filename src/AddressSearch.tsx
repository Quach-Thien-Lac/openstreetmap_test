import { useState } from 'react'
import './AddressSearch.css'

interface SearchResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  type?: string
  class?: string
}

interface AddressSearchProps {
  onSearchResult: (lat: number, lon: number, displayName: string) => void
}

export default function AddressSearch({ onSearchResult }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [vietnamQuery, setVietnamQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [vietnamResults, setVietnamResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [vietnamLoading, setVietnamLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showVietnamResults, setShowVietnamResults] = useState(false)

  const searchAddress = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchVietnamPlaces = async () => {
    if (!vietnamQuery.trim()) return

    setVietnamLoading(true)
    try {
      // Search for places of interest in Vietnam with specific query
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(vietnamQuery)},Vietnam&` +
        `countrycodes=vn&` +
        `limit=5&` +
        `addressdetails=1`
      )
      const data = await response.json()
      setVietnamResults(data)
      setShowVietnamResults(true)
    } catch (error) {
      console.error('Vietnam search error:', error)
    } finally {
      setVietnamLoading(false)
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    onSearchResult(parseFloat(result.lat), parseFloat(result.lon), result.display_name)
    setShowResults(false)
    setQuery(result.display_name)
  }

  const handleSelectVietnamResult = (result: SearchResult) => {
    onSearchResult(parseFloat(result.lat), parseFloat(result.lon), result.display_name)
    setShowVietnamResults(false)
    setVietnamQuery('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAddress()
    }
  }

  const handleVietnamKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchVietnamPlaces()
    }
  }

  return (
    <div className="address-search">
      <div className="search-row">
        {/* General Search */}
        <div className="search-column">
          <label className="search-label">🌍 General Search</label>
          <div className="search-input-container">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for any address or place..."
              className="search-input"
            />
            <button 
              onClick={searchAddress} 
              disabled={loading}
              className="search-button"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {showResults && results.length > 0 && (
            <div className="search-results">
              {results.map((result) => (
                <div
                  key={result.place_id}
                  className="search-result-item"
                  onClick={() => handleSelectResult(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
          
          {showResults && results.length === 0 && !loading && (
            <div className="search-results">
              <div className="search-result-item no-results">No results found</div>
            </div>
          )}
        </div>

        {/* Vietnam-specific Search */}
        <div className="search-column">
          <label className="search-label">🇻🇳 Vietnam Places of Interest</label>
          <div className="search-input-container">
            <input
              type="text"
              value={vietnamQuery}
              onChange={(e) => setVietnamQuery(e.target.value)}
              onKeyPress={handleVietnamKeyPress}
              placeholder="e.g., Hoan Kiem Lake, Ben Thanh Market..."
              className="search-input"
            />
            <button 
              onClick={searchVietnamPlaces} 
              disabled={vietnamLoading}
              className="search-button vietnam-button"
            >
              {vietnamLoading ? 'Searching...' : 'Search VN'}
            </button>
          </div>
          
          {showVietnamResults && vietnamResults.length > 0 && (
            <div className="search-results">
              <div className="vietnam-results-header">Top 5 Results in Vietnam</div>
              {vietnamResults.map((result) => (
                <div
                  key={result.place_id}
                  className="search-result-item vietnam-result"
                  onClick={() => handleSelectVietnamResult(result)}
                >
                  <div className="result-name">
                    {result.display_name.split(',')[0]}
                  </div>
                  <div className="result-address">
                    {result.display_name}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showVietnamResults && vietnamResults.length === 0 && !vietnamLoading && (
            <div className="search-results">
              <div className="search-result-item no-results">No places found in Vietnam</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
