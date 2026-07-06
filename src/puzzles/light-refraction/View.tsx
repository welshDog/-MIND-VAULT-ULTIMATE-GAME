import { useMemo } from 'react'
import { Line, Sparkles } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'
import type { PuzzleViewProps } from '../types'
import type { LightState } from './logic'
import { trace, toggle } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const CS = 0.2

export function LightRefractionView({ state, onChange, theme, reduced }: PuzzleViewProps<LightState>) {
  const haptic = useHaptics()
  const originX = (-(state.w - 1) / 2) * CS
  const originY = ((state.h - 1) / 2) * CS
  const cell = (x: number, y: number): [number, number, number] => [originX + x * CS, originY - y * CS, 0.04]

  const { path, hit } = useMemo(() => trace(state), [state])
  const beamColor = theme.palette[4]
  const points = useMemo(() => path.map(({ x, y }) => cell(x, y)), [path]) // eslint-disable-line react-hooks/exhaustive-deps

  const tapMirror = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    audio.note(theme.sound, i + 2)
    haptic('tick')
    onChange(toggle(state, i))
  }

  return (
    <group>
      {/* Beam */}
      {points.length > 1 && (
        <Line points={points} color={beamColor} lineWidth={4} transparent opacity={0.95} toneMapped={false} />
      )}

      {/* Entry emitter */}
      <mesh position={cell(state.entry.x, state.entry.y)}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={beamColor} emissive={beamColor} emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* Mirrors */}
      {state.mirrors.map((m, i) => (
        <mesh
          key={i}
          position={cell(m.x, m.y)}
          rotation={[0, 0, m.orient === 0 ? Math.PI / 4 : -Math.PI / 4]}
          onClick={(e) => tapMirror(i, e)}
        >
          <boxGeometry args={[0.035, 0.2, 0.05]} />
          <meshStandardMaterial
            color={theme.accent}
            emissive={theme.accent}
            emissiveIntensity={0.9}
            metalness={0.2}
            roughness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Target gem */}
      <group position={cell(state.target.x, state.target.y)}>
        <mesh rotation={[0.4, 0.4, 0]}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial
            color={hit ? '#ffffff' : theme.accent}
            emissive={hit ? beamColor : theme.accent}
            emissiveIntensity={hit ? 3 : 0.5}
            toneMapped={false}
          />
        </mesh>
        {hit && !reduced && <Sparkles count={12} scale={0.5} size={3} speed={0.6} color={beamColor} />}
      </group>
    </group>
  )
}
