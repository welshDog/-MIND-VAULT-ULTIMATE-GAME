import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { Color, type PointLight } from 'three'
import type { ThemeDef } from '../themes/types'
import { useReducedMotion } from '../hooks/useReducedMotion'

const keyColor = new Color()
const rimColor = new Color()

/** Hand-built light rig + fog per theme. No external HDR (offline-safe). */
export function ThemeEnvironment({ theme }: { theme: ThemeDef }) {
  const env = theme.env
  const key = useRef<PointLight>(null)
  const rim = useRef<PointLight>(null)
  const reduced = useReducedMotion()

  // Smoothly cross-fade light colors when the theme changes.
  useFrame((_, delta) => {
    const k = reduced ? 1 : 1 - Math.pow(0.01, delta)
    keyColor.set(env.keyLightColor)
    rimColor.set(env.rimLightColor)
    key.current?.color.lerp(keyColor, k)
    rim.current?.color.lerp(rimColor, k)
  })

  return (
    <group>
      <fog attach="fog" args={[env.fogColor, env.fogNear, env.fogFar]} />
      <ambientLight intensity={env.ambient} />
      <hemisphereLight args={[env.keyLightColor, env.fogColor, 0.4]} />
      <pointLight
        ref={key}
        position={[4, 5, 4]}
        intensity={env.keyIntensity * 12}
        distance={30}
        decay={1.4}
      />
      <pointLight
        ref={rim}
        position={[-5, 2, -4]}
        intensity={env.keyIntensity * 8}
        distance={28}
        decay={1.5}
      />
      <ContactShadows
        position={[0, -1.15, 0]}
        opacity={0.5}
        scale={9}
        blur={2.6}
        far={4}
        resolution={256}
        color="#000000"
      />
    </group>
  )
}
