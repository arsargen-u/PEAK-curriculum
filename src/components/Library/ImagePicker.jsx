import { useState, useEffect, useCallback } from 'react'
import { getAllLibraryImages, searchLibraryImages } from '../../store/db'
import { compressImage } from '../../utils/imageUtils'

// --- helpers ---
async function urlToBase64(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  const raw = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return compressImage(raw)
}

// --- Library tab ---
function LibraryTab({ onSelect }) {
  const [query, setQuery] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (q) => {
    setLoading(true)
    try {
      const results = q.trim() ? await searchLibraryImages(q) : await getAllLibraryImages()
      setImages(results)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load('') }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(query), 300)
    return () => clearTimeout(t)
  }, [query, load])

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Loading library…</div>
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-b border-gray-100">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search library by label…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {images.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-gray-400 text-sm">No images in library yet.</p>
            <p className="text-gray-300 text-xs">Go to 🖼 Image Library in the nav to add some.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map(img => (
              <button
                key={img.id}
                onClick={() => onSelect(img.imageData)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden border-2 border-transparent group-hover:border-indigo-400 transition-all active:scale-95">
                  <img src={img.imageData} alt={img.label} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-gray-500 truncate w-full text-center px-1">{img.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Unsplash tab ---
function UnsplashTab({ targetName, onSelect }) {
  const [query, setQuery] = useState(targetName ?? '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async () => {
    const apiKey = localStorage.getItem('unsplash_access_key')
    if (!apiKey) { setError('No Unsplash key set — add one in ⚙ Settings.'); return }
    if (!query.trim()) return
    setLoading(true); setError(null)
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=squarish`,
        { headers: { Authorization: `Client-ID ${apiKey}` } }
      )
      if (!res.ok) throw new Error(`Unsplash error ${res.status}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSelect = async (photo) => {
    try { onSelect(await urlToBase64(photo.urls.small)) }
    catch { onSelect(photo.urls.small) }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-b border-gray-100 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search Unsplash…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          autoFocus
        />
        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? '…' : 'Go'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 px-4 py-2">{error}</p>}
      <div className="flex-1 overflow-y-auto p-3">
        {results.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {localStorage.getItem('unsplash_access_key') ? 'Search for photos above' : 'Add an Unsplash API key in ⚙ Settings'}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {results.map(photo => (
              <button key={photo.id} onClick={() => handleSelect(photo)}
                className="aspect-square rounded-xl overflow-hidden hover:ring-4 hover:ring-indigo-400 transition-all active:scale-95">
                <img src={photo.urls.thumb} alt={photo.alt_description ?? ''} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-300 py-1.5 border-t border-gray-100 flex-shrink-0">
        Photos from <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline">Unsplash</a>
      </p>
    </div>
  )
}

// --- Pexels tab ---
function PexelsTab({ targetName, onSelect }) {
  const [query, setQuery] = useState(targetName ?? '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async () => {
    const apiKey = localStorage.getItem('pexels_api_key')
    if (!apiKey) { setError('No Pexels key set — add one in ⚙ Settings.'); return }
    if (!query.trim()) return
    setLoading(true); setError(null)
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=square`,
        { headers: { Authorization: apiKey } }
      )
      if (!res.ok) throw new Error(`Pexels error ${res.status}`)
      const data = await res.json()
      setResults(data.photos ?? [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSelect = async (photo) => {
    try { onSelect(await urlToBase64(photo.src.medium)) }
    catch { onSelect(photo.src.medium) }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-b border-gray-100 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search Pexels…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          autoFocus
        />
        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? '…' : 'Go'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 px-4 py-2">{error}</p>}
      <div className="flex-1 overflow-y-auto p-3">
        {results.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {localStorage.getItem('pexels_api_key') ? 'Search for photos above' : 'Add a Pexels API key in ⚙ Settings'}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {results.map(photo => (
              <button key={photo.id} onClick={() => handleSelect(photo)}
                className="aspect-square rounded-xl overflow-hidden hover:ring-4 hover:ring-emerald-400 transition-all active:scale-95 bg-gray-100">
                <img
                  src={photo.src.tiny}
                  alt={photo.alt ?? ''}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-300 py-1.5 border-t border-gray-100 flex-shrink-0">
        Photos from <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a>
      </p>
    </div>
  )
}

// --- Main picker ---
const TABS = [
  { id: 'library',  label: '📚 Library' },
  { id: 'unsplash', label: '🔍 Unsplash' },
  { id: 'pexels',   label: '🌿 Pexels' },
]

export function ImagePicker({ targetName, onSelect, onClose, defaultTab = 'library' }) {
  const [tab, setTab] = useState(defaultTab)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ height: '80vh' }}>
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Add Image</h3>
            {targetName && <p className="text-xs text-gray-400">for "{targetName}"</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 flex flex-col">
          {tab === 'library'  && <LibraryTab  onSelect={onSelect} />}
          {tab === 'unsplash' && <UnsplashTab targetName={targetName} onSelect={onSelect} />}
          {tab === 'pexels'   && <PexelsTab   targetName={targetName} onSelect={onSelect} />}
        </div>
      </div>
    </div>
  )
}
