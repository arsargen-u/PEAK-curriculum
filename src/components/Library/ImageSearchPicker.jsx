import { useState, useEffect, useRef } from 'react'

export function ImageSearchPicker({ targetName, onSelect, onClose }) {
  const [query, setQuery] = useState(targetName)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [noKey, setNoKey] = useState(false)
  const inputRef = useRef()

  const search = async (q) => {
    const key = localStorage.getItem('unsplash_access_key')
    if (!key) { setNoKey(true); return }
    setNoKey(false)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=squarish`,
        { headers: { Authorization: `Client-ID ${key}` } }
      )
      if (!res.ok) throw new Error(`Unsplash error ${res.status}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search(targetName)
    // eslint-disable-next-line
  }, [])

  const handleSelect = async (photo) => {
    // Fetch the image as base64 so it can be stored offline in IndexedDB
    try {
      const res = await fetch(photo.urls.small)
      const blob = await res.blob()
      const reader = new FileReader()
      reader.onload = (e) => onSelect(e.target.result)
      reader.readAsDataURL(blob)
    } catch {
      // Fallback: just use the URL directly if CORS blocks the fetch
      onSelect(photo.urls.small)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <span className="text-gray-400">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search(query)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
              placeholder="Search for an image…"
            />
          </div>
          <button
            onClick={() => search(query)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
          >
            Search
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-1">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {noKey && (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🔑</p>
              <p className="text-gray-700 font-semibold">No Unsplash API key set</p>
              <p className="text-sm text-gray-500 mt-1">
                Go to <strong>⚙ Settings</strong> in the top nav and add your free Unsplash key.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-10 text-red-500 text-sm">{error}</div>
          )}

          {!loading && !error && !noKey && results.length === 0 && (
            <div className="text-center py-10 text-gray-400">No results — try a different search term</div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {results.map(photo => (
              <button
                key={photo.id}
                onClick={() => handleSelect(photo)}
                className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <img
                  src={photo.urls.thumb}
                  alt={photo.alt_description || query}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {results.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Photos via{' '}
              <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline">
                Unsplash
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
