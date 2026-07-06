import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useGame } from '../state/store'
import { ACHIEVEMENT_MAP, RARITY_COLOR } from '../achievements/definitions'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { audio } from '../audio/engine'

export function Toast() {
  const toast = useGame((s) => s.toast)
  const clearToast = useGame((s) => s.clearToast)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!toast) return
    audio.tick()
    const t = setTimeout(clearToast, 2800)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.key}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          style={{
            position: 'absolute',
            top: 'max(20px, env(safe-area-inset-top))',
            left: '50%',
            translateX: '-50%',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 18px',
            borderRadius: 999,
            background: 'rgba(17,17,17,0.85)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${RARITY_COLOR[ACHIEVEMENT_MAP[toast.id].rarity]}`,
            boxShadow: `0 0 30px -8px ${RARITY_COLOR[ACHIEVEMENT_MAP[toast.id].rarity]}`,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 26 }}>{ACHIEVEMENT_MAP[toast.id].icon}</span>
          <span
            style={{
              fontFamily: 'var(--mv-font-display)',
              fontSize: 13,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: RARITY_COLOR[ACHIEVEMENT_MAP[toast.id].rarity],
            }}
          >
            Achievement
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
