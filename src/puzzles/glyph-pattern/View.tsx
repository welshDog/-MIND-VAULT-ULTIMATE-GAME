import { useEffect, useRef, useState } from 'react'
import { Line } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'
import type { PuzzleViewProps } from '../types'
import type { GlyphState } from './logic'
import { tap } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const SX = 0.34
const SY = 0.34

export function GlyphPatternView({ state, onChange, theme, reduced }: PuzzleViewProps<GlyphState>) {
  const haptic = useHaptics()
  const { cols, rows } = state
  const pos = (node: number): [number, number, number] => {
    const c = node % cols
    const r = Math.floor(node / cols)
    return [(c - (cols - 1) / 2) * SX, ((rows - 1) / 2 - r) * SY + 0.05, 0.05]
  }

  // Flash the target path once on mount.
  const [flashCount, setFlashCount] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => {
    const step = reduced ? 200 : 340
    state.path.forEach((_, k) => timers.current.push(setTimeout(() => setFlashCount(k + 1), k * step)))
    timers.current.push(setTimeout(() => setFlashCount(0), state.path.length * step + 900))
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const gold = theme.palette[1]
  const flashPts = state.path.slice(0, flashCount).map(pos)
  const tracedPts = state.traced.map(pos)

  const tapNode = (node: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const before = state.traced.length
    const [next, correct] = tap(state, node)
    audio.note(theme.sound, state.traced.length + 1)
    haptic(correct ? 'tick' : 'error')
    if (!correct && before > 0) audio.error()
    onChange(next)
  }

  const nodeCount = cols * rows

  return (
    <group>
      {/* Flashed target path (faint gold guide) */}
      {flashPts.length > 1 && (
        <Line points={flashPts} color={gold} lineWidth={3} transparent opacity={0.55} dashed dashSize={0.05} gapSize={0.03} toneMapped={false} />
      )}

      {/* Player's molten-gold trace */}
      {tracedPts.length > 1 && (
        <Line points={tracedPts} color={gold} lineWidth={5} transparent opacity={0.95} toneMapped={false} />
      )}

      {/* Nodes */}
      {Array.from({ length: nodeCount }).map((_, node) => {
        const isTraced = state.traced.includes(node)
        const isFlashing = state.path.slice(0, flashCount).includes(node)
        const lit = isTraced || isFlashing
        return (
          <mesh key={node} position={pos(node)} onClick={(e) => tapNode(node, e)}>
            <sphereGeometry args={[0.05, 20, 20]} />
            <meshStandardMaterial
              color={lit ? gold : theme.accent}
              emissive={lit ? gold : theme.accent}
              emissiveIntensity={lit ? 2.4 : 0.5}
              toneMapped={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}
