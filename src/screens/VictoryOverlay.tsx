import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useGame } from '../state/store'
import { THEMES } from '../themes'
import { IconButton } from '../ui/IconButton'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useHaptics } from '../hooks/useHaptics'
import { audio } from '../audio/engine'

export function VictoryOverlay() {
  const result = useGame((s) => s.lastVictory)
  const themeId = useGame((s) => s.currentTheme)
  const boxIndex = useGame((s) => s.currentBoxIndex)
  const enterTheme = useGame((s) => s.enterTheme)
  const goto = useGame((s) => s.goto)
  const reduced = useReducedMotion()
  const haptic = useHaptics()

  const theme = THEMES[themeId]

  useEffect(() => {
    audio.victoryStinger(theme.sound)
    haptic('victory')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!result) return null

  const hasNext = boxIndex < theme.boxes - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.4 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.2), rgba(0,0,0,0.75))',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <motion.div
          initial={reduced ? false : { scale: 0.4, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          style={{ fontSize: 120, filter: `drop-shadow(0 0 60px ${theme.accent})` }}
        >
          {theme.icon}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 999,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: 'var(--mv-gold)',
            fontFamily: 'var(--mv-font-display)',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          <span>💎</span> +{result.crystalsEarned}
        </motion.div>

        {/* Time bonus indicator */}
        {result.timeSec < 60 && (
          <div style={{ display: 'flex', gap: 6, color: 'var(--mv-gold)' }}>
            {result.timeSec < 30 ? '⚡⚡' : '⚡'}
          </div>
        )}

        {/* Theme unlock banner */}
        {result.unlockedTheme && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 18 }}
            style={{
              marginTop: 8,
              padding: '14px 22px',
              borderRadius: 'var(--mv-radius)',
              background: `linear-gradient(120deg, ${THEMES[result.unlockedTheme].accent}33, var(--mv-surface))`,
              border: `1px solid ${THEMES[result.unlockedTheme].accent}88`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 15,
            }}
          >
            <span style={{ fontSize: 20 }}>⛓️‍💥</span>
            <span style={{ fontSize: 40 }}>{THEMES[result.unlockedTheme].icon}</span>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <IconButton label="Replay box" onClick={() => goto('playing')}>
            ↺
          </IconButton>
          {hasNext && (
            <IconButton
              label="Next box"
              variant="primary"
              accent={theme.accent}
              size={72}
              onClick={() => {
                enterTheme(themeId, boxIndex + 1)
                goto('playing')
              }}
            >
              →
            </IconButton>
          )}
          <IconButton label="Back to worlds" onClick={() => goto('menu')}>
            ⌂
          </IconButton>
        </div>
      </div>
    </motion.div>
  )
}
