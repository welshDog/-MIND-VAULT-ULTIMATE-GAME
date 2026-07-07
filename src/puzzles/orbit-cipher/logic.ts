import { rng } from '../types'

/* Orbit Cipher — the "think OUTSIDE the box" mechanic.
   Glowing nodes ring the whole vault; each shows a pip value (1..N). The hidden
   rule is "activate them in ascending order" — but the higher nodes sit on the
   FAR side of the box, so the player must orbit the camera to find and tap them.
   Deduction (infer the order) + spatial reasoning (orbit) + literal outside-the-box.
   Zero-text: the rule is discovered by trying, the pips are the only clue. */

const TAU = Math.PI * 2

export interface CipherNode {
  angle: number // position around the ring (radians)
  value: number // 1..N — required activation order
}

export interface OrbitCipherState {
  nodes: CipherNode[]
  next: number // next value expected (1-based); solved when next > N
  locked: boolean[] // which nodes are already activated
}

export function createInitial(seed: number, difficulty: number): OrbitCipherState {
  const r = rng(seed)
  const count = Math.min(6, 4 + Math.floor((difficulty - 1) / 2)) // 4..6

  // Unique values 1..count, shuffled onto evenly-spaced ring positions so the
  // ascending order zig-zags around the box (guarantees you must orbit).
  const values = Array.from({ length: count }, (_, i) => i + 1)
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }

  const spin = r() * TAU // rotate the whole ring so it isn't axis-aligned
  const nodes: CipherNode[] = values.map((value, i) => ({
    angle: spin + (i / count) * TAU,
    value,
  }))

  return { nodes, next: 1, locked: nodes.map(() => false) }
}

export function isSolved(s: OrbitCipherState): boolean {
  return s.next > s.nodes.length
}

export function progress(s: OrbitCipherState): number {
  return (s.next - 1) / s.nodes.length
}

/** True if tapping node `i` is the correct next step. */
export function isNext(s: OrbitCipherState, i: number): boolean {
  return !s.locked[i] && s.nodes[i].value === s.next
}

/** Activate the correct next node. (Wrong taps are handled as a flash in the View.) */
export function activate(s: OrbitCipherState, i: number): OrbitCipherState {
  if (!isNext(s, i)) return s
  const locked = s.locked.slice()
  locked[i] = true
  return { ...s, locked, next: s.next + 1 }
}
