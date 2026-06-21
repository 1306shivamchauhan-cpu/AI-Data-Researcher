import { useEffect, useRef, useState } from 'react'

const PIXEL_SIZE = 16

export default function PixelReveal({ children, className = '', delay = 0, pixelSize = PIXEL_SIZE, threshold = 0.15 }) {
  const containerRef = useRef(null)
  const [pixels, setPixels] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    setVisible(true)

    const w = el.offsetWidth
    const h = el.offsetHeight
    const cols = Math.ceil(w / pixelSize)
    const rows = Math.ceil(h / pixelSize)
    const total = cols * rows

    const pixelList = Array.from({ length: total }, (_, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      return {
        id: i,
        x: col * pixelSize,
        y: row * pixelSize,
        delay: Math.random() * 0.6 + (row * 0.008 + col * 0.008),
        size: pixelSize,
      }
    })
    setPixels(pixelList)
  }, [pixelSize])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {visible && pixels.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
          <div className="relative w-full h-full">
            {pixels.map((p) => (
              <div
                key={p.id}
                className="pixel-reveal-block"
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  width: p.size + 1,
                  height: p.size + 1,
                  background: '#0f172a',
                  animation: `pixelReveal 0.7s ease-out ${delay + p.delay}s forwards`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}

export function PixelCard({ children, className = '', delay = 0 }) {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), delay * 1000)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <div
          className={`w-full h-full bg-gradient-to-br from-brand-950 via-gray-950 to-gray-950 transition-all duration-700 ease-out ${
            revealed ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
          }`}
          style={{
            clipPath: revealed
              ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
              : 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
            transition: 'clip-path 0.8s ease-out, opacity 0.6s ease-out',
          }}
        />
      </div>
      <div
        className="relative transition-all duration-700"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: `${delay * 1000 + 200}ms`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function PixelButton({ children, className = '', onClick, ...props }) {
  const [exploding, setExploding] = useState(false)
  const [particles, setParticles] = useState([])
  const btnRef = useRef(null)

  const handleClick = (e) => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return

    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const dots = []
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 30 + Math.random() * 60
      dots.push({
        id: i,
        x: cx,
        y: cy,
        tx: cx + Math.cos(angle) * dist,
        ty: cy + Math.sin(angle) * dist,
        size: 2 + Math.random() * 4,
      })
    }
    setParticles(dots)
    setExploding(true)
    setTimeout(() => {
      setExploding(false)
      setParticles([])
    }, 600)

    onClick?.(e)
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {exploding && particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-brand-400 pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            animation: `pixelExplode 0.5s ease-out forwards`,
            '--tx': `${p.tx - p.x}px`,
            '--ty': `${p.ty - p.y}px`,
          }}

        />
      ))}
      {children}
    </button>
  )
}
