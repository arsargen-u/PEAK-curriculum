import { useState, useMemo } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomAngle() { return (Math.random() - 0.5) * 18 }
function randomOffset() { return { x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 20 } }

function pickImage(item, images, imageVariants) {
  const primary = images?.[item]
  const variants = imageVariants?.[item] ?? []
  const pool = [primary, ...variants].filter(Boolean)
  return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null
}

// Renders the visual content inside a card — image if available, otherwise large text
function CardFace({ item, imgSrc }) {
  if (imgSrc) {
    return <img src={imgSrc} alt="" className="w-full h-full object-cover" />
  }
  const len = item?.length ?? 0
  return (
    <div className="w-full h-full flex items-center justify-center p-2 bg-white">
      <span className={`font-bold text-gray-800 text-center leading-tight select-none ${
        len <= 2  ? 'text-6xl' :
        len <= 5  ? 'text-4xl' :
        len <= 10 ? 'text-2xl' : 'text-base'
      }`}>
        {item}
      </span>
    </div>
  )
}

export function QuestionInterrupt({
  program,
  selectedTargets,
  arraySize,
  messyArray,
  images,
  imageVariants,
  onComplete,
  onSkip,
  promptConfig,
  consecutiveCorrects = 0,
  trialSets,
  errorCorrectionEnabled = false,
}) {
  // ── Compute target, array items, and display images once at mount ──────────
  const { target, arrayItems, displayImages } = useMemo(() => {
    let t, items

    if (trialSets && trialSets.length > 0) {
      const set = trialSets[Math.floor(Math.random() * trialSets.length)]
      t = set.outlier
      items = shuffle([...set.items, set.outlier])
    } else {
      t = selectedTargets[Math.floor(Math.random() * selectedTargets.length)]
      const distractors = shuffle(selectedTargets.filter(s => s !== t)).slice(0, arraySize - 1)
      items = shuffle([t, ...distractors])
    }

    // Pick one random exemplar per item from the image pool
    const displayImages = {}
    const allItems = new Set([...items, t])
    for (const item of allItems) {
      displayImages[item] = pickImage(item, images, imageVariants)
    }

    return { target: t, arrayItems: items, displayImages }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const positions = useMemo(
    () => arrayItems.map(() => ({
      angle:  messyArray ? randomAngle()  : 0,
      offset: messyArray ? randomOffset() : { x: 0, y: 0 },
    })),
    [arrayItems, messyArray] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const effectivePrompt = useMemo(() => {
    if (!promptConfig || promptConfig.type === 'none') return 'none'
    const thresholds = { fade3: 3, fade5: 5, fade10: 10 }
    const threshold = thresholds[promptConfig.fading]
    if (threshold !== undefined && consecutiveCorrects >= threshold) return 'none'
    return promptConfig.type
  }, [promptConfig, consecutiveCorrects])

  const isTact = program.stimulusType === 'tact'

  // ── Selection state ────────────────────────────────────────────────────────
  const [selected, setSelected] = useState(null)

  // ── Error correction state ─────────────────────────────────────────────────
  // null = normal trial | { attemptCount: number } = in error correction
  const [errorPhase, setErrorPhase] = useState(null)

  // During error correction, always force positional prompt so the correct card
  // is spatially cued regardless of session settings
  const currentPrompt = errorPhase ? 'positional' : effectivePrompt

  const handleCardTap = (item) => {
    setSelected(prev => prev === item ? null : item)
  }

  const handleScore = (correct) => {
    if (!correct && errorCorrectionEnabled && (errorPhase === null || errorPhase.attemptCount < 2)) {
      // Enter / continue error correction — reset selection and re-present same trial
      setErrorPhase(prev => ({ attemptCount: (prev?.attemptCount ?? 0) + 1 }))
      setSelected(null)
      return
    }
    onComplete({
      target,
      selected,
      correct,
      score: correct ? 10 : 0,
      errorCorrected: errorPhase !== null,
      errorAttempts: errorPhase?.attemptCount ?? 0,
    })
  }

  const handleSkip = () => {
    if (onSkip) onSkip()
    else onComplete({ target, selected: null, correct: false, skipped: true })
  }

  const canScore = isTact || selected !== null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">

      {/* ── Top bar ── */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0">
        <button
          onClick={handleSkip}
          className="flex-shrink-0 text-indigo-200 hover:text-white text-sm font-medium px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          ← Skip
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-200 font-medium uppercase tracking-wide truncate">
            {program.name}
          </p>
          <p className="text-lg font-bold mt-0.5 leading-tight">
            {!isTact
              ? program.sd.replace('___', `"${target}"`)
              : program.sd}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          {isTact ? (
            <>
              <p className="text-xs text-indigo-200">Learner responds verbally</p>
              <p className="text-sm font-medium">Score below</p>
            </>
          ) : selected ? (
            <>
              <p className="text-xs text-indigo-200">Card selected</p>
              <p className="text-sm font-medium">Score or change</p>
            </>
          ) : (
            <>
              <p className="text-xs text-indigo-200">Learner's turn</p>
              <p className="text-sm font-medium">Tap a card</p>
            </>
          )}
        </div>
      </div>

      {/* ── Error correction banner ── */}
      {errorPhase && (
        <div className="bg-orange-100 border-b border-orange-300 px-5 py-2 flex items-center gap-3 flex-shrink-0">
          <span className="text-orange-700 text-sm font-bold">⚠️ Error Correction</span>
          <span className="text-orange-600 text-sm">
            Attempt {errorPhase.attemptCount} of 2 · positional prompt applied · tap ← Skip to move on
          </span>
        </div>
      )}

      {/* ── Prompt indicator (normal mode only) ── */}
      {!errorPhase && currentPrompt !== 'none' && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-1.5 flex-shrink-0">
          <span className="text-amber-600 text-xs font-semibold">
            {currentPrompt === 'positional' ? '↑ Positional prompt active' : '✨ Stimulus prompt active'}
            {promptConfig?.fading !== 'none' && ` · fades after ${
              promptConfig.fading === 'fade3' ? '3' : promptConfig.fading === 'fade5' ? '5' : '10'
            } corrects (${consecutiveCorrects} so far)`}
          </span>
        </div>
      )}

      {/* ── TACT: single stimulus display ── */}
      {isTact && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-indigo-200 shadow-xl bg-gray-100 flex items-center justify-center">
            <CardFace item={target} imgSrc={displayImages[target]} />
          </div>
          <p className="text-sm text-gray-400">{program.sd}</p>
        </div>
      )}

      {/* ── RECEPTIVE / MATCH / DISCRIMINATION: array ── */}
      {!isTact && (
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-2 overflow-auto">
          <div className={`flex flex-wrap items-end justify-center gap-4 ${messyArray ? 'relative' : ''}`}>
            {arrayItems.map((item, idx) => {
              const pos = positions[idx]
              const isSelected   = selected === item
              const isTarget     = item === target
              const showPositional = isTarget && currentPrompt === 'positional'
              const showStimulus   = isTarget && currentPrompt === 'stimulus'

              return (
                <button
                  key={idx}
                  onClick={() => handleCardTap(item)}
                  style={{
                    transform: `rotate(${pos.angle}deg) translate(${pos.offset.x}px, ${
                      pos.offset.y + (showPositional ? -16 : 0)
                    }px) ${showPositional ? 'scale(1.06)' : ''}`,
                    transition: 'transform 0.25s ease',
                    zIndex: showPositional ? 10 : 'auto',
                  }}
                  className={`
                    relative flex flex-col items-center gap-2 rounded-2xl p-2 border-4 transition-all duration-150
                    ${isSelected
                      ? 'border-indigo-500 shadow-xl scale-105 bg-indigo-50'
                      : showStimulus
                        ? 'border-amber-400 shadow-lg bg-amber-50 ring-4 ring-amber-300 ring-offset-2'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md active:scale-95'}
                  `}
                >
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                    <CardFace item={item} imgSrc={displayImages[item]} />
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs shadow">✓</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500 min-w-0">
            {isTact ? (
              <span className="font-medium text-indigo-700">{target}</span>
            ) : (
              <>
                <span className="font-medium">Target:</span>{' '}
                <span className="text-indigo-700 font-semibold">{target}</span>
                {selected && (
                  <>{' · '}<span className="font-medium">Selected:</span>{' '}
                  <span className="font-semibold">{selected}</span></>
                )}
                {!selected && <span className="text-gray-400 ml-1">— tap a card</span>}
              </>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleScore(false)}
              disabled={!canScore}
              className="px-5 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base active:scale-95 transition-all shadow"
            >
              ✗ Incorrect
            </button>
            <button
              onClick={() => handleScore(true)}
              disabled={!canScore}
              className="px-5 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base active:scale-95 transition-all shadow"
            >
              ✓ Correct
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
