import { useEffect, useRef, useState, useCallback } from 'react'

const COLORS = ['#818cf8', '#34d399', '#fb923c', '#f472b6', '#60a5fa', '#a78bfa', '#4ade80', '#fbbf24']

function makeBubble(id, canvasW, canvasH) {
  const r = 28 + Math.random() * 30
  return {
    id,
    x: r + Math.random() * (canvasW - r * 2),
    y: canvasH + r,
    r,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -(1.2 + Math.random() * 1.4),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    popped: false,
  }
}

export function BubblePop({ onNeedQuestion, questionInterval = 8 }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ bubbles: [], nextId: 0, score: 0, frameId: null, lastQuestionAt: 0, totalPopped: 0 })
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  const getCanvas = () => canvasRef.current

  const draw = useCallback(() => {
    const canvas = getCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { bubbles } = stateRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, '#eef2ff')
    grad.addColorStop(1, '#ddd6fe')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    bubbles.forEach(b => {
      if (b.popped) return
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = b.color + 'cc'
      ctx.fill()
      ctx.strokeStyle = b.color
      ctx.lineWidth = 2
      ctx.stroke()
      // shine
      ctx.beginPath()
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.fill()
    })

    // Score
    ctx.fillStyle = '#4338ca'
    ctx.font = 'bold 22px system-ui'
    ctx.fillText(`🫧 ${stateRef.current.score}`, 16, 34)
  }, [])

  const loop = useCallback(() => {
    if (pausedRef.current) return
    const canvas = getCanvas()
    if (!canvas) return
    const s = stateRef.current

    // Spawn bubble
    if (Math.random() < 0.025) {
      s.bubbles.push(makeBubble(s.nextId++, canvas.width, canvas.height))
    }

    // Move & cull
    s.bubbles = s.bubbles.filter(b => b.y + b.r > -50 && !b.popped)
    s.bubbles.forEach(b => {
      b.x += b.vx
      b.y += b.vy
      if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.vx *= -1
    })

    draw()
    s.frameId = requestAnimationFrame(loop)
  }, [draw])

  useEffect(() => {
    const canvas = getCanvas()
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
    const canvas = getCanvas()
    const rect = canvas.getBoundingClientRect()
    const cx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left
    const cy = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top
    const s = stateRef.current
    let popped = false
    s.bubbles.forEach(b => {
      if (!b.popped && Math.hypot(cx - b.x, cy - b.y) < b.r) {
        b.popped = true
        s.score++
        s.totalPopped++
        popped = true
      }
    })
    if (popped) {
      setScore(s.score)
      // Trigger question every N pops
      if (s.totalPopped > 0 && s.totalPopped % questionInterval === 0) {
        pausedRef.current = true
        setPaused(true)
        cancelAnimationFrame(s.frameId)
        onNeedQuestion(() => {
          // Resume callback
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
        className="w-full h-full touch-none cursor-pointer"
        onClick={handleClick}
        onTouchStart={handleClick}
      />
      {paused && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div className="text-2xl font-bold text-indigo-600 animate-pulse">Question time! ✏️</div>
        </div>
      )}
    </div>
  )
}
