import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/**
 * Post-processing stack.
 * Bloom is threshold-based "selective" glow: only elements pushed above
 * luminanceThreshold (emissive seams, glow core, lit puzzle parts) bloom;
 * the environment stays below it. Chromatic aberration + depth-of-field
 * are added in P6.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.2}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.32} darkness={0.62} eskil={false} />
    </EffectComposer>
  )
}
