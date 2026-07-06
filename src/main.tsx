import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'

// Dev-only debug handle for headless testing.
if (import.meta.env.DEV) {
  void Promise.all([import('./state/store'), import('./state/play')]).then(
    ([{ useGame }, { usePlay }]) => {
      ;(window as unknown as { __mv: unknown }).__mv = { game: useGame, play: usePlay }
    },
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
