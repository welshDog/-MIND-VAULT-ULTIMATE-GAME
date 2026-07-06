import { rng } from '../types'

export type Dir = readonly [number, number] // y increases downward
export interface Mirror {
  x: number
  y: number
  orient: 0 | 1 // 0 = '/', 1 = '\'
}
export interface LightState {
  w: number
  h: number
  entry: { x: number; y: number; dir: Dir }
  target: { x: number; y: number }
  mirrors: Mirror[]
}

// Reflection tables (y down). Keyed by "dx,dy".
const REFLECT: Record<0 | 1, Record<string, Dir>> = {
  0: { '1,0': [0, -1], '0,1': [-1, 0], '-1,0': [0, 1], '0,-1': [1, 0] }, // '/'
  1: { '1,0': [0, 1], '0,-1': [-1, 0], '-1,0': [0, -1], '0,1': [1, 0] }, // '\'
}

interface Layout {
  w: number
  h: number
  entry: { x: number; y: number; dir: Dir }
  target: { x: number; y: number }
  mirrors: { x: number; y: number; sol: 0 | 1 }[]
}

// Fixed, guaranteed-solvable layouts by difficulty bucket.
function layoutFor(difficulty: number): Layout {
  if (difficulty <= 2) {
    return {
      w: 5, h: 5,
      entry: { x: 0, y: 2, dir: [1, 0] },
      target: { x: 2, y: 0 },
      mirrors: [{ x: 2, y: 2, sol: 0 }],
    }
  }
  if (difficulty <= 4) {
    return {
      w: 5, h: 5,
      entry: { x: 0, y: 2, dir: [1, 0] },
      target: { x: 4, y: 4 },
      mirrors: [
        { x: 2, y: 2, sol: 1 },
        { x: 2, y: 4, sol: 1 },
      ],
    }
  }
  return {
    w: 5, h: 5,
    entry: { x: 0, y: 2, dir: [1, 0] },
    target: { x: 3, y: 0 },
    mirrors: [
      { x: 1, y: 2, sol: 1 },
      { x: 1, y: 4, sol: 1 },
      { x: 3, y: 4, sol: 0 },
    ],
  }
}

export function createInitial(seed: number, difficulty: number): LightState {
  const l = layoutFor(difficulty)
  const r = rng(seed)
  const mirrors: Mirror[] = l.mirrors.map((m) => ({ x: m.x, y: m.y, orient: m.sol }))

  // Scramble at least one mirror so it's never pre-solved.
  const state: LightState = { w: l.w, h: l.h, entry: l.entry, target: l.target, mirrors }
  let flippedAny = false
  for (const m of mirrors) {
    if (r() < 0.6) {
      m.orient = (m.orient ^ 1) as 0 | 1
      flippedAny = true
    }
  }
  if (!flippedAny || isSolved(state)) {
    mirrors[0].orient = (mirrors[0].orient ^ 1) as 0 | 1
  }
  // Extremely unlikely, but guarantee unsolved at start.
  if (isSolved(state)) mirrors[mirrors.length - 1].orient = (mirrors[mirrors.length - 1].orient ^ 1) as 0 | 1
  return state
}

/** Trace the beam; return the ordered cell path and whether it hit the target. */
export function trace(s: LightState): { path: { x: number; y: number }[]; hit: boolean } {
  const path: { x: number; y: number }[] = []
  let x = s.entry.x
  let y = s.entry.y
  let [dx, dy] = s.entry.dir
  const maxSteps = s.w * s.h * 4
  const mirrorAt = (px: number, py: number) => s.mirrors.find((m) => m.x === px && m.y === py)

  path.push({ x, y })
  for (let i = 0; i < maxSteps; i++) {
    const m = mirrorAt(x, y)
    if (m) {
      const nd = REFLECT[m.orient][`${dx},${dy}`]
      if (nd) [dx, dy] = nd
    }
    x += dx
    y += dy
    if (x < 0 || y < 0 || x >= s.w || y >= s.h) break
    path.push({ x, y })
    if (x === s.target.x && y === s.target.y) return { path, hit: true }
  }
  return { path, hit: false }
}

export function isSolved(s: LightState): boolean {
  return trace(s).hit
}

export function progress(s: LightState): number {
  return isSolved(s) ? 1 : 0
}

export function toggle(s: LightState, mirrorIdx: number): LightState {
  const mirrors = s.mirrors.map((m, i) => (i === mirrorIdx ? { ...m, orient: (m.orient ^ 1) as 0 | 1 } : m))
  return { ...s, mirrors }
}
