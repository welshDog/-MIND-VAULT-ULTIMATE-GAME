import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useGame } from '../state/store'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { audio } from '../audio/engine'

export function Splash() {
  const goto = useGame((s) => s.goto)
  const reduced = useReducedMotion()

  const start = () => {
    audio.unlock()
    goto('menu')
  }

  useEffect(() => {
    const t = setTimeout(start, reduced ? 1200 : 3200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      onClick={start}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.6 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={reduced ? false : { letterSpacing: '0.05em', opacity: 0, y: 10 }}
          animate={{ letterSpacing: '0.34em', opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            fontFamily: 'var(--mv-font-display)',
            fontWeight: 700,
            fontSize: 'clamp(2.2rem, 9vw, 5rem)',
            color: 'var(--mv-text)',
            textShadow: '0 0 40px rgba(34,211,238,0.25)',
          }}
        >
          MIND VAULT
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{
            marginTop: 14,
            fontSize: 13,
            letterSpacing: '0.3em',
            color: 'var(--mv-text-muted)',
            textTransform: 'uppercase',
          }}
        >
          Ultimate Puzzle Experience
        </motion.div>
        {!reduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ delay: 2, duration: 2, repeat: Infinity }}
            style={{ marginTop: 40, fontSize: 12, letterSpacing: '0.2em', color: 'var(--mv-text-muted)' }}
          >
            ▸ tap to begin
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
