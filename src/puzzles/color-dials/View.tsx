import { useRef } from 'react'
import { Float } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import type { PuzzleViewProps } from '../types'
import type { ColorDialsState } from './logic'
import { cycle, matched } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const SPACING = 0.52

export function ColorDialsView({ state, onChange, theme, reduced }: PuzzleViewProps<ColorDialsState>) {
  const haptic = useHaptics()
  const count = state.dials.length

  const tap = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const next = cycle(state, i)
    audio.note(theme.sound, next.dials[i])
    haptic('tick')
    onChange(next)
  }

  return (
    <group>
      {state.dials.map((colorIdx, i) => {
        const x = (i - (count - 1) / 2) * SPACING
        const isMatch = matched(state, i)
        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Target orb floating above */}
            <Float speed={reduced ? 0 : 2} floatIntensity={reduced ? 0 : 0.4} rotationIntensity={0}>
              <mesh position={[0, 0.55, 0]}>
                <sphereGeometry args={[0.09, 20, 20]} />
                <meshStandardMaterial
                  color={theme.palette[state.target[i]]}
                  emissive={theme.palette[state.target[i]]}
                  emissiveIntensity={1.6}
                  toneMapped={false}
                />
              </mesh>
            </Float>

            {/* The dial */}
            <Dial
              color={theme.palette[colorIdx]}
              matched={isMatch}
              reduced={reduced}
              onClick={(e) => tap(i, e)}
            />
          </group>
        )
      })}
    </group>
  )
}

function Dial({
  color,
  matched,
  reduced,
  onClick,
}: {
  color: string
  matched: boolean
  reduced: boolean
  onClick: (e: ThreeEvent<MouseEvent>) => void
}) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    const targetScale = matched ? 1.12 : 1
    const s = reduced ? targetScale : MathUtils.damp(ref.current.scale.x, targetScale, 10, delta)
    ref.current.scale.setScalar(s)
    if (!reduced && !matched) ref.current.rotation.z += delta * 0.4
  })
  return (
    <group ref={ref}>
      <mesh onClick={onClick} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.06, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={matched ? 2.2 : 0.9}
          metalness={0.3}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
      {/* Inner disc fill */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={matched ? 1.4 : 0.4} toneMapped={false} />
      </mesh>
      {matched && (
        <mesh position={[0, 0, 0.03]}>
          <ringGeometry args={[0.2, 0.23, 32]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
