import { rng } from '../types'

/* Chrono Lock — a reflex / timing puzzle.
   A pointer sweeps around a dial; one or more glowing target dots sit on the rim.
   Tap to strike: if the pointer is inside the target's hit-window at that instant,
   it locks. A different skill axis (timing + precision) to the deductive puzzles.
   The spinning pointer angle is animated in the View (a ref, not state) so it
   never triggers React re-renders; state only holds the fixed targets + hits. */

const TAU = Math.PI * 2

export interface ChronoLockState {
  targets: number[] // fixed target angles (radians), struck in order
  hit: boolean[]
  tolerance: number // half-width of the hit window (radians)
  speed: number // pointer angular speed (radians / second)
}

/** Shortest angular distance between two angles (0..π). */
export function angDist(a: number, b: number): number {
  const d = Math.abs(a - b) % TAU
  return d > Math.PI ? TAU - d : d
}

export function createInitial(seed: number, difficulty: number): ChronoLockState {
  const r = rng(seed)
  const count = Math.min(3, 1 + Math.floor(difficulty / 2)) // 1..3 targets

  const targets: number[] = []
  let guard = 0
  while (targets.length < count && guard++ < 60) {
    const a = r() * TAU
    if (targets.every((t) => angDist(t, a) > 0.9)) targets.push(a) // keep them spread
  }

  return {
    targets,
    hit: targets.map(() => false),
    tolerance: Math.max(0.16, 0.44 - difficulty * 0.04), // window shrinks with difficulty
    speed: 1.5 + difficulty * 0.22, // spin quickens with difficulty
  }
}

export function isSolved(s: ChronoLockState): boolean {
  return s.hit.every(Boolean)
}

export function progress(s: ChronoLockState): number {
  return s.hit.filter(Boolean).length / s.hit.length
}

/** Index of the target currently being aimed for (-1 if all struck). */
export function currentTarget(s: ChronoLockState): number {
  return s.hit.findIndex((h) => !h)
}

/** Strike at the given pointer angle. Returns the (possibly updated) state + whether it landed. */
export function strike(s: ChronoLockState, pointerAngle: number): { state: ChronoLockState; landed: boolean } {
  const i = currentTarget(s)
  if (i < 0) return { state: s, landed: false }
  if (angDist(pointerAngle, s.targets[i]) <= s.tolerance) {
    const hit = s.hit.slice()
    hit[i] = true
    return { state: { ...s, hit }, landed: true }
  }
  return { state: s, landed: false }
}
