import { Float, Edges } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'
import type { ReactElement } from 'react'
import type { PuzzleViewProps } from '../types'
import type { ShapeAssemblyState, ShapeKind } from './logic'
import { select, place } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const SPACING = 0.5

function geo(kind: ShapeKind): ReactElement {
  switch (kind) {
    case 'box':
      return <boxGeometry args={[0.26, 0.26, 0.26]} />
    case 'cone':
      return <coneGeometry args={[0.17, 0.3, 4]} />
    case 'sphere':
      return <sphereGeometry args={[0.17, 24, 24]} />
    case 'cyl':
      return <cylinderGeometry args={[0.15, 0.15, 0.28, 20]} />
    case 'octa':
      return <octahedronGeometry args={[0.19, 0]} />
  }
}

export function ShapeAssemblyView({ state, onChange, theme, reduced, onMistake }: PuzzleViewProps<ShapeAssemblyState>) {
  const haptic = useHaptics()
  const n = state.sockets.length

  const tapPiece = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (state.pieces[i].placed) return
    audio.tick()
    haptic('tick')
    onChange(select(state, i))
  }

  const tapSocket = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const [next, ok] = place(state, i)
    if (ok) {
      audio.success(theme.sound)
      haptic('snap')
    } else if (state.selected != null) {
      audio.error()
      haptic('error')
      onMistake()
    }
    onChange(next)
  }

  return (
    <group>
      {/* Sockets (bottom row) */}
      <group position={[0, -0.28, 0]}>
        {state.sockets.map((s, i) => {
          const x = (i - (n - 1) / 2) * SPACING
          return (
            <mesh key={i} position={[x, 0, 0]} onClick={(e) => tapSocket(i, e)}>
              {geo(s.shape)}
              {s.filled ? (
                <meshStandardMaterial
                  color={theme.palette[i % theme.palette.length]}
                  emissive={theme.palette[i % theme.palette.length]}
                  emissiveIntensity={1.6}
                  toneMapped={false}
                />
              ) : (
                <meshStandardMaterial color="#0e1013" transparent opacity={0.25} />
              )}
              {!s.filled && <Edges threshold={15} color={theme.accent} />}
            </mesh>
          )
        })}
      </group>

      {/* Pieces (top row, floating) */}
      <group position={[0, 0.34, 0.1]}>
        {state.pieces.map((p, i) => {
          if (p.placed) return null
          const x = (i - (n - 1) / 2) * SPACING
          const isSel = state.selected === i
          return (
            <Float key={i} speed={reduced ? 0 : 3} floatIntensity={reduced ? 0 : 0.5} rotationIntensity={reduced ? 0 : 0.6}>
              <mesh
                position={[x, isSel ? 0.12 : 0, 0]}
                scale={isSel ? 1.25 : 1}
                onClick={(e) => tapPiece(i, e)}
              >
                {geo(p.shape)}
                <meshStandardMaterial
                  color={theme.palette[i % theme.palette.length]}
                  emissive={theme.palette[i % theme.palette.length]}
                  emissiveIntensity={isSel ? 1.8 : 0.5}
                  metalness={0.3}
                  roughness={0.4}
                  toneMapped={false}
                />
              </mesh>
            </Float>
          )
        })}
      </group>
    </group>
  )
}
