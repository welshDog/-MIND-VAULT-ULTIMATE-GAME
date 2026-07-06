import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useGame } from '../state/store'
import { usePlay } from '../state/play'
import { THEMES } from '../themes'
import { IconButton } from '../ui/IconButton'
import { ProgressPips } from '../ui/ProgressPips'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function PlayingHud() {
  const themeId = useGame((s) => s.currentTheme)
  const completeBox = useGame((s) => s.completeBox)
  const goto = useGame((s) => s.goto)
  const reduced = useReducedMotion()

  const puzzles = usePlay((s) => s.puzzles)
  const solved = usePlay((s) => s.solved)
  const theme = THEMES[themeId]

  const total = puzzles.length || 3
  const solvedCount = solved.filter(Boolean).length

  // Fire victory once, after the last puzzle solves (brief beat to celebrate).
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    if (puzzles.length > 0 && solved.length > 0 && solved.every(Boolean)) {
      fired.current = true
      const { startTime, mistakes } = usePlay.getState()
      const timeSec = (performance.now() - startTime) / 1000
      const t = setTimeout(() => {
        completeBox(timeSec, mistakes === 0)
        goto('victory')
      }, 750)
      return () => clearTimeout(t)
    }
  }, [solved, puzzles, completeBox, goto])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.4 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
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
        <span style={{ pointerEvents: 'auto' }}>
          <IconButton label="Leave puzzle" onClick={() => goto('preview')}>
            ←
          </IconButton>
        </span>
        <span style={{ pointerEvents: 'auto' }}>
          <IconButton label="Hint" onClick={() => {}}>
            👁
          </IconButton>
        </span>
      </div>

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
        <ProgressPips total={total} filled={solvedCount} accent={theme.accent} size={14} />
      </div>
    </motion.div>
  )
}
