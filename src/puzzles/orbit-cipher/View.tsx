import { useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { type Group } from 'three'
import type { PuzzleViewProps } from '../types'
import type { CipherNode, OrbitCipherState } from './logic'
import { activate, isNext } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const RADIUS = 1.55 // ring sits just outside the vault's 1.1 surface → back nodes hide
const GREEN = '#10f5a0'
const RED = '#ef4444'

export function OrbitCipherView({
  state,
  onChange,
  theme,
  reduced,
  onMistake,
}: PuzzleViewProps<OrbitCipherState>) {
  const haptic = useHaptics()
  const [flash, setFlash] = useState<number | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tap = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (state.locked[i]) return
    if (isNext(state, i)) {
      audio.note(theme.sound, state.nodes[i].value) // ascending pitch as you climb
      haptic('snap')
      onChange(activate(state, i))
    } else {
      onMistake()
      haptic('error')
      audio.note(theme.sound, 0)
      setFlash(i)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setFlash(null), 460)
    }
  }

  return (
    // Recenter on the vault (the stage mounts puzzles in front of the box).
    <group position={[0, -0.25, -1.15]}>
      {/* faint guide ring at the equator */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS, 0.008, 8, 72]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.22} toneMapped={false} />
      </mesh>

      {state.nodes.map((node, i) => (
        <Node
          key={i}
          node={node}
          index={i}
          locked={state.locked[i]}
          accent={theme.accent}
          flashing={flash === i}
          reduced={reduced}
          onTap={tap}
        />
      ))}
    </group>
  )
}

function Node({
  node,
  index,
  locked,
  accent,
  flashing,
  reduced,
  onTap,
}: {
  node: CipherNode
  index: number
  locked: boolean
  accent: string
  flashing: boolean
  reduced: boolean
  onTap: (i: number, e: ThreeEvent<MouseEvent>) => void
}) {
  const inner = useRef<Group>(null)
  useFrame((st) => {
    if (!inner.current) return
    if (reduced) {
      inner.current.position.y = 0
      inner.current.scale.setScalar(locked ? 1.05 : 1)
      return
    }
    const t = st.clock.elapsedTime
    inner.current.position.y = Math.sin(t * 1.5 + index) * 0.03
    // Unlocked nodes breathe to read as "interactive"; locked ones sit proud.
    const target = locked ? 1.08 : 1 + Math.sin(t * 3 + index) * 0.05
    inner.current.scale.setScalar(target)
  })

  const color = locked ? GREEN : flashing ? RED : accent

  return (
    // rotation.y = angle → the node's local +z faces radially outward, so its
    // pip count reads correctly once you orbit round to that side.
    <group
      position={[Math.sin(node.angle) * RADIUS, 0, Math.cos(node.angle) * RADIUS]}
      rotation={[0, node.angle, 0]}
    >
      <group ref={inner}>
        <mesh onClick={(e) => onTap(index, e)}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={locked ? 2.4 : 1.1}
            metalness={0.3}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>

        {/* value pips, facing outward */}
        <group position={[0, 0.34, 0.02]}>
          {Array.from({ length: node.value }).map((_, i) => (
            <mesh key={i} position={[(i - (node.value - 1) / 2) * 0.11, 0, 0]}>
              <sphereGeometry args={[0.036, 12, 12]} />
              <meshBasicMaterial color={locked ? GREEN : '#f0f4ff'} toneMapped={false} />
            </mesh>
          ))}
        </group>

        {locked && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.23, 0.02, 8, 28]} />
            <meshBasicMaterial color={GREEN} toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  )
}
