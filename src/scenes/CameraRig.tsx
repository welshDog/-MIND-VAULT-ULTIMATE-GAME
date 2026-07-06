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
  const recenterToken = useGame((s) => s.recenterToken)
  const reduced = useReducedMotion()
  const controls = useRef<OrbitControlsImpl>(null)
  const lastScreen = useRef<Screen | null>(null)
  const lastToken = useRef(recenterToken)
  const returning = useRef(false)

  // Preview + victory show the vault off with a slow auto-spin. Playing hands
  // the camera to the player — drag to orbit a full 360°, scroll/pinch to zoom
  // — but it seeds a square-on framing on entry so every puzzle starts solvable,
  // and the 👁 button re-centres if you lose your bearings. Reduced-motion users
  // keep the original locked, scripted camera.
  const autoSpin = (screen === 'preview' || screen === 'victory') && !reduced
  const interactive = screen === 'playing' && !reduced

  useFrame((state, delta) => {
    const view = VIEWS[screen]
    const entering = lastScreen.current !== screen
    lastScreen.current = screen

    // A 👁 recenter tap re-frames the vault square-on without leaving orbit mode.
    if (recenterToken !== lastToken.current) {
      lastToken.current = recenterToken
      returning.current = interactive
    }
    if (entering) returning.current = false

    if (interactive) {
      if (entering) {
        // Never drop the player into a puzzle mid-spin — snap square-on.
        state.camera.position.set(...view.pos)
        controls.current?.target.set(...view.tgt)
      } else if (returning.current) {
        const k = 1 - Math.pow(0.0008, delta) // frame-rate independent glide
        state.camera.position.lerp(tmpPos.set(...view.pos), k)
        controls.current?.target.lerp(tmpTgt.set(...view.tgt), k)
        if (state.camera.position.distanceToSquared(tmpPos.set(...view.pos)) < 4e-4) {
          returning.current = false
        }
      }
      controls.current?.update()
      return
    }

    // Preview/victory: OrbitControls owns the camera for the auto-spin showcase.
    if (autoSpin) {
      if (entering && screen === 'victory') {
        // Frame the solved vault cleanly, wherever play left the camera.
        state.camera.position.set(...view.pos)
        controls.current?.target.set(...view.tgt)
      }
      controls.current?.update()
      return
    }

    // Splash/menu (and reduced-motion everywhere): glide to the scripted view.
    tmpPos.set(...view.pos)
    tmpTgt.set(...view.tgt)
    if (reduced) {
      state.camera.position.copy(tmpPos)
      if (controls.current) controls.current.target.copy(tmpTgt)
    } else {
      const k = 1 - Math.pow(0.0015, delta)
      state.camera.position.lerp(tmpPos, k)
      if (controls.current) controls.current.target.lerp(tmpTgt, k)
    }
    controls.current?.update()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={interactive}
      enablePan={false}
      enableZoom={interactive}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.7}
      zoomSpeed={0.6}
      minDistance={3.4}
      maxDistance={9}
      minPolarAngle={Math.PI * 0.16}
      maxPolarAngle={Math.PI * 0.86}
      autoRotate={autoSpin}
      autoRotateSpeed={0.8}
    />
  )
}
