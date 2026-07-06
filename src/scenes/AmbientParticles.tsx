import { Sparkles } from '@react-three/drei'
import type { ThemeDef } from '../themes/types'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** Floating ambient dust — theme-tinted. Suppressed under reduced motion. */
export function AmbientParticles({ theme }: { theme: ThemeDef }) {
  const reduced = useReducedMotion()
  if (reduced) return null
  return (
    <Sparkles
      count={40}
      scale={[10, 6, 10]}
      size={2.5}
      speed={0.3}
      opacity={0.5}
      color={theme.accent}
    />
  )
}
