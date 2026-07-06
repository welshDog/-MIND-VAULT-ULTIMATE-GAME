import { useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { useGame } from './state/store'
import { audio } from './audio/engine'
import { GameCanvas } from './scenes/GameCanvas'
import { Splash } from './screens/Splash'
import { WorldSelect } from './screens/WorldSelect'
import { BoxPreview } from './screens/BoxPreview'
import { PlayingHud } from './screens/PlayingHud'
import { VictoryOverlay } from './screens/VictoryOverlay'

export default function App() {
  const screen = useGame((s) => s.screen)
  const highContrast = useGame((s) => s.settings.highContrast)
  const volume = useGame((s) => s.settings.volume)

  // Reflect accessibility + audio settings to the environment.
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? 'high' : 'normal'
  }, [highContrast])
  useEffect(() => {
    audio.setVolume(volume)
  }, [volume])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* Persistent 3D scene behind every screen */}
      <GameCanvas />

      <AnimatePresence mode="wait">
        {screen === 'splash' && <Splash key="splash" />}
        {screen === 'menu' && <WorldSelect key="menu" />}
        {screen === 'preview' && <BoxPreview key="preview" />}
        {screen === 'playing' && <PlayingHud key="playing" />}
        {screen === 'victory' && <VictoryOverlay key="victory" />}
      </AnimatePresence>
    </div>
  )
}
