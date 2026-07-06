import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'motion/react'

interface Props {
  value: number
}

/** Gem icon + count. Numerals are fine (not reading); pulses gold on increase. */
export function CrystalCounter({ value }: Props) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const controls = useAnimationControls()

  useEffect(() => {
    if (value === prev.current) return
    const from = prev.current
    prev.current = value
    controls.start({
      scale: [1, 1.25, 1],
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    })
    // Count up
    const start = performance.now()
    const dur = 600
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur)
      setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, controls])

  return (
    <motion.div
      animate={controls}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.22)',
        color: 'var(--mv-gold)',
        fontFamily: 'var(--mv-font-display)',
        fontWeight: 600,
        fontSize: 16,
      }}
    >
      <span style={{ fontSize: 18 }}>💎</span>
      <span>{display}</span>
    </motion.div>
  )
}
