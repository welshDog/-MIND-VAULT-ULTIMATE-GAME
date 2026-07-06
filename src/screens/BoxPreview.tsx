import { motion } from 'motion/react'
import { useGame } from '../state/store'
import { THEMES } from '../themes'
import { IconButton } from '../ui/IconButton'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function BoxPreview() {
  const themeId = useGame((s) => s.currentTheme)
  const boxIndex = useGame((s) => s.currentBoxIndex)
  const completed = useGame((s) => s.themes[themeId].completed)
  const enterTheme = useGame((s) => s.enterTheme)
  const goto = useGame((s) => s.goto)
  const reduced = useReducedMotion()

  const theme = THEMES[themeId]
  const maxUnlocked = Math.min(completed, theme.boxes - 1) // highest playable
  const canPrev = boxIndex > 0
  const canNext = boxIndex < maxUnlocked
  const difficulty = boxIndex + 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.4 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: 'max(16px, env(safe-area-inset-top)) 20px 0' }}>
        <IconButton label="Back to worlds" onClick={() => goto('menu')}>
          ←
        </IconButton>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        <div style={{ fontSize: 96, filter: `drop-shadow(0 0 40px ${theme.accent})` }}>
          {theme.icon}
        </div>

        {/* Difficulty gems */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: theme.boxes }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: 18,
                opacity: i < difficulty ? 1 : 0.2,
                filter: i < difficulty ? `drop-shadow(0 0 6px ${theme.accent})` : 'grayscale(1)',
              }}
            >
              💠
            </span>
          ))}
        </div>

        {/* Box navigation + play */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <IconButton
            label="Previous box"
            disabled={!canPrev}
            onClick={() => enterTheme(themeId, boxIndex - 1)}
          >
            ‹
          </IconButton>

          <IconButton
            label="Start challenge"
            variant="primary"
            accent={theme.accent}
            size={88}
            onClick={() => goto('playing')}
          >
            ▶
          </IconButton>

          <IconButton
            label="Next box"
            disabled={!canNext}
            onClick={() => enterTheme(themeId, boxIndex + 1)}
          >
            ›
          </IconButton>
        </div>
      </div>
    </motion.div>
  )
}
