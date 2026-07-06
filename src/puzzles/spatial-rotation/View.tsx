import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { type Group } from 'three'
import type { PuzzleViewProps } from '../types'
import type { SpatialRotationState } from './logic'
import { rotate, aligned } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const SEG_H = 0.34

export function SpatialRotationView({ state, onChange, theme, reduced }: PuzzleViewProps<SpatialRotationState>) {
  const haptic = useHaptics()
  const count = state.rot.length

  const tap = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const dir = e.point.x >= 0 ? 1 : -1
    const next = rotate(state, i, dir)
    audio.note(theme.sound, count - i)
    haptic('tick')
    onChange(next)
  }

  return (
    <group>
      {state.rot.map((_, i) => {
        const y = ((count - 1) / 2 - i) * SEG_H
        return (
          <Segment
            key={i}
            y={y}
            rot={state.rot[i]}
            detents={state.detents}
            aligned={aligned(state, i)}
            accent={theme.accent}
            reduced={reduced}
            onClick={(e) => tap(i, e)}
          />
        )
      })}
    </group>
  )
}

function Segment({
  y,
  rot,
  detents,
  aligned,
  accent,
  reduced,
  onClick,
}: {
  y: number
  rot: number
  detents: number
  aligned: boolean
  accent: string
  reduced: boolean
  onClick: (e: ThreeEvent<MouseEvent>) => void
}) {
  const spin = useRef<Group>(null)
  const targetY = (rot / detents) * Math.PI * 2

  useFrame((_, delta) => {
    if (!spin.current) return
    // Shortest-path damp toward target angle.
    let cur = spin.current.rotation.y
    let diff = ((targetY - cur + Math.PI) % (Math.PI * 2)) - Math.PI
    if (reduced) cur = targetY
    else cur += diff * (1 - Math.pow(0.001, delta))
    spin.current.rotation.y = cur
  })

  return (
    <group position={[0, y, 0]}>
      {/* Clickable drum */}
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.34, 0.34, SEG_H * 0.86, 32]} />
        <meshStandardMaterial color="#181b21" metalness={0.7} roughness={0.4} emissive={accent} emissiveIntensity={0.05} />
      </mesh>
      {/* Rotating glyph fragment */}
      <group ref={spin}>
        <mesh position={[0, 0, 0.345]}>
          <boxGeometry args={[0.12, SEG_H * 0.6, 0.04]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={aligned ? 2.4 : 0.4}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}
