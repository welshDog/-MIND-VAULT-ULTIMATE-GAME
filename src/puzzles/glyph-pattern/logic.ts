import { rng } from '../types'

export interface GlyphState {
  cols: number
  rows: number
  path: number[] // node indices in tap order
  traced: number[]
}

export function createInitial(seed: number, difficulty: number): GlyphState {
  const r = rng(seed)
  const cols = 3
  const rows = difficulty >= 4 ? 3 : 2
  const nodeCount = cols * rows
  const length = Math.min(nodeCount, 3 + Math.floor(difficulty / 2)) // 3..5

  // Random walk over distinct nodes.
  const available = Array.from({ length: nodeCount }, (_, i) => i)
  const path: number[] = []
  for (let i = 0; i < length; i++) {
    const pick = Math.floor(r() * available.length)
    path.push(available[pick])
    available.splice(pick, 1)
  }
  return { cols, rows, path, traced: [] }
}

export function isSolved(s: GlyphState): boolean {
  return s.traced.length === s.path.length
}

export function progress(s: GlyphState): number {
  return s.traced.length / s.path.length
}

/** [next, correct] — a wrong tap crumbles the trace (harmless reset). */
export function tap(s: GlyphState, node: number): [GlyphState, boolean] {
  const expected = s.path[s.traced.length]
  if (node === expected) return [{ ...s, traced: [...s.traced, node] }, true]
  if (s.traced.length === 0) return [s, false]
  return [{ ...s, traced: [] }, false]
}
