import { motion } from 'motion/react'
import { useGame } from '../state/store'
import { THEMES, THEME_ORDER } from '../themes'
import type { ThemeId } from '../themes/types'
import { ProgressPips } from '../ui/ProgressPips'
import { CrystalCounter } from '../ui/CrystalCounter'
import { IconButton } from '../ui/IconButton'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useHaptics } from '../hooks/useHaptics'
import { audio } from '../audio/engine'

export function WorldSelect() {
  const themes = useGame((s) => s.themes)
  const crystals = useGame((s) => s.crystals)
  const enterTheme = useGame((s) => s.enterTheme)
  const focusTheme = useGame((s) => s.focusTheme)
  const goto = useGame((s) => s.goto)
  const setOverlay = useGame((s) => s.setOverlay)
  const reduced = useReducedMotion()
  const haptic = useHaptics()

  const pick = (id: ThemeId, unlocked: boolean) => {
    if (!unlocked) {
      haptic('error')
      audio.error()
      return
    }
    // Resume at the first not-yet-completed box.
    const completed = themes[id].completed
    const boxIndex = Math.min(completed, THEMES[id].boxes - 1)
    enterTheme(id, boxIndex)
    goto('preview')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.4 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'max(16px, env(safe-area-inset-top)) 20px 8px',
        }}
      >
        <CrystalCounter value={crystals} />
        <div style={{ display: 'flex', gap: 10 }}>
          <IconButton label="Achievements" onClick={() => setOverlay('achievements')}>
            🏆
          </IconButton>
          <IconButton label="Settings" onClick={() => setOverlay('settings')}>
            ⚙️
          </IconButton>
        </div>
      </div>

      <div
        style={{
          padding: '0 20px',
          fontFamily: 'var(--mv-font-display)',
          fontSize: 13,
          letterSpacing: '0.28em',
          color: 'var(--mv-text-muted)',
          textTransform: 'uppercase',
        }}
      >
        Select your adventure
      </div>

      {/* Card rail */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 18,
          overflowX: 'auto',
          overflowY: 'hidden',
          alignItems: 'center',
          padding: '12px 20px 28px',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {THEME_ORDER.map((id) => {
          const theme = THEMES[id]
          const prog = themes[id]
          return (
            <ThemeCard
              key={id}
              id={id}
              accent={theme.accent}
              icon={theme.icon}
              boxes={theme.boxes}
              completed={prog.completed}
              unlocked={prog.unlocked}
              reduced={reduced}
              onFocus={() => focusTheme(id)}
              onPick={() => pick(id, prog.unlocked)}
            />
          )
        })}
      </div>
    </motion.div>
  )
}

interface CardProps {
  id: ThemeId
  accent: string
  icon: string
  boxes: number
  completed: number
  unlocked: boolean
  reduced: boolean
  onFocus: () => void
  onPick: () => void
}

function ThemeCard({ accent, icon, boxes, completed, unlocked, reduced, onFocus, onPick }: CardProps) {
  const done = completed >= boxes

  return (
    <motion.button
      aria-label={unlocked ? `Enter world` : `Locked world`}
      onHoverStart={onFocus}
      onFocus={onFocus}
      onClick={onPick}
      whileHover={reduced || !unlocked ? undefined : { y: -8, rotateX: 4, rotateY: -4 }}
      whileTap={unlocked ? { scale: 0.97 } : { x: [0, -6, 6, -4, 4, 0] }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      style={{
        scrollSnapAlign: 'center',
        flex: '0 0 auto',
        width: 220,
        height: 300,
        borderRadius: 'var(--mv-radius-lg)',
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        transformStyle: 'preserve-3d',
        background: unlocked
          ? `linear-gradient(160deg, ${accent}22, var(--mv-surface) 60%)`
          : 'var(--mv-surface)',
        border: `1px solid ${unlocked ? accent + '55' : 'var(--mv-border)'}`,
        boxShadow: unlocked ? `0 20px 60px -30px ${accent}` : 'none',
        opacity: unlocked ? 1 : 0.5,
        position: 'relative',
      }}
    >
      <div style={{ alignSelf: 'flex-end' }}>
        {done ? (
          <span style={{ color: accent, fontSize: 20 }}>✓</span>
        ) : !unlocked ? (
          <span style={{ fontSize: 20, filter: 'grayscale(1)' }}>🔒</span>
        ) : null}
      </div>

      <div
        style={{
          fontSize: 72,
          filter: unlocked ? `drop-shadow(0 0 24px ${accent}88)` : 'grayscale(1)',
        }}
      >
        {icon}
      </div>

      <ProgressPips total={boxes} filled={completed} accent={accent} size={9} />
    </motion.button>
  )
}
