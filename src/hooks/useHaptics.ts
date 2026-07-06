import { useCallback } from 'react'
import { useGame } from '../state/store'

type Pattern = 'tick' | 'snap' | 'success' | 'victory' | 'error'

const PATTERNS: Record<Pattern, number | number[]> = {
  tick: 10,
  snap: 20,
  success: [15, 40, 25],
  victory: [30, 50, 30, 50, 80],
  error: [40, 30, 40],
}

/** Haptic feedback gated by the user setting. No-op where unsupported. */
export function useHaptics() {
  const enabled = useGame((s) => s.settings.haptics)
  return useCallback(
    (pattern: Pattern) => {
      if (!enabled) return
      if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
      try {
        navigator.vibrate(PATTERNS[pattern])
      } catch {
        /* ignore */
      }
    },
    [enabled],
  )
}
