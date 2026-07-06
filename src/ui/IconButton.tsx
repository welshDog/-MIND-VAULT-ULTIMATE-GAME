import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useHaptics } from '../hooks/useHaptics'
import { audio } from '../audio/engine'

interface Props {
  label: string // accessible label (zero visible text, but screen-reader friendly)
  onClick?: () => void
  children: ReactNode
  size?: number
  accent?: string
  variant?: 'ghost' | 'solid' | 'primary'
  disabled?: boolean
}

/** Round tactile button. Always ≥56px hit target. Tick + haptic on press. */
export function IconButton({
  label,
  onClick,
  children,
  size = 56,
  accent = 'var(--mv-cyan)',
  variant = 'ghost',
  disabled = false,
}: Props) {
  const haptic = useHaptics()

  const bg =
    variant === 'primary'
      ? accent
      : variant === 'solid'
        ? 'var(--mv-surface-1)'
        : 'rgba(255,255,255,0.03)'
  const color = variant === 'primary' ? '#0a0a0a' : 'var(--mv-text)'

  return (
    <motion.button
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        audio.tick()
        haptic('tick')
        onClick?.()
      }}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        width: size,
        height: size,
        minWidth: size,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        background: bg,
        color,
        border: '1px solid var(--mv-border)',
        fontSize: size * 0.4,
        opacity: disabled ? 0.35 : 1,
        boxShadow:
          variant === 'primary' ? `0 0 24px -6px ${accent}` : 'none',
      }}
    >
      {children}
    </motion.button>
  )
}
