import { useState, useEffect } from 'react'

export function SettingsPanel({ onClose }) {
  const [unsplashKey, setUnsplashKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setUnsplashKey(localStorage.getItem('unsplash_access_key') || '')
  }, [])

  const handleSave = () => {
    localStorage.setItem('unsplash_access_key', unsplashKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Unsplash API Key
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Free at{' '}
              <a href="https://unsplash.com/developers" target="_blank" rel="noreferrer"
                className="text-indigo-600 underline">
                unsplash.com/developers
              </a>
              {' '}→ New Application → copy the <strong>Access Key</strong>.
              Enables searching millions of real photos for each stimulus target.
            </p>
            <input
              type="password"
              placeholder="Paste your Unsplash Access Key…"
              value={unsplashKey}
              onChange={e => setUnsplashKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
