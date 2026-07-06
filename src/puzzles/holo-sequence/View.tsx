import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { type Group } from 'three'
import type { PuzzleViewProps } from '../types'
import type { HoloState } from './logic'
import { press } from './logic'
import { audio } from '../../audio/engine'
import { useHaptics } from '../../hooks/useHaptics'

const SHAPES = ['tetra', 'box', 'octa', 'cone', 'sphere', 'cyl'] as const

function shapeGeo(i: number): ReactElement {
  switch (SHAPES[i % SHAPES.length]) {
    case 'tetra':
      return <tetrahedronGeometry args={[0.11, 0]} />
    case 'box':
      return <boxGeometry args={[0.16, 0.16, 0.16]} />
    case 'octa':
      return <octahedronGeometry args={[0.12, 0]} />
    case 'cone':
      return <coneGeometry args={[0.1, 0.2, 5]} />
    case 'sphere':
      return <sphereGeometry args={[0.11, 20, 20]} />
    case 'cyl':
      return <cylinderGeometry args={[0.09, 0.09, 0.18, 18]} />
  }
}

export function HoloSequenceView({ state, onChange, theme, reduced }: PuzzleViewProps<HoloState>) {
  const haptic = useHaptics()
  const n = state.panelCount
  const [active, setActive] = useState<number | null>(null)
  const [accepting, setAccepting] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const prevInput = useRef(state.input)

  const panelX = (i: number) => (i - (n - 1) / 2) * 0.42
  const panelPos = (i: number): [number, number, number] => [panelX(i), 0.05, 0]

  // Play the current sequence, then accept input.
  const playSequence = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setAccepting(false)
    const stepMs = reduced ? 260 : 460
    state.sequence.forEach((panel, k) => {
      timers.current.push(
        setTimeout(() => {
          setActive(panel)
          audio.note(theme.sound, panel + 1)
          haptic('tick')
        }, k * stepMs),
      )
      timers.current.push(setTimeout(() => setActive(null), k * stepMs + stepMs * 0.6))
    })
    timers.current.push(setTimeout(() => setAccepting(true), state.sequence.length * stepMs + 150))
  }

  // Play on mount and whenever a wrong press resets progress to 0.
  useEffect(() => {
    playSequence()
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (prevInput.current > 0 && state.input === 0) {
      audio.error()
      haptic('error')
      playSequence()
    }
    prevInput.current = state.input
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.input])

  const tap = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!accepting) return
    const expected = state.sequence[state.input]
    setActive(i)
    setTimeout(() => setActive(null), 180)
    audio.note(theme.sound, i + 1)
    haptic(i === expected ? 'tick' : 'error')
    onChange(press(state, i)[0])
  }

  return (
    <group>
      {Array.from({ length: n }).map((_, i) => (
        <Panel
          key={i}
          position={panelPos(i)}
          color={theme.palette[i % theme.palette.length]}
          active={active === i}
          reduced={reduced}
          onClick={(e) => tap(i, e)}
        >
          {shapeGeo(i)}
        </Panel>
      ))}
    </group>
  )
}

function Panel({
  position,
  color,
  active,
  reduced,
  onClick,
  children,
}: {
  position: [number, number, number]
  color: string
  active: boolean
  reduced: boolean
  onClick: (e: ThreeEvent<MouseEvent>) => void
  children: ReactElement
}) {
  const g = useRef<Group>(null)
  useFrame((_, delta) => {
    if (!g.current) return
    const target = active ? 1.25 : 1
    const s = reduced ? target : g.current.scale.x + (target - g.current.scale.x) * Math.min(1, delta * 14)
    g.current.scale.setScalar(s)
    if (!reduced) g.current.rotation.y += delta * 0.5
  })
  return (
    <group position={position}>
      {/* Translucent holo backing */}
      <mesh onClick={onClick}>
        <planeGeometry args={[0.34, 0.44]} />
        <meshStandardMaterial color={color} transparent opacity={active ? 0.32 : 0.12} emissive={color} emissiveIntensity={active ? 1.2 : 0.2} toneMapped={false} />
      </mesh>
      <group ref={g}>
        <mesh>
          {children}
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2.4 : 0.8} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
