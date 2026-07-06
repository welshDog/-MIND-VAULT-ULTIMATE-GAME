import { motion } from 'motion/react'
import { useGame, type MotionPref } from '../state/store'
import { IconButton } from '../ui/IconButton'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { audio } from '../audio/engine'

export function SettingsModal() {
  const settings = useGame((s) => s.settings)
  const setSettings = useGame((s) => s.setSettings)
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
        display: 'grid',
        placeItems: 'center',
      }}
      onClick={() => setOverlay('none')}
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(460px, 92%)',
          background: 'var(--mv-surface)',
          borderRadius: 24,
          border: '1px solid var(--mv-border)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 26 }}>⚙️</span>
          <IconButton label="Close settings" onClick={() => setOverlay('none')}>
            ✕
          </IconButton>
        </div>

        {/* Volume */}
        <Row icon="🔊">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            aria-label="Volume"
            onChange={(e) => {
              const v = Number(e.target.value) / 100
              setSettings({ volume: v })
              audio.setVolume(v)
              audio.tick()
            }}
            style={{ flex: 1, height: 40, accentColor: 'var(--mv-cyan)' }}
          />
        </Row>

        {/* Reduced motion tri-state */}
        <Row icon="🎞️">
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {(['auto', 'off', 'on'] as MotionPref[]).map((mode) => (
              <SegBtn
                key={mode}
                active={settings.reducedMotion === mode}
                label={`Motion ${mode}`}
                onClick={() => setSettings({ reducedMotion: mode })}
              >
                {mode === 'auto' ? '🔄' : mode === 'off' ? '🐇' : '🐢'}
              </SegBtn>
            ))}
          </div>
        </Row>

        {/* High contrast */}
        <Row icon="◐">
          <SegBtn
            active={settings.highContrast}
            label="High contrast"
            wide
            onClick={() => setSettings({ highContrast: !settings.highContrast })}
          >
            {settings.highContrast ? 'ON' : 'OFF'}
          </SegBtn>
        </Row>

        {/* Haptics */}
        <Row icon="📳">
          <SegBtn
            active={settings.haptics}
            label="Haptics"
            wide
            onClick={() => {
              const next = !settings.haptics
              setSettings({ haptics: next })
              if (next && 'vibrate' in navigator) navigator.vibrate(30)
            }}
          >
            {settings.haptics ? 'ON' : 'OFF'}
          </SegBtn>
        </Row>
      </motion.div>
    </motion.div>
  )
}

function Row({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 56 }}>
      <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{icon}</span>
      {children}
    </div>
  )
}

function SegBtn({
  active,
  label,
  onClick,
  wide,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      onClick={() => {
        audio.tick()
        onClick()
      }}
      style={{
        flex: wide ? 1 : '1 1 0',
        minHeight: 56,
        borderRadius: 14,
        background: active ? 'var(--mv-cyan)' : 'var(--mv-surface-1)',
        color: active ? '#0a0a0a' : 'var(--mv-text)',
        border: `1px solid ${active ? 'var(--mv-cyan)' : 'var(--mv-border)'}`,
        fontFamily: 'var(--mv-font-display)',
        fontSize: 16,
        fontWeight: 600,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {children}
    </button>
  )
}
