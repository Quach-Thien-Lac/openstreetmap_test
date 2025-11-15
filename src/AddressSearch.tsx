import { useState } from 'react'
import './AddressSearch.css'

interface SearchResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
}

interface AddressSearchProps {
  onSearchResult: (lat: number, lon: number, displayName: string) => void
}

export default function AddressSearch({ onSearchResult }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

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

  const handleSelectResult = (result: SearchResult) => {
    onSearchResult(parseFloat(result.lat), parseFloat(result.lon), result.display_name)
    setShowResults(false)
    setQuery(result.display_name)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAddress()
    }
  }

  return (
    <div className="address-search">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for an address or place..."
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
  )
}
