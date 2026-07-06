import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useGame, type Screen } from '../state/store'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface View {
  pos: [number, number, number]
  tgt: [number, number, number]
}

const VIEWS: Record<Screen, View> = {
  splash: { pos: [0, 1.6, 10], tgt: [0, 0, 0] },
  menu: { pos: [0, 2.0, 8.5], tgt: [0, 0.2, 0] },
  preview: { pos: [0, 1.1, 5.4], tgt: [0, 0, 0] },
  playing: { pos: [0, 0.9, 5.6], tgt: [0, 0, 0] },
  victory: { pos: [0, 1.3, 6.6], tgt: [0, 0.2, 0] },
}

const tmpPos = new Vector3()
const tmpTgt = new Vector3()

export function CameraRig() {
  const screen = useGame((s) => s.screen)
  const reduced = useReducedMotion()
  const controls = useRef<OrbitControlsImpl>(null)

  // Puzzles live on the box's front face, so the playing camera stays fixed
  // and square-on for focus. Only the preview screen hands the camera to
  // OrbitControls (for the auto-spin showcase).
  const autoSpin = screen === 'preview' && !reduced

  useFrame((state, delta) => {
    const view = VIEWS[screen]
    // Let OrbitControls own the camera only while auto-spinning.
    if (autoSpin) return

    tmpPos.set(...view.pos)
    tmpTgt.set(...view.tgt)

    if (reduced) {
      state.camera.position.copy(tmpPos)
      if (controls.current) controls.current.target.copy(tmpTgt)
    } else {
      const k = 1 - Math.pow(0.0015, delta) // frame-rate independent smoothing
      state.camera.position.lerp(tmpPos, k)
      if (controls.current) controls.current.target.lerp(tmpTgt, k)
    }
    controls.current?.update()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={false}
      enablePan={false}
      enableZoom={false}
      autoRotate={autoSpin}
      autoRotateSpeed={0.8}
    />
  )
}
