import { rng } from '../types'

/* Matrix Completion — a Raven's-Progressive-Matrices-style IQ puzzle.
   A 3x3 grid of glyphs follows a hidden rule; the bottom-right cell is blank.
   The player must INFER the rule (not copy a shown target) and pick the glyph
   that completes it. This is the "deduce, don't replicate" mechanic the other
   puzzles lack. Zero-text: the rule lives in the visuals, never in words. */

export interface Glyph {
  count: number // 1..3 pips
  rot: number // 0..2  → 0°, 120°, 240°
  color: number // palette index
}

export interface MatrixState {
  grid: (Glyph | null)[] // 9 cells, index 8 is the blank
  options: Glyph[] // answer choices
  answer: number // index into options of the correct glyph
  picked: number | null // chosen correct option (locks solved)
  wrong: number | null // last wrong pick, for a brief red flash
}

const COLORS = 4 // palette indices 0..3

export function glyphEq(a: Glyph, b: Glyph): boolean {
  return a.count === b.count && a.rot === b.rot && a.color === b.color
}

function key(g: Glyph): string {
  return `${g.count},${g.rot},${g.color}`
}

export function createInitial(seed: number, difficulty: number): MatrixState {
  const r = rng(seed)

  // Which attributes obey a systematic rule scales with difficulty:
  //   d1 → count only · d2 → count + rotation · d3+ → count + rotation + colour
  const varyRot = difficulty >= 2
  const varyColor = difficulty >= 3

  const cOff = Math.floor(r() * 3)
  const rOff = Math.floor(r() * 3)
  const colOff = Math.floor(r() * COLORS)

  // Classic RPM structure: one attribute progresses across columns, another
  // down rows, a third along the diagonal — each fully determined by (row,col).
  const build = (row: number, col: number): Glyph => ({
    count: ((cOff + col) % 3) + 1,
    rot: varyRot ? (rOff + row) % 3 : 0,
    color: varyColor ? (colOff + row + col) % COLORS : 0,
  })

  const grid: (Glyph | null)[] = []
  for (let i = 0; i < 9; i++) grid.push(build(Math.floor(i / 3), i % 3))

  const correct = grid[8] as Glyph
  grid[8] = null // blank the answer cell

  // Build distractors — each differs from the correct glyph in >=1 attribute.
  const options: Glyph[] = [{ ...correct }]
  const seen = new Set([key(correct)])
  const nOpts = difficulty >= 3 ? 6 : 4
  let guard = 0
  while (options.length < nOpts && guard++ < 80) {
    const d: Glyph = { ...correct }
    const which = Math.floor(r() * 3)
    if (which === 0) d.count = (d.count % 3) + 1
    else if (which === 1) d.rot = (d.rot + 1 + Math.floor(r() * 2)) % 3
    else d.color = (d.color + 1 + Math.floor(r() * (COLORS - 1))) % COLORS
    if (!seen.has(key(d))) {
      seen.add(key(d))
      options.push(d)
    }
  }

  // Fisher–Yates shuffle so the correct option isn't always first.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  return {
    grid,
    options,
    answer: options.findIndex((o) => glyphEq(o, correct)),
    picked: null,
    wrong: null,
  }
}

export function isSolved(s: MatrixState): boolean {
  return s.picked !== null && s.picked === s.answer
}

export function progress(s: MatrixState): number {
  return isSolved(s) ? 1 : 0
}

/** Pick an option. Correct → locks solved; wrong → flags a flash (no lock, no punish). */
export function pick(s: MatrixState, i: number): MatrixState {
  if (i === s.answer) return { ...s, picked: i, wrong: null }
  return { ...s, wrong: i }
}
