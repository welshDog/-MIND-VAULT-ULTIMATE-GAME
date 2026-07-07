import { useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { type Mesh, type MeshBasicMaterial } from 'three'
import type { PuzzleViewProps } from '../types'
import type { Glyph, MatrixState } from './logic'
import { pick } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const CELL = 0.36 // grid cell pitch
const OPT = 0.34 // option pitch
const TWO_THIRDS_PI = (Math.PI * 2) / 3

/** One abstract glyph: `count` bars, tilted by `rot`, coloured by palette[color]. */
function GlyphMesh({ g, palette, dim = false }: { g: Glyph; palette: string[]; dim?: boolean }) {
  const col = palette[g.color] ?? palette[0]
  const bars = Array.from({ length: g.count })
  const spread = 0.08
  return (
    <group>
      {/* panel */}
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.035]} />
        <meshStandardMaterial
          color="#0f1b35"
          emissive={col}
          emissiveIntensity={dim ? 0.05 : 0.14}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      {/* bars, tilted as a group to encode rotation */}
      <group rotation={[0, 0, g.rot * TWO_THIRDS_PI]} position={[0, 0, 0.03]}>
        {bars.map((_, i) => (
          <mesh key={i} position={[(i - (g.count - 1) / 2) * spread, 0, 0]}>
            <boxGeometry args={[0.045, 0.15, 0.03]} />
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={dim ? 0.5 : 1.7}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Pulsing square outline marking the empty cell to fill. */
function BlankFrame({ accent, reduced }: { accent: string; reduced: boolean }) {
  const ref = useRef<Mesh>(null)
  useFrame((st) => {
    if (!ref.current || reduced) return
    const m = ref.current.material as MeshBasicMaterial
    m.opacity = 0.45 + 0.35 * Math.sin(st.clock.elapsedTime * 3)
  })
  return (
    <mesh ref={ref} rotation={[0, 0, Math.PI / 4]}>
      <ringGeometry args={[0.19, 0.215, 4]} />
      <meshBasicMaterial color={accent} transparent opacity={0.6} toneMapped={false} />
    </mesh>
  )
}

export function MatrixCompletionView({
  state,
  onChange,
  theme,
  reduced,
  onMistake,
}: PuzzleViewProps<MatrixState>) {
  const haptic = useHaptics()
  const [flash, setFlash] = useState<number | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const solved = state.picked !== null

  const optXs = useMemo(
    () => state.options.map((_, i) => (i - (state.options.length - 1) / 2) * OPT),
    [state.options],
  )

  const tap = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (solved) return
    if (i === state.answer) {
      haptic('success')
      onChange(pick(state, i)) // stage plays success + marks the box solved
    } else {
      onMistake()
      haptic('error')
      audio.note(theme.sound, 0)
      setFlash(i)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setFlash(null), 480)
    }
  }

  return (
    <group>
      {/* ── 3×3 matrix ── */}
      <group position={[0, 0.42, 0]}>
        {state.grid.map((g, i) => {
          const x = ((i % 3) - 1) * CELL
          const y = (1 - Math.floor(i / 3)) * CELL
          return (
            <group key={i} position={[x, y, 0]}>
              {g ? (
                <GlyphMesh g={g} palette={theme.palette} />
              ) : solved ? (
                <GlyphMesh g={state.options[state.answer]} palette={theme.palette} />
              ) : (
                <BlankFrame accent={theme.accent} reduced={reduced} />
              )}
            </group>
          )
        })}
      </group>

      {/* ── answer options ── */}
      <group position={[0, -0.72, 0]}>
        {state.options.map((g, i) => {
          const isFlash = flash === i
          const isChosen = solved && i === state.answer
          return (
            <group key={i} position={[optXs[i], 0, 0]}>
              {/* hit target + selection/flash ring */}
              <mesh onClick={(e) => tap(i, e)} visible={false}>
                <boxGeometry args={[OPT, OPT, 0.2]} />
              </mesh>
              {(isFlash || isChosen) && (
                <mesh position={[0, 0, -0.02]} rotation={[0, 0, Math.PI / 4]}>
                  <ringGeometry args={[0.2, 0.235, 4]} />
                  <meshBasicMaterial
                    color={isFlash ? '#ef4444' : '#10f5a0'}
                    toneMapped={false}
                  />
                </mesh>
              )}
              <OptionGlyph g={g} palette={theme.palette} dimmed={solved && !isChosen} reduced={reduced} />
            </group>
          )
        })}
      </group>
    </group>
  )
}

/** Option wrapper — gentle idle bob + fade of non-answers once solved. */
function OptionGlyph({
  g,
  palette,
  dimmed,
  reduced,
}: {
  g: Glyph
  palette: string[]
  dimmed: boolean
  reduced: boolean
}) {
  const group = useRef<import('three').Group>(null)
  useFrame((st) => {
    if (!group.current) return
    const target = dimmed ? 0.35 : 1
    group.current.scale.setScalar(
      reduced ? target : group.current.scale.x + (target - group.current.scale.x) * 0.12,
    )
    if (!reduced && !dimmed) group.current.position.y = Math.sin(st.clock.elapsedTime * 2 + g.count) * 0.012
  })
  return (
    <group ref={group}>
      <GlyphMesh g={g} palette={palette} />
    </group>
  )
}
