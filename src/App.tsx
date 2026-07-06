import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useGame } from './state/store'
import { THEMES } from './themes'
import { audio } from './audio/engine'
import { Splash } from './screens/Splash'
import { WorldSelect } from './screens/WorldSelect'
import { BoxPreview } from './screens/BoxPreview'
import { PlayingHud } from './screens/PlayingHud'
import { VictoryOverlay } from './screens/VictoryOverlay'

export default function App() {
  const screen = useGame((s) => s.screen)
  const focusedTheme = useGame((s) => s.focusedTheme)
  const highContrast = useGame((s) => s.settings.highContrast)
  const volume = useGame((s) => s.settings.volume)

  // Reflect accessibility + audio settings to the environment.
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? 'high' : 'normal'
  }, [highContrast])
  useEffect(() => {
    audio.setVolume(volume)
  }, [volume])

  const accent = THEMES[focusedTheme].accent

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* Placeholder atmospheric background — replaced by the 3D canvas in P2 */}
      <motion.div
        aria-hidden
        animate={{
          background: `radial-gradient(120% 90% at 50% 30%, ${accent}22, var(--mv-bg) 55%)`,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0 }}
      />

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
