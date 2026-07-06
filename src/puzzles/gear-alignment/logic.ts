import { rng } from '../types'

export type GearSize = 0 | 1 | 2 // small, med, large

export interface GearState {
  pegs: { size: GearSize; gear: number | null }[] // driver -> output order
  loose: { size: GearSize; placed: boolean }[]
  selected: number | null
}

export function createInitial(seed: number, difficulty: number): GearState {
  const r = rng(seed)
  const n = Math.min(4, 2 + Math.floor(difficulty / 2)) // 2..4 pegs
  const sizes: GearSize[] = Array.from({ length: n }, () => Math.floor(r() * 3) as GearSize)
  const pegs = sizes.map((size) => ({ size, gear: null as number | null }))
  const loose = [...sizes].sort(() => r() - 0.5).map((size) => ({ size, placed: false }))
  return { pegs, loose, selected: null }
}

export function isSolved(s: GearState): boolean {
  return s.pegs.every((p) => p.gear != null)
}

export function progress(s: GearState): number {
  return s.pegs.filter((p) => p.gear != null).length / s.pegs.length
}

export function select(s: GearState, i: number): GearState {
  if (s.loose[i].placed) return s
  return { ...s, selected: s.selected === i ? null : i }
}

/** [next, placed] — placed=false is a harmless wrong attempt (size mismatch). */
export function place(s: GearState, pegIdx: number): [GearState, boolean] {
  if (s.selected == null) return [s, false]
  const peg = s.pegs[pegIdx]
  const g = s.loose[s.selected]
  if (peg.gear != null || g.size !== peg.size) return [{ ...s, selected: null }, false]
  const pegs = s.pegs.map((p, i) => (i === pegIdx ? { ...p, gear: s.selected! } : p))
  const loose = s.loose.map((l, i) => (i === s.selected ? { ...l, placed: true } : l))
  return [{ ...s, pegs, loose, selected: null }, true]
}

/** How far torque has propagated from the driver: count of contiguous filled pegs. */
export function torqueReach(s: GearState): number {
  let n = 0
  for (const p of s.pegs) {
    if (p.gear == null) break
    n++
  }
  return n
}
