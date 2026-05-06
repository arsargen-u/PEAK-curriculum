import { useState, useEffect, useCallback } from 'react'
import { getAllLibraryImages, searchLibraryImages } from '../../store/db'
import { compressImage } from '../../utils/imageUtils'
import PictureLibrary, { imgCache } from './PictureLibrary'
import { NUMBER_WORDS } from '../../data/pictureLibraryData'

// ─── helpers ───────────────────────────────────────────────────────────────

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

// ─── Variant → data URL conversion ─────────────────────────────────────────

/** Fetch a Wikipedia thumbnail URL, with OpenSearch fallback for near-misses */
async function fetchWikiImgUrl(term) {
  // Reuse cache populated by PictureLibrary's useWikiImg
  if (imgCache[term] !== undefined) return imgCache[term]

  // Step 1 — direct REST lookup
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`
    )
    if (r.ok) {
      const d = await r.json()
      if (d.thumbnail?.source) {
        imgCache[term] = d.thumbnail.source
        return d.thumbnail.source
      }
    }
  } catch (_) {}

  // Step 2 — OpenSearch fallback: find canonical article title
  try {
    const r = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(term)}&limit=1&format=json&origin=*`
    )
    const [, titles] = await r.json()
    const title = titles?.[0]
    if (title) {
      const r2 = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      )
      if (r2.ok) {
        const d = await r2.json()
        if (d.thumbnail?.source) {
          imgCache[term] = d.thumbnail.source
          return d.thumbnail.source
        }
      }
    }
  } catch (_) {}

  imgCache[term] = null
  return null
}

/** Fetch a Wikipedia thumbnail and return a compressed JPEG data URL */
async function wikiVariantToDataUrl(term) {
  const src = await fetchWikiImgUrl(term)
  if (!src) throw new Error(`No Wikipedia thumbnail for: ${term}`)
  return urlToBase64(src)
}

/** Build an SVG string for a shape at 400 × 400 */
function buildShapeSvg(shape, color) {
  const s = 400, cx = 200, cy = 200
  const poly = (n, r, off = -90) =>
    Array.from({ length: n }, (_, i) => {
      const a = (off + i * 360 / n) * Math.PI / 180
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
    }).join(' ')
  const star = () =>
    Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? s * 0.42 : s * 0.18
      const a = (-90 + i * 36) * Math.PI / 180
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
    }).join(' ')
  const heart = 'M200 320 C80 240,20 180,20 120 C20 60,60 32,112 32 C144 32,172 48,200 80 C228 48,256 32,288 32 C340 32,380 60,380 120 C380 180,320 240,200 320 Z'
  const els = {
    circle:    `<circle cx="200" cy="200" r="164" fill="${color}" />`,
    square:    `<rect x="40" y="40" width="320" height="320" fill="${color}" />`,
    triangle:  `<polygon points="200,32 368,352 32,352" fill="${color}" />`,
    rectangle: `<rect x="24" y="96" width="352" height="208" fill="${color}" />`,
    oval:      `<ellipse cx="200" cy="200" rx="172" ry="108" fill="${color}" />`,
    diamond:   `<polygon points="200,28 372,200 200,372 28,200" fill="${color}" />`,
    star:      `<polygon points="${star()}" fill="${color}" />`,
    heart:     `<path d="${heart}" fill="${color}" />`,
    pentagon:  `<polygon points="${poly(5, 168)}" fill="${color}" />`,
    hexagon:   `<polygon points="${poly(6, 168)}" fill="${color}" />`,
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="white"/>${els[shape] ?? ''}</svg>`
}

/** Convert an SVG string → JPEG data URL via canvas */
function svgToDataUrl(svgStr) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 400; canvas.height = 400
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 400, 400)
      ctx.drawImage(img, 0, 0, 400, 400)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG render failed')) }
    img.src = url
  })
}

/** Draw a rounded rectangle path (ctx helper) */
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Render a number in the given style to a 400 × 400 JPEG data URL */
function numberToDataUrl(value, style) {
  const canvas = document.createElement('canvas')
  canvas.width = 400; canvas.height = 400
  const ctx = canvas.getContext('2d')
  const coral = '#D9674A'

  ctx.fillStyle = '#FBF0ED'   // coralBg
  ctx.fillRect(0, 0, 400, 400)

  if (style === 'numeral') {
    ctx.fillStyle = coral
    ctx.font = 'bold 230px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(value), 200, 215)

  } else if (style === 'word') {
    const word = (NUMBER_WORDS[value] || String(value)).toUpperCase()
    ctx.fillStyle = coral
    // Scale font size so long words fit
    const fontSize = word.length > 5 ? 60 : 78
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(word, 200, 200)

  } else if (style === 'dots') {
    const n = Math.min(value, 10)
    const cols = n <= 4 ? n : n <= 9 ? 3 : 5
    const rows = Math.ceil(n / cols)
    const r = 30, gap = 14
    const totalW = cols * r * 2 + (cols - 1) * gap
    const totalH = rows * r * 2 + (rows - 1) * gap
    let idx = 0
    ctx.fillStyle = coral
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols && idx < n; col++, idx++) {
        const x = (400 - totalW) / 2 + col * (r * 2 + gap) + r
        const y = (400 - totalH) / 2 + row * (r * 2 + gap) + r
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

  } else if (style === 'tally') {
    const groups = Math.floor(value / 5), rem = value % 5
    const barW = 10, barH = 90, barGap = 12, groupPad = 28
    const groupW = 4 * (barW + barGap) - barGap + groupPad
    const totalW = groups * groupW + rem * (barW + barGap) - (rem > 0 ? barGap : 0)
    let x = (400 - totalW) / 2
    const y0 = 155
    ctx.fillStyle = coral
    ctx.strokeStyle = coral
    ctx.lineWidth = barW
    ctx.lineCap = 'round'
    for (let g = 0; g < groups; g++) {
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i * (barW + barGap), y0, barW, barH)
      }
      ctx.beginPath()
      ctx.moveTo(x - 6, y0 + barH + 8)
      ctx.lineTo(x + 3 * (barW + barGap) + barW + 6, y0 - 8)
      ctx.stroke()
      x += groupW
    }
    for (let i = 0; i < rem; i++) {
      ctx.fillRect(x + i * (barW + barGap), y0, barW, barH)
    }

  } else if (style === 'dice') {
    // Dice face (values 1–6)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 4
    rrect(ctx, 80, 80, 240, 240, 28)
    ctx.fill(); ctx.stroke()
    const positions = {
      1: [[200, 200]],
      2: [[130, 130], [270, 270]],
      3: [[130, 130], [200, 200], [270, 270]],
      4: [[130, 130], [270, 130], [130, 270], [270, 270]],
      5: [[130, 130], [270, 130], [200, 200], [130, 270], [270, 270]],
      6: [[130, 130], [270, 130], [130, 200], [270, 200], [130, 270], [270, 270]],
    }
    const pips = positions[Math.min(value, 6)] || [[200, 200]]
    ctx.fillStyle = coral
    for (const [px, py] of pips) {
      ctx.beginPath()
      ctx.arc(px, py, 22, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return canvas.toDataURL('image/jpeg', 0.82)
}

/** Render a letter to a 400 × 400 JPEG data URL */
function letterToDataUrl(value, letterCase, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 400; canvas.height = 400
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#EFF6EA'   // greenBg
  ctx.fillRect(0, 0, 400, 400)
  const letter = letterCase === 'lower' ? value.toLowerCase() : value.toUpperCase()
  ctx.fillStyle = color || '#D9674A'
  ctx.font = 'bold 248px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, 200, 215)
  return canvas.toDataURL('image/jpeg', 0.82)
}

/** Master conversion: any PictureLibrary variant → compressed JPEG data URL */
async function variantToDataUrl(variant) {
  if (variant.type === 'wiki') {
    return wikiVariantToDataUrl(variant.term)
  }
  if (variant.type === 'generalization') {
    return urlToBase64(variant.src)
  }
  if (variant.type === 'shape') {
    return svgToDataUrl(buildShapeSvg(variant.shape, variant.color))
  }
  if (variant.type === 'number') {
    return numberToDataUrl(variant.value, variant.style)
  }
  if (variant.type === 'letter') {
    return letterToDataUrl(variant.value, variant.case, variant.color)
  }
  throw new Error(`Unknown variant type: ${variant.type}`)
}

// ─── Library tab ────────────────────────────────────────────────────────────

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

// ─── Built-in tab ───────────────────────────────────────────────────────────

function BuiltinTab({ onSelect }) {
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState(null)

  const handleVariantSelect = async (variant) => {
    setConverting(true)
    setError(null)
    try {
      const dataUrl = await variantToDataUrl(variant)
      onSelect(dataUrl)
    } catch (e) {
      console.error('Stimulus conversion error:', e)
      setError('Could not load image — try another variant.')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="flex-1 min-h-0 relative flex flex-col">
      {/* Loading overlay */}
      {converting && (
        <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-b-2xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-400 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">Loading stimulus…</p>
          </div>
        </div>
      )}
      {/* Error toast */}
      {error && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-red-50 text-red-600 text-xs px-4 py-2 rounded-full shadow-md whitespace-nowrap">
          {error}
        </div>
      )}
      {/* PictureLibrary fills the remaining flex height via height="100%" */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PictureLibrary
          onSelect={handleVariantSelect}
          height="100%"
          showGeneralization={true}
        />
      </div>
    </div>
  )
}

// ─── Unsplash tab ───────────────────────────────────────────────────────────

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

// ─── Pexels tab ─────────────────────────────────────────────────────────────

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

// ─── Main picker ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'builtin',  label: '⭐ Built-in' },
  { id: 'library',  label: '📚 Library'  },
  { id: 'unsplash', label: '🔍 Unsplash' },
  { id: 'pexels',   label: '🌿 Pexels'   },
]

export function ImagePicker({ targetName, onSelect, onClose, defaultTab = 'builtin' }) {
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
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
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
          {tab === 'builtin'  && <BuiltinTab  onSelect={onSelect} />}
          {tab === 'library'  && <LibraryTab  onSelect={onSelect} />}
          {tab === 'unsplash' && <UnsplashTab targetName={targetName} onSelect={onSelect} />}
          {tab === 'pexels'   && <PexelsTab   targetName={targetName} onSelect={onSelect} />}
        </div>
      </div>
    </div>
  )
}
