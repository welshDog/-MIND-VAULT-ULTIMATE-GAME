import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges } from '@react-three/drei'
import { MathUtils, type Group, type Mesh, type PointLight, type MeshStandardMaterial } from 'three'
import type { ThemeDef } from '../themes/types'
import { useGame } from '../state/store'
import { useReducedMotion } from '../hooks/useReducedMotion'

const OPEN_ANGLE = -1.9 // radians the lid tilts back when open

export function VaultBox({ theme }: { theme: ThemeDef }) {
  const root = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const core = useRef<Mesh>(null)
  const coreLight = useRef<PointLight>(null)
  const screen = useGame((s) => s.screen)
  const reduced = useReducedMotion()

  const open = useRef(0)

  useFrame((_, delta) => {
    // Idle spin only while the box is a background element.
    if (root.current) {
      const idle = (screen === 'menu' || screen === 'splash') && !reduced
      if (idle) root.current.rotation.y += delta * 0.25
    }

    // Lid open state follows victory.
    const target = screen === 'victory' ? 1 : 0
    open.current = reduced
      ? target
      : MathUtils.damp(open.current, target, 4, delta)

    if (lid.current) lid.current.rotation.x = open.current * OPEN_ANGLE

    // Interior core floods with light as the lid opens.
    if (core.current) {
      const mat = core.current.material as MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + open.current * 4
    }
    if (coreLight.current) coreLight.current.intensity = open.current * 14
  })

  return (
    <group ref={root}>
      {/* Base */}
      <group position={[0, -0.35, 0]}>
        <RoundedBox args={[2.2, 1.5, 2.2]} radius={0.1} smoothness={4}>
          <meshStandardMaterial
            color="#14161a"
            metalness={0.85}
            roughness={0.4}
            emissive={theme.accent}
            emissiveIntensity={0.06}
          />
          <Edges threshold={15} color={theme.accent} />
        </RoundedBox>
      </group>

      {/* Lid — pivots at the back-top edge */}
      <group ref={lid} position={[0, 0.4, -1.1]}>
        <group position={[0, 0.25, 1.1]}>
          <RoundedBox args={[2.2, 0.5, 2.2]} radius={0.1} smoothness={4}>
            <meshStandardMaterial
              color="#181b20"
              metalness={0.9}
              roughness={0.35}
              emissive={theme.accent}
              emissiveIntensity={0.08}
            />
            <Edges threshold={15} color={theme.accent} />
          </RoundedBox>
        </group>
      </group>

      {/* Interior glow core */}
      <mesh ref={core} position={[0, -0.2, 0]}>
        <icosahedronGeometry args={[0.45, 2]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={0.2}
          toneMapped={false}
          roughness={0.2}
        />
      </mesh>
      <pointLight ref={coreLight} position={[0, 0.2, 0]} color={theme.accent} intensity={0} distance={8} />
    </group>
  )
}
