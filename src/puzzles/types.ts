import type { FC } from 'react'
import type { PuzzleId, ThemeDef } from '../themes/types'

export interface PuzzleViewProps<S> {
  state: S
  onChange: (next: S) => void
  theme: ThemeDef
  reduced: boolean
  solved: boolean
  /** Report a wrong move (drives the no-mistakes achievements; never punishing). */
  onMistake: () => void
}

export interface PuzzleModule<S = unknown> {
  id: PuzzleId
  /** Deterministic per (seed, difficulty) so replaying a box is stable. */
  createInitial: (seed: number, difficulty: number) => S
  isSolved: (state: S) => boolean
  /** 0..1 fill for the box glow / debugging. */
  progress: (state: S) => number
  View: FC<PuzzleViewProps<S>>
}

/** Small seeded PRNG (mulberry32) — stable puzzles across sessions. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable seed from theme/box/slot so a given box always generates the same puzzles. */
export function seedFor(themeId: string, boxIndex: number, slot: number): number {
  let h = 2166136261
  const str = `${themeId}:${boxIndex}:${slot}`
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export type { PuzzleId }
