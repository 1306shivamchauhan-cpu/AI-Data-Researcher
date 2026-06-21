import { useEffect, useState, useCallback, useRef } from 'react'

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [hover, setHover] = useState(false)
  const rafRef = useRef(null)
  const smoothRef = useRef({ x: -200, y: -200 })
  const [smooth, setSmooth] = useState({ x: -200, y: -200 })
  const [trail, setTrail] = useState(Array(6).fill({ x: -200, y: -200 }))

  const onMove = useCallback((e) => {
    setPos({ x: e.clientX, y: e.clientY })
  }, [])

  const onLeave = useCallback(() => {
    setPos({ x: -200, y: -200 })
    smoothRef.current = { x: -200, y: -200 }
  }, [])

  const onOver = useCallback((e) => {
    setHover(!!e.target.closest('a, button, [role="button"], input, select, textarea'))
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseover', onOver)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseover', onOver)
    }
  }, [onMove, onLeave, onOver])

  useEffect(() => {
    const animate = () => {
      const sp = smoothRef.current
      sp.x += (pos.x - sp.x) * 0.2
      sp.y += (pos.y - sp.y) * 0.2
      setSmooth({ x: sp.x, y: sp.y })
      setTrail((prev) => {
        const next = [...prev]
        for (let i = next.length - 1; i > 0; i--) {
          next[i] = { ...next[i - 1] }
        }
        next[0] = { x: sp.x, y: sp.y }
        return next
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [pos])

  const ringSize = hover ? 56 : 40

  return (
    <>
      <div
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99999,
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: `2.5px solid ${hover ? 'rgba(255,255,255,0.7)' : 'rgba(129,140,248,0.6)'}`,
          background: hover ? 'rgba(129,140,248,0.1)' : 'transparent',
          left: smooth.x,
          top: smooth.y,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.15s, height 0.15s, background 0.15s, border-color 0.15s',
          boxShadow: hover
            ? '0 0 30px rgba(129,140,248,0.3), inset 0 0 30px rgba(129,140,248,0.1)'
            : '0 0 15px rgba(129,140,248,0.15), inset 0 0 15px rgba(129,140,248,0.05)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 100000,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: hover ? '#ffffff' : '#818cf8',
          left: smooth.x,
          top: smooth.y,
          transform: 'translate(-50%, -50%)',
          boxShadow: hover
            ? '0 0 15px rgba(255,255,255,0.9), 0 0 40px rgba(129,140,248,0.6)'
            : '0 0 10px rgba(129,140,248,0.8), 0 0 30px rgba(129,140,248,0.4)',
          transition: 'background 0.15s, box-shadow 0.15s',
        }}
      />
      {trail.map((t, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 99998 - i,
            width: 3 + (1 - i / trail.length) * 4,
            height: 3 + (1 - i / trail.length) * 4,
            borderRadius: '50%',
            background: `rgba(255,255,255,${0.3 * (1 - i / trail.length)})`,
            left: t.x,
            top: t.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </>
  )
}
