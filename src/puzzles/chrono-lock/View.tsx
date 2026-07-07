import { useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { type Group } from 'three'
import type { PuzzleViewProps } from '../types'
import type { ChronoLockState } from './logic'
import { angDist, currentTarget, strike } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const TAU = Math.PI * 2
const R = 0.72 // dial radius
const GREEN = '#10f5a0'
const RED = '#ef4444'

export function ChronoLockView({ state, onChange, theme, reduced, onMistake }: PuzzleViewProps<ChronoLockState>) {
  const haptic = useHaptics()
  const pointer = useRef<Group>(null)
  const angle = useRef(0)
  const [miss, setMiss] = useState(false)
  const missTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cur = currentTarget(state)
  const solved = cur < 0

  useFrame((_, delta) => {
    if (solved) return
    const spin = state.speed * (reduced ? 0.55 : 1)
    angle.current = (angle.current + spin * delta) % TAU
    if (pointer.current) pointer.current.rotation.z = angle.current
  })

  const striked = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (solved) return
    const res = strike(state, angle.current)
    if (res.landed) {
      audio.note(theme.sound, state.hit.filter(Boolean).length + 2) // rising confirm
      haptic('snap')
      onChange(res.state)
    } else {
      onMistake()
      haptic('error')
      audio.note(theme.sound, 0)
      setMiss(true)
      if (missTimer.current) clearTimeout(missTimer.current)
      missTimer.current = setTimeout(() => setMiss(false), 320)
    }
  }

  return (
    <group>
      {/* dial ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[R, 0.012, 10, 64]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {/* target dots + the current one's hit-window arc */}
      {state.targets.map((a, i) => {
        const done = state.hit[i]
        const isCur = i === cur
        return (
          <group key={i}>
            {isCur && (
              <mesh position={[0, 0, 0.005]}>
                <ringGeometry args={[R - 0.05, R + 0.05, 1, 24, a - state.tolerance, state.tolerance * 2]} />
                <meshBasicMaterial color={theme.accent} transparent opacity={0.28} toneMapped={false} />
              </mesh>
            )}
            <TargetDot angle={a} R={R} color={done ? GREEN : theme.accent} pulse={isCur && !reduced} bright={done} />
          </group>
        )
      })}

      {/* sweeping pointer */}
      <group ref={pointer}>
        <mesh position={[R / 2, 0, 0]}>
          <boxGeometry args={[R, 0.035, 0.02]} />
          <meshBasicMaterial color={miss ? RED : '#f0f4ff'} toneMapped={false} />
        </mesh>
        <mesh position={[R, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={miss ? RED : theme.accent}
            emissive={miss ? RED : theme.accent}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* hub — the "spinning button" you tap to strike */}
      <mesh onClick={striked}>
        <cylinderGeometry args={[0.13, 0.13, 0.05, 24]} />
        <meshStandardMaterial
          color={miss ? RED : theme.accent}
          emissive={miss ? RED : theme.accent}
          emissiveIntensity={miss ? 2.2 : 0.9}
          metalness={0.4}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* generous invisible tap target over the whole dial */}
      <mesh onClick={striked} position={[0, 0, 0.02]}>
        <circleGeometry args={[R + 0.12, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function TargetDot({
  angle,
  R,
  color,
  pulse,
  bright,
}: {
  angle: number
  R: number
  color: string
  pulse: boolean
  bright: boolean
}) {
  const ref = useRef<Group>(null)
  useFrame((st) => {
    if (!ref.current) return
    ref.current.scale.setScalar(pulse ? 1 + Math.sin(st.clock.elapsedTime * 5) * 0.18 : 1)
  })
  return (
    <group ref={ref} position={[Math.cos(angle) * R, Math.sin(angle) * R, 0]}>
      <mesh>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={bright ? 2.6 : 1.4}
          toneMapped={false}
        />
      </mesh>
      {bright && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.014, 8, 24]} />
          <meshBasicMaterial color={GREEN} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
