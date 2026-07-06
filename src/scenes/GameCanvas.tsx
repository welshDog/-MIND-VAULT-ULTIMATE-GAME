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

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 1.5, 9], fov: 45 }}
      style={{ position: 'absolute', inset: 0 }}
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
  )
}

function SceneContents() {
  const theme = useSceneTheme()
  return (
    <>
      <CameraRig />
      <ThemeEnvironment theme={theme} />
      <VaultBox theme={theme} />
      <AmbientParticles theme={theme} />
      <Effects />
    </>
  )
}
