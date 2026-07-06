import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useGame } from '../state/store'
import { THEMES } from '../themes'
import { IconButton } from '../ui/IconButton'
import { ProgressPips } from '../ui/ProgressPips'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useHaptics } from '../hooks/useHaptics'
import { audio } from '../audio/engine'

const PUZZLES_PER_BOX = 3

export function PlayingHud() {
  const themeId = useGame((s) => s.currentTheme)
  const completeBox = useGame((s) => s.completeBox)
  const goto = useGame((s) => s.goto)
  const reduced = useReducedMotion()
  const haptic = useHaptics()

  const theme = THEMES[themeId]
  const [solved, setSolved] = useState(0)
  const startRef = useRef(performance.now())
  const mistakes = useRef(0)

  // Reset session whenever a new box begins.
  useEffect(() => {
    setSolved(0)
    startRef.current = performance.now()
    mistakes.current = 0
  }, [themeId])

  // TEMPORARY (P1): advance one puzzle per tap on the stage.
  // P3 replaces this with real puzzle solve callbacks.
  const solveNext = () => {
    const next = Math.min(PUZZLES_PER_BOX, solved + 1)
    audio.success(theme.sound)
    haptic('success')
    setSolved(next)
    if (next >= PUZZLES_PER_BOX) {
      const timeSec = (performance.now() - startRef.current) / 1000
      setTimeout(() => {
        completeBox(timeSec, mistakes.current === 0)
        goto('victory')
      }, 500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.4 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Top HUD */}
      <div
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top))',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <IconButton label="Leave puzzle" onClick={() => goto('preview')}>
          ←
        </IconButton>
        <IconButton label="Hint" onClick={() => haptic('tick')}>
          👁
        </IconButton>
      </div>

      {/* Temporary interactive stage placeholder (P1) */}
      <button
        aria-label="Solve puzzle"
        onClick={solveNext}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 24,
            background: `linear-gradient(160deg, ${theme.accent}33, var(--mv-surface))`,
            border: `1px solid ${theme.accent}66`,
            boxShadow: `0 0 60px -20px ${theme.accent}`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 72,
            filter: `drop-shadow(0 0 20px ${theme.accent})`,
          }}
        >
          {theme.icon}
        </div>
      </button>

      {/* Bottom progress pips */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(28px, env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ProgressPips total={PUZZLES_PER_BOX} filled={solved} accent={theme.accent} size={14} />
      </div>
    </motion.div>
  )
}
