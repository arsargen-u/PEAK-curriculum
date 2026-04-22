import { useState, useEffect, useRef } from 'react'
import {
  saveProgram, saveImage, getProgramImages,
  saveVariant, getProgramVariants, clearTargetVariants,
} from '../../store/db'
import { compressImage } from '../../utils/imageUtils'
import { ImagePicker } from '../Library/ImagePicker'

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

export function ProgramEditor({ program, onStartSession, onBack }) {
  const isNew = !program?.id

  // ── Core program settings ────────────────────────────────────────────────
  const [name,            setName]            = useState(program?.name ?? '')
  const [trialType,       setTrialType]       = useState(program?.trialType ?? 'array')
  const [sd,              setSd]              = useState(program?.sd ?? '')
  const [targets,         setTargets]         = useState(program?.targets ?? [])
  const [arraySize,       setArraySize]       = useState(program?.arraySize ?? 3)
  const [messyArray,      setMessyArray]      = useState(program?.messyArray ?? false)
  const [promptType,      setPromptType]      = useState(program?.promptType ?? 'none')
  const [promptFading,    setPromptFading]    = useState(program?.promptFading ?? 'none')
  const [errorCorrection, setErrorCorrection] = useState(program?.errorCorrection ?? false)

  // ── Images ───────────────────────────────────────────────────────────────
  const [images,       setImages]       = useState({})
  const [imageVariants, setImageVariants] = useState({})
  const [variantIds,   setVariantIds]   = useState({})
  const [imagesLoaded, setImagesLoaded] = useState(isNew)

  // ── Image picker / upload ────────────────────────────────────────────────
  const fileInputRef         = useRef(null)
  const [pendingUploadTarget, setPendingUploadTarget] = useState(null)
  const [pickerTarget,        setPickerTarget]        = useState(null)
  const [pickerDefaultTab,    setPickerDefaultTab]    = useState('library')
  const [pickerMode,          setPickerMode]          = useState('primary')

  // ── Target input + suggestions ───────────────────────────────────────────
  const [targetInput,            setTargetInput]            = useState('')
  const [stimSuggestions,        setStimSuggestions]        = useState([])
  const [stimSuggestionsLoading, setStimSuggestionsLoading] = useState(false)

  // ── Load images from DB for existing programs ────────────────────────────
  useEffect(() => {
    if (isNew) return
    async function load() {
      const [imgs, variants] = await Promise.all([
        getProgramImages(program.id),
        getProgramVariants(program.id),
      ])
      const imgMap = {}
      for (const img of imgs) imgMap[img.targetName] = img.imageData
      setImages(imgMap)

      const varMap = {}, idMap = {}
      for (const [t, items] of Object.entries(variants)) {
        varMap[t] = items.map(v => v.imageData)
        idMap[t]  = items.map(v => v.id)
      }
      setImageVariants(varMap)
      setVariantIds(idMap)
      setImagesLoaded(true)
    }
    load()
  }, [program?.id, isNew])

  // ── Debounced Unsplash suggestions ───────────────────────────────────────
  useEffect(() => {
    const apiKey = localStorage.getItem('unsplash_access_key')
    if (!apiKey || targetInput.trim().length < 2) { setStimSuggestions([]); return }
    setStimSuggestionsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(targetInput.trim())}&per_page=12&orientation=squarish`,
          { headers: { Authorization: `Client-ID ${apiKey}` } }
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        const photos = data.results ?? []
        const labelMap = new Map()
        photos.forEach(photo => {
          const tags = photo.tags ?? []
          const mainTag = tags.find(t => t.type === 'landing_page') ?? tags[0]
          if (mainTag?.title) {
            const label = mainTag.title.toLowerCase()
            if (!labelMap.has(label)) labelMap.set(label, { count: 1, photo })
            else labelMap.get(label).count++
          }
        })
        const sorted = [...labelMap.entries()]
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 8)
          .map(([label, { photo }]) => ({ label, thumbUrl: photo.urls.thumb, smallUrl: photo.urls.small }))
        setStimSuggestions(sorted)
      } catch { setStimSuggestions([]) }
      finally { setStimSuggestionsLoading(false) }
    }, 600)
    return () => { clearTimeout(timer); setStimSuggestionsLoading(false) }
  }, [targetInput])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addTarget = () => {
    const t = targetInput.trim()
    if (!t || targets.includes(t)) return
    setTargets(prev => [...prev, t])
    setTargetInput('')
    setStimSuggestions([])
  }

  const removeTarget = (t) => {
    setTargets(prev => prev.filter(x => x !== t))
    setImages(prev => { const n = { ...prev }; delete n[t]; return n })
    setImageVariants(prev => { const n = { ...prev }; delete n[t]; return n })
  }

  const addSuggestion = async (suggestion) => {
    const t = suggestion.label
    if (targets.includes(t)) return
    setTargets(prev => [...prev, t])
    setTargetInput('')
    setStimSuggestions([])
    try {
      const dataUrl = await urlToBase64(suggestion.smallUrl)
      setImages(prev => ({ ...prev, [t]: dataUrl }))
      if (!isNew) await saveImage(program.id, t, dataUrl, 'unsplash')
    } catch { /* target added without image */ }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file || !pendingUploadTarget) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = await compressImage(ev.target.result)
      setImages(prev => ({ ...prev, [pendingUploadTarget]: dataUrl }))
      if (!isNew) await saveImage(program.id, pendingUploadTarget, dataUrl, 'upload')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setPendingUploadTarget(null)
  }

  const handlePickerSelect = async (dataUrl) => {
    if (pickerMode === 'variant') {
      if (!isNew) {
        const newId = await saveVariant(program.id, pickerTarget, dataUrl)
        setImageVariants(prev => ({ ...prev, [pickerTarget]: [...(prev[pickerTarget] ?? []), dataUrl] }))
        setVariantIds(prev => ({ ...prev, [pickerTarget]: [...(prev[pickerTarget] ?? []), newId] }))
      } else {
        setImageVariants(prev => ({ ...prev, [pickerTarget]: [...(prev[pickerTarget] ?? []), dataUrl] }))
      }
    } else {
      setImages(prev => ({ ...prev, [pickerTarget]: dataUrl }))
      if (!isNew) await saveImage(program.id, pickerTarget, dataUrl, pickerDefaultTab)
    }
    setPickerTarget(null)
  }

  const handleClearVariants = async (t) => {
    if (!isNew) await clearTargetVariants(program.id, t)
    setImageVariants(prev => { const n = { ...prev }; delete n[t]; return n })
    setVariantIds(prev => { const n = { ...prev }; delete n[t]; return n })
  }

  // ── Save + Start ─────────────────────────────────────────────────────────
  const defaultSd = trialType === 'tact' ? 'What is this?' : 'Touch the ___.'

  const handleStart = async () => {
    if (!canStart) return
    const programData = {
      name: name.trim() || 'Untitled',
      trialType,
      sd: sd.trim() || defaultSd,
      targets,
      arraySize,
      messyArray,
      promptType,
      promptFading,
      errorCorrection,
      ...(program?.id && { id: program.id }),
    }
    const savedId = await saveProgram(programData)

    // For new programs, flush all local images/variants to DB now
    if (isNew) {
      for (const [targetName, imageData] of Object.entries(images)) {
        await saveImage(savedId, targetName, imageData, 'picker')
      }
      for (const [targetName, variantList] of Object.entries(imageVariants)) {
        for (const variantData of variantList) {
          await saveVariant(savedId, targetName, variantData)
        }
      }
    }

    onStartSession({
      program: {
        id: savedId,
        name: programData.name,
        stimulusType: trialType === 'tact' ? 'tact' : 'receptive',
        sd: programData.sd,
      },
      selectedTargets: targets,
      arraySize,
      messyArray,
      images,
      imageVariants,
      promptConfig: { type: promptType, fading: promptFading },
      trialSets: null,
      errorCorrection: { enabled: errorCorrection },
    })
  }

  const effectiveArraySize = Math.min(arraySize, targets.length)
  const canStart = targets.length >= (trialType === 'tact' ? 1 : 2)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex-shrink-0"
        >
          ← Programs
        </button>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Program name…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-semibold text-sm active:scale-95 transition-all"
        >
          Start →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Trial type */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Trial Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'array', emoji: '👆', label: 'Array',
                desc: 'Learner selects the named item from a picture array — receptive identification' },
              { value: 'tact',  emoji: '🗣️', label: 'Tact',
                desc: 'Single stimulus shown — learner names it verbally' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTrialType(opt.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  trialType === opt.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Targets */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Targets</h3>
            <span className="text-xs text-gray-400">{targets.length} added</span>
          </div>

          {!imagesLoaded && (
            <p className="text-xs text-gray-400 animate-pulse mb-3">Loading saved images…</p>
          )}

          {/* Target cards */}
          <div className="space-y-4 mb-4">
            {targets.map(t => {
              const variantCount = imageVariants[t]?.length ?? 0
              return (
                <div key={t} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Image preview */}
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-white flex items-center justify-center">
                      {images[t]
                        ? <img src={images[t]} alt={t} className="w-full h-full object-cover" />
                        : <span className="text-gray-300 text-xl">🖼️</span>
                      }
                      {variantCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 bg-indigo-600 text-white text-xs font-bold px-1 rounded-full leading-tight">
                          +{variantCount}
                        </span>
                      )}
                    </div>
                    {/* Label */}
                    <span className="flex-1 font-medium text-gray-800 text-sm">{t}</span>
                    {/* Remove */}
                    <button
                      onClick={() => removeTarget(t)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 flex items-center justify-center text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Primary image source buttons */}
                  <div className="flex gap-1.5">
                    <button onClick={() => { setPickerMode('primary'); setPickerTarget(t); setPickerDefaultTab('library') }}
                      className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors" title="Library">
                      📚
                    </button>
                    <button onClick={() => { setPickerMode('primary'); setPickerTarget(t); setPickerDefaultTab('unsplash') }}
                      className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition-colors" title="Unsplash">
                      🔍
                    </button>
                    <button onClick={() => { setPickerMode('primary'); setPickerTarget(t); setPickerDefaultTab('pexels') }}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors" title="Pexels">
                      🌿
                    </button>
                    <button onClick={() => { setPendingUploadTarget(t); fileInputRef.current.click() }}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold transition-colors" title="Upload">
                      ↑
                    </button>
                  </div>

                  {/* Variant row */}
                  <div className="flex gap-1.5 mt-1.5 items-center">
                    <span className="text-xs text-gray-400 flex-shrink-0">＋ Variant:</span>
                    <button onClick={() => { setPickerMode('variant'); setPickerTarget(t); setPickerDefaultTab('library') }}
                      className="flex-1 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors" title="Variant from library">
                      📚
                    </button>
                    <button onClick={() => { setPickerMode('variant'); setPickerTarget(t); setPickerDefaultTab('unsplash') }}
                      className="flex-1 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors" title="Variant from Unsplash">
                      🔍
                    </button>
                    <button onClick={() => { setPickerMode('variant'); setPickerTarget(t); setPickerDefaultTab('pexels') }}
                      className="flex-1 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors" title="Variant from Pexels">
                      🌿
                    </button>
                    {variantCount > 0 && (
                      <button onClick={() => handleClearVariants(t)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-400 rounded-lg text-xs font-semibold transition-colors" title="Clear variants">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add target input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTarget()}
              placeholder="Add target (e.g. dog, apple, circle)…"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={addTarget}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Add
            </button>
          </div>

          {/* Unsplash suggestions */}
          {stimSuggestionsLoading && (
            <p className="text-xs text-gray-400 mt-2">Finding suggestions…</p>
          )}
          {!stimSuggestionsLoading && stimSuggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 font-medium mb-2">Suggested — tap to add with image</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {stimSuggestions.map(s => (
                  <button
                    key={s.label}
                    onClick={() => addSuggestion(s)}
                    disabled={targets.includes(s.label)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 border-transparent hover:border-indigo-400 disabled:opacity-40 disabled:cursor-default bg-gray-50 transition-all active:scale-95"
                  >
                    <img src={s.thumbUrl} alt={s.label} className="w-14 h-14 rounded-lg object-cover" />
                    <span className="text-xs text-gray-600 w-14 text-center leading-tight truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Array settings (array type only) */}
        {trialType === 'array' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Array Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-2">How many cards shown per trial</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: Math.max(0, targets.length - 1) }, (_, i) => i + 2).map(n => (
                    <button
                      key={n}
                      onClick={() => setArraySize(n)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                        effectiveArraySize === n
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  {targets.length < 2 && (
                    <span className="text-xs text-gray-400 self-center">Add at least 2 targets</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-700 font-medium">Messy array</label>
                  <p className="text-xs text-gray-400 mt-0.5">Cards at random angles and offsets</p>
                </div>
                <button
                  onClick={() => setMessyArray(m => !m)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    messyArray ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    messyArray ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instruction (SD) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Instruction</h3>
          <p className="text-xs text-gray-400 mb-2">
            Shown to therapist during trials.
            {trialType === 'array' && ' Use ___ as a placeholder for the target name.'}
          </p>
          <input
            type="text"
            value={sd}
            onChange={e => setSd(e.target.value)}
            placeholder={defaultSd}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Prompting */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Prompting</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-2">Prompt type</label>
              <div className="flex gap-2">
                {[
                  { value: 'none',       label: '🚫 None' },
                  { value: 'positional', label: '↑ Positional' },
                  { value: 'stimulus',   label: '✨ Stimulus' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setPromptType(opt.value); if (opt.value === 'none') setPromptFading('none') }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all text-center ${
                      promptType === opt.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 min-h-[1rem]">
                {promptType === 'positional' && 'Correct card floats up as a spatial/position cue.'}
                {promptType === 'stimulus'   && 'Correct card has a glowing border as a visual cue.'}
                {promptType === 'none'       && 'No prompt — independent responding.'}
              </p>
            </div>

            {promptType !== 'none' && (
              <div>
                <label className="text-sm text-gray-600 block mb-2">Prompt fading</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'none',   label: 'No fade' },
                    { value: 'fade3',  label: 'Fade after 3 ✓' },
                    { value: 'fade5',  label: 'Fade after 5 ✓' },
                    { value: 'fade10', label: 'Fade after 10 ✓' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPromptFading(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        promptFading === opt.value
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error correction */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Error Correction</h3>
              <p className="text-xs text-gray-400 mt-0.5">Re-present incorrect trials with a positional prompt</p>
            </div>
            <button
              onClick={() => setErrorCorrection(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                errorCorrection ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                errorCorrection ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {!canStart && (
          <p className="text-center text-sm text-amber-600 bg-amber-50 rounded-xl py-3 px-4">
            {trialType === 'tact'
              ? 'Add at least 1 target to start'
              : 'Add at least 2 targets to start'}
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Image picker modal */}
      {pickerTarget && (
        <ImagePicker
          targetName={pickerTarget}
          defaultTab={pickerDefaultTab}
          onSelect={handlePickerSelect}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  )
}
