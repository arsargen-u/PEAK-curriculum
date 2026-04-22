import { useState, useEffect, useRef } from 'react'
import {
  getAllLibraryImages,
  addLibraryImage,
  updateLibraryImage,
  deleteLibraryImage,
  importLibraryImages,
} from '../../store/db'
import { compressImage } from '../../utils/imageUtils'

// ── Default folders aligned to PEAK program content areas ──────────────────
const DEFAULT_FOLDERS = [
  { id: 'animals',    label: '🐾 Animals' },
  { id: 'food',       label: '🍎 Food & Drinks' },
  { id: 'vehicles',   label: '🚗 Vehicles' },
  { id: 'household',  label: '🏠 Household Items' },
  { id: 'body',       label: '🖐 Body Parts' },
  { id: 'actions',    label: '🏃 Actions & Verbs' },
  { id: 'shapes',     label: '🔴 Colors & Shapes' },
  { id: 'community',  label: '👩‍⚕️ Community Helpers' },
  { id: 'clothing',   label: '👕 Clothing' },
  { id: 'nature',     label: '🌿 Nature & Plants' },
  { id: 'numbers',    label: '🔢 Numbers & Letters' },
  { id: 'emotions',   label: '😊 Emotions' },
  { id: 'care',       label: '🪥 Personal Care' },
  { id: 'school',     label: '✏️ School Items' },
]

function loadFolders() {
  try {
    const custom = JSON.parse(localStorage.getItem('library_custom_folders') ?? '[]')
    return [...DEFAULT_FOLDERS, ...custom]
  } catch { return DEFAULT_FOLDERS }
}

function saveCustomFolders(allFolders) {
  const custom = allFolders.filter(f => !DEFAULT_FOLDERS.find(d => d.id === f.id))
  localStorage.setItem('library_custom_folders', JSON.stringify(custom))
}

// ── Upload modal ────────────────────────────────────────────────────────────
function UploadModal({ folders, defaultFolder, onUpload, onClose }) {
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder ?? '')
  const [files, setFiles] = useState([])
  const fileRef = useRef(null)

  const folderLabel = folders.find(f => f.id === selectedFolder)?.label ?? ''

  const handleConfirm = async () => {
    if (!files.length) return
    await onUpload(files, selectedFolder)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Upload Images</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        {/* Folder picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Add to folder</label>
          <select
            value={selectedFolder}
            onChange={e => setSelectedFolder(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">— No folder (All Images) —</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* File picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Choose files</label>
          <button
            onClick={() => fileRef.current.click()}
            className={`w-full border-2 border-dashed rounded-xl py-6 text-center text-sm transition-colors ${
              files.length ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-400 hover:border-indigo-300'
            }`}
          >
            {files.length
              ? `${files.length} file${files.length !== 1 ? 's' : ''} selected — tap to change`
              : 'Tap to select photos from your device'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => setFiles(Array.from(e.target.files))}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!files.length}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Upload {files.length > 0 ? `(${files.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Import confirmation modal ────────────────────────────────────────────────
function ImportModal({ data, onConfirm, onClose }) {
  const imgCount    = data.images?.length ?? 0
  const folderCount = data.customFolders?.length ?? 0
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Import Library</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800 space-y-1">
          <p className="font-semibold">File contents:</p>
          <p>📸 {imgCount} image{imgCount !== 1 ? 's' : ''}</p>
          {folderCount > 0 && <p>📁 {folderCount} custom folder{folderCount !== 1 ? 's' : ''}</p>}
          {data.exportedAt && (
            <p className="text-xs text-indigo-500 mt-1">
              Exported {new Date(data.exportedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-600">How would you like to import?</p>

        <div className="space-y-2">
          <button
            onClick={() => onConfirm(false)}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
          >
            ＋ Add to existing library
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 active:scale-95 transition-all"
          >
            ↺ Replace everything
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function LibraryManager() {
  const [folders, setFolders] = useState(loadFolders)
  const [activeFolder, setActiveFolder] = useState('__all__')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editFolder, setEditFolder] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const importFileRef = useRef(null)

  const reload = async () => {
    setLoading(true)
    try { setImages(await getAllLibraryImages()) }
    finally { setLoading(false) }
  }

  useEffect(() => { reload() }, [])

  // ── Derived: images visible in current folder + search ───────────────────
  const visible = images.filter(img => {
    const inFolder =
      activeFolder === '__all__' ? true :
      activeFolder === '__none__' ? !img.category :
      img.category === activeFolder
    const matchesQuery = !query.trim() || img.label?.toLowerCase().includes(query.toLowerCase())
    return inFolder && matchesQuery
  })

  // ── Folder counts ────────────────────────────────────────────────────────
  const countFor = (folderId) => images.filter(img => img.category === folderId).length
  const uncategorisedCount = images.filter(img => !img.category).length

  // ── Upload handler ───────────────────────────────────────────────────────
  const handleUpload = async (files, folderId) => {
    for (const file of files) {
      const label = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const raw = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = ev => resolve(ev.target.result)
        reader.readAsDataURL(file)
      })
      const imageData = await compressImage(raw)
      await addLibraryImage({ label, imageData, source: 'upload', category: folderId || null })
    }
    reload()
    if (folderId) setActiveFolder(folderId)
  }

  // ── Export library ───────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true)
    try {
      const allImages = await getAllLibraryImages()
      const customFolders = folders.filter(f => !DEFAULT_FOLDERS.find(d => d.id === f.id))
      const payload = {
        peakLibraryVersion: 1,
        exportedAt: new Date().toISOString(),
        customFolders,
        images: allImages.map(({ label, category, imageData, source }) => ({
          label, category, imageData, source,
        })),
      }
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `PEAK-library-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  // ── Import library ───────────────────────────────────────────────────────
  const handleImportFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''   // reset so same file can be re-selected
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.peakLibraryVersion || !Array.isArray(data.images)) {
          throw new Error('Not a valid PEAK library file')
        }
        setPendingImport(data)
      } catch (err) {
        alert('Could not read library file: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = async (replace) => {
    if (!pendingImport) return
    setImporting(true)
    try {
      // Merge custom folders (skip ones already present)
      if (pendingImport.customFolders?.length) {
        const existingIds = new Set(folders.map(f => f.id))
        const newFolders  = pendingImport.customFolders.filter(f => !existingIds.has(f.id))
        if (newFolders.length) {
          const updated = [...folders, ...newFolders]
          setFolders(updated)
          saveCustomFolders(updated)
        }
      }
      await importLibraryImages(pendingImport.images, replace)
      setPendingImport(null)
      await reload()
    } finally {
      setImporting(false)
    }
  }

  // ── Create new folder ────────────────────────────────────────────────────
  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    const id = 'custom_' + Date.now()
    const updated = [...folders, { id, label: '📁 ' + name }]
    setFolders(updated)
    saveCustomFolders(updated)
    setNewFolderName('')
    setShowNewFolder(false)
    setActiveFolder(id)
  }

  // ── Delete folder (custom only) ──────────────────────────────────────────
  const handleDeleteFolder = (folderId) => {
    if (!window.confirm('Delete this folder? Images inside will move to All Images.')) return
    const updated = folders.filter(f => f.id !== folderId)
    setFolders(updated)
    saveCustomFolders(updated)
    if (activeFolder === folderId) setActiveFolder('__all__')
    // Clear category on images in deleted folder
    images
      .filter(img => img.category === folderId)
      .forEach(img => updateLibraryImage(img.id, { category: null }))
    reload()
  }

  // ── Edit save ────────────────────────────────────────────────────────────
  const handleSaveEdit = async (id) => {
    await updateLibraryImage(id, { label: editLabel.trim(), category: editFolder || null })
    setEditingId(null)
    reload()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this image from the library?')) return
    await deleteLibraryImage(id)
    reload()
  }

  const startEdit = (img) => {
    setEditingId(img.id)
    setEditLabel(img.label ?? '')
    setEditFolder(img.category ?? '')
  }

  const isCustomFolder = (folderId) => !DEFAULT_FOLDERS.find(f => f.id === folderId)

  return (
    <div className="flex h-full bg-gray-50">

      {/* ── Folder sidebar ─────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Folders</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* All Images */}
          <FolderRow
            label="🗂 All Images"
            count={images.length}
            active={activeFolder === '__all__'}
            onClick={() => setActiveFolder('__all__')}
          />
          {/* Uncategorised */}
          {uncategorisedCount > 0 && (
            <FolderRow
              label="📂 Uncategorised"
              count={uncategorisedCount}
              active={activeFolder === '__none__'}
              onClick={() => setActiveFolder('__none__')}
            />
          )}

          <div className="my-2 border-t border-gray-100" />

          {/* All folders */}
          {folders.map(folder => (
            <FolderRow
              key={folder.id}
              label={folder.label}
              count={countFor(folder.id)}
              active={activeFolder === folder.id}
              onClick={() => setActiveFolder(folder.id)}
              onDelete={isCustomFolder(folder.id) ? () => handleDeleteFolder(folder.id) : null}
            />
          ))}
        </div>

        {/* New folder */}
        <div className="p-3 border-t border-gray-100">
          {showNewFolder ? (
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false) }}
                placeholder="Folder name…"
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-1.5">
                <button onClick={handleCreateFolder} className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Create</button>
                <button onClick={() => setShowNewFolder(false)} className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolder(true)}
              className="w-full py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              + New Folder
            </button>
          )}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex gap-2 items-center flex-shrink-0 flex-wrap">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by label…"
            className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* Upload */}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors active:scale-95 flex-shrink-0"
          >
            ↑ Upload
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting || images.length === 0}
            title="Export library as a shareable file"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors active:scale-95 flex-shrink-0"
          >
            {exporting ? '…' : '⬇ Export'}
          </button>

          {/* Import */}
          <button
            onClick={() => importFileRef.current?.click()}
            disabled={importing}
            title="Import a library file from another device"
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors active:scale-95 flex-shrink-0"
          >
            {importing ? '…' : '⬆ Import'}
          </button>

          {/* Hidden file input for import */}
          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFileChange}
          />
        </div>

        {/* Folder heading */}
        <div className="px-5 pt-4 pb-1 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">
            {activeFolder === '__all__' ? 'All Images' :
             activeFolder === '__none__' ? 'Uncategorised' :
             folders.find(f => f.id === activeFolder)?.label ?? 'Folder'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {visible.length} image{visible.length !== 1 ? 's' : ''}
            {query && ` matching "${query}"`}
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
          ) : visible.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-5xl">🖼️</p>
              <p className="text-gray-500 font-medium">
                {query ? 'No images match that search' : 'This folder is empty'}
              </p>
              <p className="text-gray-400 text-sm">
                {query ? 'Try a different search term' : 'Tap ↑ Upload to add images here'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map(img => (
                <div key={img.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img src={img.imageData} alt={img.label} className="w-full h-full object-cover" />
                  </div>

                  {editingId === img.id ? (
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        placeholder="Label"
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit(img.id)}
                        autoFocus
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <select
                        value={editFolder}
                        onChange={e => setEditFolder(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      >
                        <option value="">— No folder —</option>
                        {folders.map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleSaveEdit(img.id)} className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">Save</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-800 truncate">{img.label || '(no label)'}</p>
                      {img.category && (
                        <p className="text-xs text-indigo-400 truncate mt-0.5">
                          {folders.find(f => f.id === img.category)?.label ?? img.category}
                        </p>
                      )}
                      <div className="flex gap-1.5 mt-2">
                        <button onClick={() => startEdit(img)} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">✏ Edit</button>
                        <button onClick={() => handleDelete(img.id)} className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium transition-colors">✕</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          folders={folders}
          defaultFolder={activeFolder === '__all__' || activeFolder === '__none__' ? '' : activeFolder}
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Import confirmation modal */}
      {pendingImport && (
        <ImportModal
          data={pendingImport}
          onConfirm={handleConfirmImport}
          onClose={() => setPendingImport(null)}
        />
      )}
    </div>
  )
}

// ── Folder row helper ────────────────────────────────────────────────────────
function FolderRow({ label, count, active, onClick, onDelete }) {
  return (
    <div className={`group flex items-center gap-2 px-3 py-2 mx-2 rounded-xl cursor-pointer transition-colors ${
      active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
    }`} onClick={onClick}>
      <span className={`flex-1 text-sm truncate ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
      {count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
          active ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'
        }`}>{count}</span>
      )}
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs flex-shrink-0 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  )
}
