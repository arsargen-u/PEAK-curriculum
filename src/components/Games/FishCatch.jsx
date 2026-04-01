import { useEffect, useRef, useState, useCallback } from 'react'

const FISH_COLORS = ['#f97316', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
const FISH_EMOJIS = ['🐠', '🐡', '🐟', '🦈', '🐙', '🦑']

function makeFish(id, canvasW, canvasH) {
  const fromLeft = Math.random() > 0.5
  const speed = 1.5 + Math.random() * 2
  return {
    id,
    x: fromLeft ? -60 : canvasW + 60,
    y: 60 + Math.random() * (canvasH - 120),
    vx: fromLeft ? speed : -speed,
    emoji: FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)],
    size: 30 + Math.random() * 20,
    caught: false,
  }
}

export function FishCatch({ onNeedQuestion, questionInterval = 6 }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ fish: [], nextId: 0, score: 0, frameId: null, totalCaught: 0 })
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Ocean background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, '#bae6fd')
    grad.addColorStop(1, '#0369a1')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Waves
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      const y = (canvas.height * (i + 1)) / 6
      ctx.moveTo(0, y)
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.quadraticCurveTo(x + 20, y - 8, x + 40, y)
      }
      ctx.stroke()
    }

    // Draw fish
    const { fish } = stateRef.current
    fish.forEach(f => {
      if (f.caught) return
      ctx.save()
      ctx.translate(f.x, f.y)
      if (f.vx < 0) ctx.scale(-1, 1)
      ctx.font = `${f.size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(f.emoji, 0, 0)
      ctx.restore()
    })

    // Score
    ctx.fillStyle = 'white'
    ctx.font = 'bold 22px system-ui'
    ctx.fillText(`🎣 ${stateRef.current.score}`, 16, 34)
  }, [])

  const loop = useCallback(() => {
    if (pausedRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current

    if (Math.random() < 0.018) {
      s.fish.push(makeFish(s.nextId++, canvas.width, canvas.height))
    }

    s.fish = s.fish.filter(f => f.x > -100 && f.x < canvas.width + 100 && !f.caught)
    s.fish.forEach(f => { f.x += f.vx })

    draw()
    s.frameId = requestAnimationFrame(loop)
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)
    stateRef.current.frameId = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(stateRef.current.frameId)
    }
  }, [loop])

  const handleClick = useCallback((e) => {
    if (pausedRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const cx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left
    const cy = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top
    const s = stateRef.current
    let caught = false
    s.fish.forEach(f => {
      if (!f.caught && Math.hypot(cx - f.x, cy - f.y) < f.size) {
        f.caught = true
        s.score++
        s.totalCaught++
        caught = true
      }
    })
    if (caught) {
      setScore(s.score)
      if (s.totalCaught > 0 && s.totalCaught % questionInterval === 0) {
        pausedRef.current = true
        setPaused(true)
        cancelAnimationFrame(s.frameId)
        onNeedQuestion(() => {
          pausedRef.current = false
          setPaused(false)
          s.frameId = requestAnimationFrame(loop)
        })
      }
    }
  }, [loop, onNeedQuestion, questionInterval])

  return (
    <div className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-crosshair"
        onClick={handleClick}
        onTouchStart={handleClick}
      />
      {paused && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div className="text-2xl font-bold text-sky-600 animate-pulse">Question time! ✏️</div>
        </div>
      )}
    </div>
  )
}
