import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Config ───────────────────────────────────────────────────────────────────

const FOOD_EMOJIS = ['🍕', '🐟', '🏀', '🍔', '🌮', '🍩', '🍉', '🌭', '🧁', '🍦', '🍟', '🎂']

const DIFF_CONFIG = {
  easy:   { spawnMs: 2000, fallMs: 4000, questionEvery: 3, maxObjects: 6 },
  medium: { spawnMs: 1500, fallMs: 3000, questionEvery: 2, maxObjects: 6 },
  hard:   { spawnMs: 1000, fallMs: 2000, questionEvery: 1, maxObjects: 6 },
}

// ─── CSS animations injected once ─────────────────────────────────────────────

const STYLE_ID = 'dino-feed-styles'

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = `
    @keyframes dino-bob {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes dino-chomp {
      0%   { transform: translateY(0px) scaleX(1); }
      20%  { transform: translateY(-4px) scaleX(1.06); }
      50%  { transform: translateY(2px) scaleX(0.96); }
      80%  { transform: translateY(-3px) scaleX(1.04); }
      100% { transform: translateY(0px) scaleX(1); }
    }
    @keyframes dino-happy {
      0%   { transform: translateY(0px) rotate(0deg); }
      15%  { transform: translateY(-12px) rotate(-8deg); }
      30%  { transform: translateY(-6px) rotate(8deg); }
      45%  { transform: translateY(-14px) rotate(-6deg); }
      60%  { transform: translateY(-4px) rotate(6deg); }
      80%  { transform: translateY(-8px) rotate(-4deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
    @keyframes dino-shake {
      0%   { transform: translateX(0px); }
      15%  { transform: translateX(-12px); }
      30%  { transform: translateX(12px); }
      45%  { transform: translateX(-10px); }
      60%  { transform: translateX(10px); }
      75%  { transform: translateX(-6px); }
      90%  { transform: translateX(6px); }
      100% { transform: translateX(0px); }
    }
    @keyframes food-fall {
      from { top: -80px; }
      to   { top: 110%; }
    }
    @keyframes food-fly-to-mouth {
      0%   { transform: scale(1) translate(0, 0); opacity: 1; }
      100% { transform: scale(0.2) translate(var(--dx), var(--dy)); opacity: 0; }
    }
    @keyframes sparkle-pop {
      0%   { transform: scale(0) rotate(0deg); opacity: 1; }
      60%  { transform: scale(1.4) rotate(180deg); opacity: 1; }
      100% { transform: scale(0) rotate(360deg); opacity: 0; }
    }
  `
  document.head.appendChild(el)
}

// ─── Sparkles overlay ─────────────────────────────────────────────────────────

function Sparkles() {
  const positions = [
    { top: '15%', left: '10%' }, { top: '10%', left: '30%' }, { top: '20%', left: '55%' },
    { top: '8%',  left: '70%' }, { top: '25%', left: '85%' }, { top: '35%', left: '20%' },
    { top: '30%', left: '75%' }, { top: '18%', left: '45%' },
  ]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {positions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            fontSize: `${20 + (i % 3) * 8}px`,
            animation: `sparkle-pop 0.7s ease-out ${i * 80}ms both`,
          }}
        >
          {['⭐', '✨', '🌟', '💫'][i % 4]}
        </div>
      ))}
    </div>
  )
}

// ─── Dino SVG ─────────────────────────────────────────────────────────────────

function DinoSVG({ state }) {
  // jaw open = idle/shake, jaw closed = chomp moment
  const jawOpen = state !== 'chomp'

  const animStyle = {
    idle:  { animation: 'dino-bob 2s ease-in-out infinite' },
    chomp: { animation: 'dino-chomp 0.4s ease-in-out' },
    happy: { animation: 'dino-happy 0.8s ease-in-out' },
    shake: { animation: 'dino-shake 0.5s ease-in-out' },
  }[state] ?? {}

  return (
    <div style={{ ...animStyle, display: 'inline-block', transformOrigin: 'bottom center' }}>
      <svg
        width="180"
        height="220"
        viewBox="0 0 180 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}
      >
        {/* ── Tail ── */}
        <ellipse cx="28" cy="158" rx="28" ry="14" fill="#4ade80" transform="rotate(-25 28 158)" />
        <ellipse cx="14" cy="170" rx="16" ry="9"  fill="#22c55e" transform="rotate(-35 14 170)" />

        {/* ── Body ── */}
        <ellipse cx="95" cy="148" rx="58" ry="52" fill="#4ade80" />
        {/* belly highlight */}
        <ellipse cx="98" cy="158" rx="34" ry="30" fill="#86efac" />

        {/* ── Back spines ── */}
        <polygon points="80,100 74,82 86,100"  fill="#16a34a" />
        <polygon points="96,93 90,72 102,93"   fill="#16a34a" />
        <polygon points="112,97 106,78 118,97" fill="#16a34a" />

        {/* ── Left tiny arm ── */}
        <ellipse cx="52" cy="162" rx="12" ry="8" fill="#22c55e" transform="rotate(30 52 162)" />
        <ellipse cx="44" cy="170" rx="7"  ry="5" fill="#16a34a" transform="rotate(30 44 170)" />

        {/* ── Right tiny arm ── */}
        <ellipse cx="138" cy="162" rx="12" ry="8" fill="#22c55e" transform="rotate(-30 138 162)" />
        <ellipse cx="146" cy="170" rx="7"  ry="5" fill="#16a34a" transform="rotate(-30 146 170)" />

        {/* ── Legs ── */}
        <rect x="62"  y="190" width="22" height="26" rx="10" fill="#22c55e" />
        <rect x="96"  y="192" width="22" height="24" rx="10" fill="#22c55e" />
        {/* feet */}
        <ellipse cx="73"  cy="216" rx="16" ry="7" fill="#16a34a" />
        <ellipse cx="107" cy="216" rx="16" ry="7" fill="#16a34a" />

        {/* ── Neck ── */}
        <rect x="82" y="88" width="36" height="36" rx="14" fill="#4ade80" />

        {/* ── Head ── */}
        <ellipse cx="105" cy="72" rx="44" ry="38" fill="#4ade80" />

        {/* ── Upper jaw extension ── */}
        <rect x="118" y="68" width="46" height="20" rx="8" fill="#4ade80" />

        {/* ── Lower jaw (moves with state) ── */}
        <rect
          x="118"
          y={jawOpen ? 88 : 80}
          width="42"
          height="16"
          rx="7"
          fill="#22c55e"
          style={{ transition: 'y 0.1s' }}
        />

        {/* ── Teeth upper ── */}
        {jawOpen && (
          <>
            <polygon points="126,86 130,96 134,86" fill="white" />
            <polygon points="137,86 141,96 145,86" fill="white" />
            <polygon points="148,86 152,96 156,86" fill="white" />
          </>
        )}

        {/* ── Teeth lower ── */}
        {jawOpen && (
          <>
            <polygon points="128,88 132,80 136,88" fill="white" />
            <polygon points="140,88 144,80 148,88" fill="white" />
          </>
        )}

        {/* ── Tongue ── */}
        {jawOpen && (
          <ellipse cx="140" cy="96" rx="14" ry="7" fill="#f87171" />
        )}

        {/* ── Eye white ── */}
        <ellipse cx="88"  cy="60" rx="13" ry="13" fill="white" />
        <ellipse cx="112" cy="58" rx="13" ry="13" fill="white" />

        {/* ── Iris ── */}
        <ellipse cx="90"  cy="61" rx="8" ry="8" fill="#1e3a5f" />
        <ellipse cx="114" cy="59" rx="8" ry="8" fill="#1e3a5f" />

        {/* ── Pupil shine ── */}
        <ellipse cx="92"  cy="59" rx="3" ry="3" fill="white" />
        <ellipse cx="116" cy="57" rx="3" ry="3" fill="white" />

        {/* ── Nostril ── */}
        <ellipse cx="148" cy="58" rx="4" ry="3" fill="#16a34a" />

        {/* ── Cheek blush ── */}
        <ellipse cx="74" cy="72" rx="9" ry="6" fill="#f9a8d4" opacity="0.5" />
      </svg>
    </div>
  )
}

// ─── Falling food item ────────────────────────────────────────────────────────

function FoodItem({ item, onTap, fallDuration, flying }) {
  return (
    <div
      onPointerDown={(e) => { e.stopPropagation(); onTap(item.id) }}
      style={{
        position: 'absolute',
        left: `${item.x}%`,
        fontSize: '52px',
        lineHeight: 1,
        cursor: 'pointer',
        userSelect: 'none',
        animation: flying
          ? `food-fly-to-mouth 0.35s ease-in forwards`
          : `food-fall ${fallDuration}ms linear forwards`,
        '--dx': item.flyDx ?? '0px',
        '--dy': item.flyDy ?? '0px',
        zIndex: 10,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {item.emoji}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DinoFeed({ onNeedQuestion, difficulty = 'medium' }) {
  const cfg = DIFF_CONFIG[difficulty] ?? DIFF_CONFIG.medium

  const [objects, setObjects]       = useState([])
  const [score, setScore]           = useState(0)
  const [dinoState, setDinoState]   = useState('idle')
  const [paused, setPaused]         = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)

  const nextIdRef      = useRef(0)
  const totalFedRef    = useRef(0)
  const pausedRef      = useRef(false)
  const spawnTimerRef  = useRef(null)
  const dinoRef        = useRef(null)   // for fly-to-mouth vector
  const containerRef   = useRef(null)
  const scoreRef       = useRef(0)

  // Keep scoreRef in sync
  useEffect(() => { scoreRef.current = score }, [score])

  // Inject CSS once
  useEffect(() => { injectStyles() }, [])

  // Trigger a timed dino animation state, then revert to idle
  const triggerDinoState = useCallback((st, durationMs) => {
    setDinoState(st)
    setTimeout(() => setDinoState('idle'), durationMs)
  }, [])

  // Spawn loop
  const startSpawning = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
    spawnTimerRef.current = setInterval(() => {
      if (pausedRef.current) return
      setObjects(prev => {
        if (prev.length >= cfg.maxObjects) return prev
        const id = nextIdRef.current++
        return [
          ...prev,
          {
            id,
            emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
            x: 5 + Math.random() * 75, // 5–80 % of screen width
            spawnTime: Date.now(),
            flying: false,
          },
        ]
      })
    }, cfg.spawnMs)
  }, [cfg.spawnMs, cfg.maxObjects])

  // Auto-remove objects that have fallen off screen
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (pausedRef.current) return
      const deadline = Date.now() - cfg.fallMs - 200
      setObjects(prev => prev.filter(o => o.flying || o.spawnTime > deadline))
    }, 500)
    return () => clearInterval(cleanup)
  }, [cfg.fallMs])

  // Start/stop spawning on mount/difficulty change
  useEffect(() => {
    startSpawning()
    return () => { if (spawnTimerRef.current) clearInterval(spawnTimerRef.current) }
  }, [startSpawning])

  // Tap handler
  const handleTap = useCallback((id) => {
    if (pausedRef.current) return

    // Compute fly vector toward dino mouth
    let flyDx = '0px'
    let flyDy = '0px'
    if (containerRef.current && dinoRef.current) {
      const contRect = containerRef.current.getBoundingClientRect()
      const dinoRect = dinoRef.current.getBoundingClientRect()
      // Mouth is roughly right-center of dino SVG
      const mouthX = dinoRect.left + dinoRect.width * 0.82 - contRect.left
      const mouthY = dinoRect.top  + dinoRect.height * 0.42 - contRect.top

      setObjects(prev => {
        const item = prev.find(o => o.id === id)
        if (!item) return prev
        // Item's pixel position (approximate center of emoji)
        const itemLeft = (item.x / 100) * contRect.width + 26
        const itemTop  = contRect.height * 0.3 // rough mid-fall estimate
        flyDx = `${mouthX - itemLeft}px`
        flyDy = `${mouthY - itemTop}px`
        return prev.map(o =>
          o.id === id ? { ...o, flying: true, flyDx, flyDy } : o
        )
      })
    } else {
      setObjects(prev => prev.map(o => o.id === id ? { ...o, flying: true } : o))
    }

    // Remove flying item after animation
    setTimeout(() => {
      setObjects(prev => prev.filter(o => o.id !== id))
    }, 380)

    // Update score & state
    totalFedRef.current += 1
    setScore(s => s + 1)
    triggerDinoState('chomp', 420)

    // DTT question every N taps
    if (totalFedRef.current % cfg.questionEvery === 0) {
      pausedRef.current = true
      setPaused(true)
      clearInterval(spawnTimerRef.current)

      onNeedQuestion((result) => {
        pausedRef.current = false
        setPaused(false)

        if (result?.correct) {
          setScore(s => s + 2)
          setShowSparkles(true)
          triggerDinoState('happy', 900)
          setTimeout(() => setShowSparkles(false), 900)
        } else {
          triggerDinoState('shake', 550)
        }

        startSpawning()
      })
    }
  }, [cfg.questionEvery, onNeedQuestion, startSpawning, triggerDinoState])

  const diffLabel = difficulty === 'easy' ? '🐢 Easy' : difficulty === 'hard' ? '🚀 Hard' : '🐇 Medium'

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%)' }}
    >
      {/* Clouds */}
      <div style={{ position: 'absolute', top: '6%', left: '8%',  width: 90, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.7)' }} />
      <div style={{ position: 'absolute', top: '4%', left: '12%', width: 60, height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.55)' }} />
      <div style={{ position: 'absolute', top: '9%', left: '55%', width: 110, height: 38, borderRadius: 19, background: 'rgba(255,255,255,0.65)' }} />
      <div style={{ position: 'absolute', top: '6%', left: '63%', width: 70, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.5)' }} />

      {/* Ground strip */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '18%',
          background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
          borderRadius: '50% 50% 0 0 / 20px 20px 0 0',
        }}
      />
      {/* Ground highlight */}
      <div
        style={{
          position: 'absolute', bottom: '16%', left: 0, right: 0, height: 8,
          background: 'rgba(255,255,255,0.3)',
        }}
      />

      {/* Score — top right */}
      <div
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-2xl px-4 py-2"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
      >
        <span className="text-xl">🦖</span>
        <span className="text-2xl font-black text-green-700">{score}</span>
      </div>

      {/* Difficulty — top left */}
      <div
        className="absolute top-4 left-4 z-20 rounded-2xl px-3 py-2 text-sm font-semibold text-green-800"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
      >
        {diffLabel}
      </div>

      {/* Falling food objects */}
      {objects.map(item => (
        <FoodItem
          key={item.id}
          item={item}
          onTap={handleTap}
          fallDuration={cfg.fallMs}
          flying={item.flying}
        />
      ))}

      {/* Sparkles on correct answer */}
      {showSparkles && <Sparkles />}

      {/* Dino — centered at bottom */}
      <div
        className="absolute bottom-0 left-1/2 z-10"
        style={{ transform: 'translateX(-50%)' }}
      >
        <div ref={dinoRef}>
          <DinoSVG state={dinoState} />
        </div>
      </div>

      {/* Paused overlay */}
      {paused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(3px)' }}
        >
          <div
            className="text-2xl font-bold text-green-700 animate-pulse rounded-2xl px-6 py-4"
            style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            ✏️ Question time!
          </div>
        </div>
      )}
    </div>
  )
}
