import { useState, useMemo, useEffect } from 'react'
import { STIMULUS_TYPE } from '../../data/directPrograms'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomAngle() {
  return (Math.random() - 0.5) * 18 // -9 to +9 degrees
}

function randomOffset() {
  return {
    x: (Math.random() - 0.5) * 30,
    y: (Math.random() - 0.5) * 20,
  }
}

export function QuestionInterrupt({ program, selectedTargets, arraySize, messyArray, images, onComplete }) {
  // Pick the target for this trial
  const target = useMemo(() => {
    return selectedTargets[Math.floor(Math.random() * selectedTargets.length)]
  }, [])

  // Build the array: target + distractors, shuffled
  const arrayItems = useMemo(() => {
    const distractors = shuffle(selectedTargets.filter(s => s !== target))
      .slice(0, arraySize - 1)
    return shuffle([target, ...distractors])
  }, [target, selectedTargets, arraySize])

  // Random positioning for messy array
  const positions = useMemo(() => {
    return arrayItems.map(() => ({
      angle: messyArray ? randomAngle() : 0,
      offset: messyArray ? randomOffset() : { x: 0, y: 0 },
    }))
  }, [arrayItems, messyArray])

  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('learner') // 'learner' | 'therapist'

  const isReceptive = program.stimulusType === STIMULUS_TYPE.RECEPTIVE ||
                      program.stimulusType === STIMULUS_TYPE.MATCH ||
                      program.stimulusType === STIMULUS_TYPE.DISCRIMINATION

  const handleLearnerSelect = (item) => {
    if (phase !== 'learner') return
    setSelected(item)
    setPhase('therapist')
  }

  const handleTherapistScore = (correct) => {
    const score = correct ? 10 : 0
    onComplete({ target, selected, correct, score })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
      {/* Top bar with SD */}
      <div className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
        <div>
          <p className="text-xs text-indigo-200 font-medium uppercase tracking-wide">{program.code} · {program.name}</p>
          <p className="text-xl font-bold mt-0.5">
            {isReceptive
              ? program.sd.replace('___', `"${target}"`)
              : program.sd}
          </p>
        </div>
        {phase === 'learner' && (
          <div className="text-right">
            <p className="text-xs text-indigo-200">Learner's turn</p>
            <p className="text-sm font-medium">Tap the correct picture</p>
          </div>
        )}
        {phase === 'therapist' && (
          <div className="text-right">
            <p className="text-xs text-indigo-200">Therapist's turn</p>
            <p className="text-sm font-medium">Was the response correct?</p>
          </div>
        )}
      </div>

      {/* Tact: show single picture prominently */}
      {program.stimulusType === STIMULUS_TYPE.TACT && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8">
          <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-indigo-200 shadow-xl bg-gray-100 flex items-center justify-center">
            {images[target] ? (
              <img src={images[target]} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl select-none">🖼️</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{program.sd}</p>
        </div>
      )}

      {/* Receptive / Match / Discrimination: picture array */}
      {program.stimulusType !== STIMULUS_TYPE.TACT && (
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-2 overflow-auto">
          <div className={`flex flex-wrap items-center justify-center gap-4 ${messyArray ? 'relative' : ''}`}>
            {arrayItems.map((item, idx) => {
              const pos = positions[idx]
              const isSelected = selected === item
              return (
                <button
                  key={idx}
                  onClick={() => handleLearnerSelect(item)}
                  disabled={phase === 'therapist'}
                  style={{
                    transform: `rotate(${pos.angle}deg) translate(${pos.offset.x}px, ${pos.offset.y}px)`,
                    transition: 'transform 0.1s ease',
                  }}
                  className={`
                    relative flex flex-col items-center gap-2 rounded-2xl p-2 border-4 transition-all duration-150
                    ${isSelected
                      ? 'border-indigo-500 shadow-xl scale-105 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md active:scale-95'}
                    ${phase === 'therapist' && !isSelected ? 'opacity-50' : ''}
                  `}
                >
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                    {images[item] ? (
                      <img src={images[item]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl select-none">🖼️</span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Therapist scoring overlay */}
      {phase === 'therapist' && (
        <div className="border-t border-gray-200 bg-gray-50 px-8 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Target:</span>{' '}
              <span className="text-indigo-700 font-semibold">{target}</span>
              {selected && (
                <>
                  {' · '}
                  <span className="font-medium">Learner selected:</span>{' '}
                  <span className="font-semibold">{selected}</span>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleTherapistScore(false)}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg active:scale-95 transition-all shadow"
              >
                ✗ Incorrect
              </button>
              <button
                onClick={() => handleTherapistScore(true)}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg active:scale-95 transition-all shadow"
              >
                ✓ Correct
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learner prompt footer */}
      {phase === 'learner' && (
        <div className="border-t border-gray-100 px-8 py-2 bg-gray-50 text-center flex-shrink-0">
          <p className="text-sm text-gray-400">
            {arrayItems.length} choices · {messyArray ? 'messy array' : 'linear array'}
          </p>
        </div>
      )}
    </div>
  )
}
