import { motion } from 'motion/react'

interface Props {
  total: number
  filled: number
  accent?: string
  size?: number
}

/** Row of dots — visual progress with no numbers required. */
export function ProgressPips({ total, filled, accent = 'var(--mv-cyan)', size = 10 }: Props) {
  return (
    <div style={{ display: 'flex', gap: size * 0.6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < filled
        return (
          <motion.span
            key={i}
            initial={false}
            animate={{
              scale: on ? 1 : 0.7,
              backgroundColor: on ? accent : 'rgba(255,255,255,0.14)',
              boxShadow: on ? `0 0 10px -2px ${accent}` : '0 0 0 0 transparent',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            style={{ width: size, height: size, borderRadius: '50%', display: 'block' }}
          />
        )
      })}
    </div>
  )
}
