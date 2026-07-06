import { motion } from 'motion/react'
import { useGame } from '../state/store'
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, RARITY_COLOR, type AchievementId } from '../achievements/definitions'
import { IconButton } from '../ui/IconButton'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function AchievementsPanel() {
  const achievements = useGame((s) => s.achievements)
  const setOverlay = useGame((s) => s.setOverlay)
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={() => setOverlay('none')}
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { y: '100%' }}
        animate={reduced ? { opacity: 1 } : { y: 0 }}
        exit={reduced ? { opacity: 0 } : { y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          maxHeight: '82vh',
          overflowY: 'auto',
          background: 'var(--mv-surface)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: '1px solid var(--mv-border)',
          padding: '20px 20px max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 30 }}>🏆</span>
          <IconButton label="Close achievements" onClick={() => setOverlay('none')}>
            ✕
          </IconButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 14 }}>
          {ACHIEVEMENTS.map((a) => (
            <Tile key={a.id} id={a.id} progress={achievements[a.id].progress} unlocked={achievements[a.id].unlocked} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Tile({ id, progress, unlocked }: { id: AchievementId; progress: number; unlocked: boolean }) {
  const def = ACHIEVEMENT_MAP[id]
  const color = RARITY_COLOR[def.rarity]
  const frac = Math.min(1, progress / def.maxProgress)
  const R = 30
  const C = 2 * Math.PI * R

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 16,
        background: 'var(--mv-surface-1)',
        border: `1px solid ${unlocked ? color : 'var(--mv-border)'}`,
        boxShadow: unlocked ? `0 0 20px -10px ${color}` : 'none',
      }}
    >
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <svg width="72" height="72" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - frac)}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontSize: 30,
            filter: unlocked ? `drop-shadow(0 0 8px ${color})` : 'grayscale(1) brightness(0.5)',
            opacity: unlocked ? 1 : 0.5,
          }}
        >
          {unlocked ? def.icon : '🔒'}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--mv-text-muted)', fontFamily: 'var(--mv-font-display)' }}>
        {progress}/{def.maxProgress}
      </div>
    </div>
  )
}
