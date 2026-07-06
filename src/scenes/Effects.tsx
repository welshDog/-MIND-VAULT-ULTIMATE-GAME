import type { ReactNode } from 'react'
import { EffectComposer, Bloom, Vignette, DepthOfField, ChromaticAberration } from '@react-three/postprocessing'
import { Vector2 } from 'three'
import { useGame } from '../state/store'
import { useReducedMotion } from '../hooks/useReducedMotion'

const CA_OFFSET = new Vector2(0.0024, 0.0024)

/**
 * Post-processing stack.
 * - Bloom: threshold-based "selective" glow on emissive elements.
 * - DepthOfField: box-preview showcase (bokehScale 0 elsewhere).
 * - ChromaticAberration: brief crystal-shimmer on victory (skipped when reduced).
 * - Vignette: always-on framing.
 */
export function Effects() {
  const screen = useGame((s) => s.screen)
  const reduced = useReducedMotion()
  const preview = screen === 'preview'
  const victory = screen === 'victory'

  // Build the effect list explicitly so a conditional effect is a real
  // element or null (never a Fragment — postprocessing can't serialize those).
  const children: ReactNode[] = [
    <Bloom key="bloom" intensity={0.85} luminanceThreshold={0.7} luminanceSmoothing={0.25} mipmapBlur radius={0.72} />,
    <DepthOfField key="dof" focusDistance={0.02} focalLength={0.05} bokehScale={preview && !reduced ? 3.5 : 0} />,
    victory && !reduced ? <ChromaticAberration key="ca" offset={CA_OFFSET} radialModulation={false} modulationOffset={0} /> : null,
    <Vignette key="vig" offset={0.3} darkness={0.62} />,
  ]

  return <EffectComposer multisampling={4}>{children as never}</EffectComposer>
}
