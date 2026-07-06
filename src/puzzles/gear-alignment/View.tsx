import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { type Group } from 'three'
import type { PuzzleViewProps } from '../types'
import type { GearState, GearSize } from './logic'
import { select, place, torqueReach } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const SLOT = 0.34
const RADIUS: Record<GearSize, number> = { 0: 0.1, 1: 0.14, 2: 0.18 }

export function GearAlignmentView({ state, onChange, theme, reduced, onMistake }: PuzzleViewProps<GearState>) {
  const haptic = useHaptics()
  const n = state.pegs.length
  const reach = torqueReach(state)
  const slotX = (s: number) => (s - (n + 1) / 2) * SLOT

  const tapLoose = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (state.loose[i].placed) return
    audio.tick()
    haptic('tick')
    onChange(select(state, i))
  }
  const tapPeg = (i: number, e: ThreeEvent<MouseEvent>) => {
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

  const brass = theme.palette[0]
  const gold = theme.palette[1]

  return (
    <group position={[0, 0.05, 0]}>
      {/* Driver gear (always spinning) */}
      <Gear position={[slotX(0), 0, 0]} radius={0.16} color={brass} rim={theme.accent} spinning dir={1} reduced={reduced} />

      {/* Pegs */}
      {state.pegs.map((peg, i) => {
        const s = i + 1
        const filled = peg.gear != null
        const spinning = i < reach
        const dir = s % 2 === 0 ? 1 : -1
        return (
          <group key={i} position={[slotX(s), 0, 0]}>
            <mesh onClick={(e) => tapPeg(i, e)} visible={!filled}>
              <torusGeometry args={[RADIUS[peg.size], 0.012, 12, 28]} />
              <meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={0.6} toneMapped={false} />
            </mesh>
            {/* Peg hub target dot */}
            {!filled && (
              <mesh onClick={(e) => tapPeg(i, e)}>
                <circleGeometry args={[RADIUS[peg.size] * 0.9, 24]} />
                <meshStandardMaterial color="#0e0b05" transparent opacity={0.35} />
              </mesh>
            )}
            {filled && (
              <Gear position={[0, 0, 0]} radius={RADIUS[peg.size]} color={brass} rim={theme.accent} spinning={spinning} dir={dir} reduced={reduced} />
            )}
          </group>
        )
      })}

      {/* Output gear (golden; spins only when the chain completes) */}
      <Gear
        position={[slotX(n + 1), 0, 0]}
        radius={0.17}
        color={gold}
        rim={gold}
        spinning={reach >= n}
        dir={(n + 1) % 2 === 0 ? 1 : -1}
        reduced={reduced}
        glow
      />

      {/* Loose gear tray */}
      <group position={[0, -0.42, 0.05]}>
        {state.loose.map((g, i) => {
          if (g.placed) return null
          const x = (i - (state.loose.length - 1) / 2) * 0.3
          const sel = state.selected === i
          return (
            <group key={i} position={[x, 0, 0]} scale={sel ? 1.2 : 1}>
              <mesh onClick={(e) => tapLoose(i, e)}>
                <cylinderGeometry args={[RADIUS[g.size], RADIUS[g.size], 0.05, 8]} />
                <meshStandardMaterial
                  color={brass}
                  emissive={theme.accent}
                  emissiveIntensity={sel ? 1.4 : 0.25}
                  metalness={0.7}
                  roughness={0.4}
                  toneMapped={false}
                />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

function Gear({
  position,
  radius,
  color,
  rim,
  spinning,
  dir,
  reduced,
  glow,
}: {
  position: [number, number, number]
  radius: number
  color: string
  rim: string
  spinning: boolean
  dir: number
  reduced: boolean
  glow?: boolean
}) {
  const g = useRef<Group>(null)
  useFrame((_, delta) => {
    if (g.current && spinning && !reduced) g.current.rotation.z += delta * 1.6 * dir
  })
  return (
    <group position={position}>
      <group ref={g}>
        {/* Cog body (octagonal prism reads as teeth) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius, radius, 0.06, 8]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.35} emissive={rim} emissiveIntensity={glow ? 0.8 : 0.12} toneMapped={false} />
        </mesh>
        {/* Emissive rim */}
        <mesh>
          <torusGeometry args={[radius * 0.78, 0.012, 12, 24]} />
          <meshStandardMaterial color={rim} emissive={rim} emissiveIntensity={glow ? 2.2 : 1.1} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
