import { useState, useRef } from 'react'
import { STIMULUS_TYPE } from '../../data/directPrograms'
import { saveImage, getProgramImages } from '../../store/db'
import { Badge } from '../UI/Badge'
import { ImagePicker } from '../Library/ImagePicker'

const TYPE_LABELS = {
  [STIMULUS_TYPE.RECEPTIVE]: { label: 'Receptive', color: 'blue' },
  [STIMULUS_TYPE.TACT]: { label: 'Tact', color: 'green' },
  [STIMULUS_TYPE.MATCH]: { label: 'Match', color: 'amber' },
  [STIMULUS_TYPE.DISCRIMINATION]: { label: 'Discrimination', color: 'rose' },
}

export function SessionBuilder({ program, onStartSession, onBack }) {
  const hasGroups = Boolean(program.stimulusGroups?.length)

  const [arraySize, setArraySize] = useState(program.arraySize.default)
  const [messyArray, setMessyArray] = useState(false)
  // For grouped programs (doesn't belong / sort): track selected group ids
  const [selectedGroupIds, setSelectedGroupIds] = useState(
    hasGroups ? program.stimulusGroups.map(g => g.id) : []
  )
  // For non-grouped programs: flat list of selected targets
  const [selectedTargets, setSelectedTargets] = useState(
    hasGroups ? [] : program.typicalStimuli.slice(0, program.arraySize.default)
  )
  const [images, setImages] = useState({}) // targetName -> dataUrl
  const [customTarget, setCustomTarget] = useState('')
  const fileInputRef = useRef(null)
  const [pendingImageTarget, setPendingImageTarget] = useState(null)
  const [pickerTarget, setPickerTarget] = useState(null)
  const [pickerDefaultTab, setPickerDefaultTab] = useState('library')
  const [promptType, setPromptType] = useState('none')      // 'none' | 'positional' | 'stimulus'
  const [promptFading, setPromptFading] = useState('none')  // 'none' | 'fade3' | 'fade5' | 'fade10'

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

  // Derived: all individual items that will be used (for image manager)
  const activeItems = hasGroups
    ? [...new Set(
        program.stimulusGroups
          .filter(g => selectedGroupIds.includes(g.id))
          .flatMap(g => [...g.items, g.outlier])
      )]
    : selectedTargets

  // Derived: trial sets for the session config
  const trialSets = hasGroups
    ? program.stimulusGroups.filter(g => selectedGroupIds.includes(g.id))
    : null

  const canStart = hasGroups ? selectedGroupIds.length >= 1 : selectedTargets.length >= 2

  const toggleGroup = (groupId) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    )
  }

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
          onClick={() => canStart && onStartSession({
            program,
            selectedTargets: activeItems,
            arraySize,
            messyArray,
            images,
            promptConfig: { type: promptType, fading: promptFading },
            trialSets,
          })}
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
                {Array.from({ length: program.arraySize.max - 2 + 1 }, (_, i) => i + 2).map(n => (
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

        {/* Prompting */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Prompting</h3>
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
                    className={`flex-1 py-2 px-2 rounded-lg text-sm font-semibold transition-all text-center ${
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
                {promptType === 'positional' && 'Correct card appears slightly elevated as a spatial cue.'}
                {promptType === 'stimulus' && 'Correct card has a colored glow border as a visual cue.'}
                {promptType === 'none' && 'No prompt — independent responding.'}
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
                <p className="text-xs text-gray-400 mt-1.5">
                  {promptFading === 'none' && 'Prompt stays on every trial.'}
                  {promptFading === 'fade3' && 'Prompt automatically removed after 3 consecutive correct responses.'}
                  {promptFading === 'fade5' && 'Prompt automatically removed after 5 consecutive correct responses.'}
                  {promptFading === 'fade10' && 'Prompt automatically removed after 10 consecutive correct responses.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Target stimuli — grouped programs (doesn't belong / sort) */}
        {hasGroups && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Trial Sets</h3>
              <span className="text-sm text-gray-500">{selectedGroupIds.length} selected</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Each set shows 2 similar items + 1 that doesn't belong. Select which sets to use in this session.</p>
            <div className="space-y-3">
              {program.stimulusGroups.map(group => {
                const isSelected = selectedGroupIds.includes(group.id)
                return (
                  <button
                    key={group.id}
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 text-xs font-bold ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{group.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-gray-600">{group.items.join(', ')}</span>
                        <span className="text-gray-400"> + </span>
                        <span className="text-red-500 font-medium">{group.outlier} (outlier)</span>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Target stimuli — standard programs */}
        {!hasGroups && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Target Stimuli</h3>
              <span className="text-sm text-gray-500">{selectedTargets.length} selected</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {program.typicalStimuli.map(stimulus => {
                const sel = selectedTargets.includes(stimulus)
                return (
                  <button
                    key={stimulus}
                    onClick={() => toggleTarget(stimulus)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sel ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        )}

        {/* Image manager */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Stimulus Images</h3>
          <p className="text-xs text-gray-500 mb-4">Add images by searching Unsplash or uploading from your device. Targets without images show a placeholder during the session.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeItems.map(target => (
              <div key={target} className="flex flex-col items-center gap-2">
                {/* Image preview / tap area */}
                <div
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center"
                >
                  {images[target] ? (
                    <img src={images[target]} alt={target} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-200">🖼️</span>
                  )}
                </div>
                <span className="text-xs text-gray-600 font-medium text-center truncate w-full">{target}</span>
                {/* Action buttons */}
                <div className="flex gap-1 w-full">
                  <button
                    onClick={() => { setPickerTarget(target); setPickerDefaultTab('library') }}
                    className="flex-1 flex items-center justify-center px-1.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                    title="Pick from library"
                  >
                    📚
                  </button>
                  <button
                    onClick={() => { setPickerTarget(target); setPickerDefaultTab('unsplash') }}
                    className="flex-1 flex items-center justify-center px-1.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition-colors"
                    title="Search Unsplash"
                  >
                    🔍
                  </button>
                  <button
                    onClick={() => { setPickerTarget(target); setPickerDefaultTab('pexels') }}
                    className="flex-1 flex items-center justify-center px-1.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                    title="Search Pexels"
                  >
                    🌿
                  </button>
                  <button
                    onClick={() => {
                      setPendingImageTarget(target)
                      fileInputRef.current.click()
                    }}
                    className="flex-1 flex items-center justify-center px-1.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                    title="Upload from device"
                  >
                    ↑
                  </button>
                </div>
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

        {/* Image picker modal (Library / Unsplash / Google) */}
        {pickerTarget && (
          <ImagePicker
            targetName={pickerTarget}
            defaultTab={pickerDefaultTab}
            onSelect={async (dataUrl) => {
              setImages(prev => ({ ...prev, [pickerTarget]: dataUrl }))
              await saveImage(program.id, pickerTarget, dataUrl, pickerDefaultTab)
              setPickerTarget(null)
            }}
            onClose={() => setPickerTarget(null)}
          />
        )}

        {!canStart && (
          <p className="text-center text-sm text-amber-600 bg-amber-50 rounded-lg py-3">
            Select at least 2 targets to start a session
          </p>
        )}
      </div>
    </div>
  )
}
