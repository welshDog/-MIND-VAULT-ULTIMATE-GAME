import { useEffect, useState } from 'react'
import { useGame } from '../state/store'

/**
 * Single source of truth for motion. Merges the OS `prefers-reduced-motion`
 * media query with the in-app tri-state override (auto/on/off).
 * Every animation site MUST read motion through this — never the media query
 * directly — so the settings override always wins.
 */
export function useReducedMotion(): boolean {
  const pref = useGame((s) => s.settings.reducedMotion)
  const [osReduced, setOsReduced] = useState(() =>
    typeof matchMedia !== 'undefined'
      ? matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setOsReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (pref === 'on') return true
  if (pref === 'off') return false
  return osReduced
}
