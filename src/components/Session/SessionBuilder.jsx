import { useState, useRef } from 'react'
import { STIMULUS_TYPE } from '../../data/directPrograms'
import { saveImage, getProgramImages } from '../../store/db'
import { Badge } from '../UI/Badge'

const TYPE_LABELS = {
  [STIMULUS_TYPE.RECEPTIVE]: { label: 'Receptive', color: 'blue' },
  [STIMULUS_TYPE.TACT]: { label: 'Tact', color: 'green' },
  [STIMULUS_TYPE.MATCH]: { label: 'Match', color: 'amber' },
  [STIMULUS_TYPE.DISCRIMINATION]: { label: 'Discrimination', color: 'rose' },
}

export function SessionBuilder({ program, onStartSession, onBack }) {
  const [arraySize, setArraySize] = useState(program.arraySize.default)
  const [messyArray, setMessyArray] = useState(false)
  const [selectedTargets, setSelectedTargets] = useState(
    program.typicalStimuli.slice(0, program.arraySize.default)
  )
  const [images, setImages] = useState({}) // targetName -> dataUrl
  const [customTarget, setCustomTarget] = useState('')
  const fileInputRef = useRef(null)
  const [pendingImageTarget, setPendingImageTarget] = useState(null)

  const typeInfo = TYPE_LABELS[program.stimulusType] ?? { label: program.stimulusType, color: 'gray' }

  const toggleTarget = (stimulus) => {
    setSelectedTargets(prev =>
      prev.includes(stimulus)
        ? prev.filter(s => s !== stimulus)
        : [...prev, stimulus]
    )
  }

  const addCustomTarget = () => {
    const t = customTarget.trim()
    if (t && !selectedTargets.includes(t)) {
      setSelectedTargets(prev => [...prev, t])
    }
    setCustomTarget('')
  }

  const handleImageUpload = (targetName, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setImages(prev => ({ ...prev, [targetName]: dataUrl }))
      await saveImage(program.id, targetName, dataUrl, 'upload')
    }
    reader.readAsDataURL(file)
  }

  const canStart = selectedTargets.length >= 2

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
        >
          ← Library
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">{program.code}</span>
            <Badge color={typeInfo.color}>{typeInfo.label}</Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">{program.name}</h2>
        </div>
        <button
          onClick={() => canStart && onStartSession({ program, selectedTargets, arraySize, messyArray, images })}
          disabled={!canStart}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Start Session →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>SD:</strong> "{program.sd}"
          <p className="mt-1 text-blue-700">{program.instructions}</p>
        </div>

        {/* Array settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Array Settings</h3>
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Array size</label>
              <div className="flex items-center gap-2">
                {Array.from({ length: program.arraySize.max - program.arraySize.min + 1 }, (_, i) => i + program.arraySize.min).map(n => (
                  <button
                    key={n}
                    onClick={() => setArraySize(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      arraySize === n
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Messy array</label>
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
              <span className="text-xs text-gray-500">{messyArray ? 'On — cards shown at random angles' : 'Off — cards in a row'}</span>
            </div>
          </div>
        </div>

        {/* Target stimuli */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Target Stimuli</h3>
            <span className="text-sm text-gray-500">{selectedTargets.length} selected</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {program.typicalStimuli.map(stimulus => {
              const selected = selectedTargets.includes(stimulus)
              return (
                <button
                  key={stimulus}
                  onClick={() => toggleTarget(stimulus)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {stimulus}
                </button>
              )
            })}
          </div>

          {/* Add custom target */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom target…"
              value={customTarget}
              onChange={e => setCustomTarget(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTarget()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={addCustomTarget}
              className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Image manager */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Stimulus Images</h3>
          <p className="text-xs text-gray-500 mb-4">Upload an image for each target. Targets without images will display their text label during the session.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedTargets.map(target => (
              <div key={target} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    setPendingImageTarget(target)
                    fileInputRef.current.click()
                  }}
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 flex flex-col items-center justify-center overflow-hidden transition-colors bg-gray-50"
                >
                  {images[target] ? (
                    <img src={images[target]} alt={target} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl text-gray-300">+</span>
                  )}
                </button>
                <span className="text-xs text-gray-600 font-medium text-center truncate w-full">{target}</span>
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              if (pendingImageTarget) handleImageUpload(pendingImageTarget, e)
              setPendingImageTarget(null)
            }}
          />
        </div>

        {!canStart && (
          <p className="text-center text-sm text-amber-600 bg-amber-50 rounded-lg py-3">
            Select at least 2 targets to start a session
          </p>
        )}
      </div>
    </div>
  )
}
