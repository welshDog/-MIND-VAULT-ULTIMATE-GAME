import { Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { useState } from 'react'
import { useGame } from '../state/store'
import { THEMES } from '../themes'
import { CameraRig } from './CameraRig'
import { ThemeEnvironment } from './ThemeEnvironment'
import { VaultBox } from './VaultBox'
import { AmbientParticles } from './AmbientParticles'
import { Effects } from './Effects'
import { PuzzleStage } from './PuzzleStage'
import { Confetti } from './Confetti'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** Resolve which theme drives the scene: hovered card in the menu, else the active run. */
export function useSceneTheme() {
  const screen = useGame((s) => s.screen)
  const focused = useGame((s) => s.focusedTheme)
  const current = useGame((s) => s.currentTheme)
  const id = screen === 'menu' || screen === 'splash' ? focused : current
  return THEMES[id]
}

export function GameCanvas({ children }: { children?: ReactNode }) {
  const [dpr, setDpr] = useState(1.5)
  const [lost, setLost] = useState(false)

  return (
    <>
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        camera={{ position: [0, 1.5, 9], fov: 45 }}
        style={{ position: 'absolute', inset: 0 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setLost(true)
          })
        }}
      >
        {/* Scale render resolution to sustain framerate on weaker GPUs. */}
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
        />
        <AdaptiveDpr pixelated />

        <Suspense fallback={null}>
          <SceneContents />
          {children}
        </Suspense>
      </Canvas>

      {lost && (
        <button
          onClick={() => location.reload()}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0,0,0,0.85)',
            color: 'var(--mv-text)',
            fontFamily: 'var(--mv-font-display)',
            letterSpacing: '0.15em',
            fontSize: 15,
          }}
        >
          ⟳ TAP TO RESTORE
        </button>
      )}
    </>
  )
}

function SceneContents() {
  const theme = useSceneTheme()
  const screen = useGame((s) => s.screen)
  const reduced = useReducedMotion()
  return (
    <>
      <CameraRig />
      <ThemeEnvironment theme={theme} />
      <VaultBox theme={theme} />
      <PuzzleStage />
      <AmbientParticles theme={theme} />
      {screen === 'victory' && !reduced && <Confetti theme={theme} />}
      <Effects />
    </>
  )
}
