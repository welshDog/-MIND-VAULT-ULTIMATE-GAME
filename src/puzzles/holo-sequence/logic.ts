import { rng } from '../types'

export interface HoloState {
  panelCount: number
  sequence: number[]
  input: number // how many steps correctly echoed
}

export function createInitial(seed: number, difficulty: number): HoloState {
  const r = rng(seed)
  const panelCount = Math.min(6, 3 + Math.floor(difficulty / 2)) // 3..6 panels
  const length = Math.min(6, 2 + difficulty) // 3..6 steps
  const sequence = Array.from({ length }, () => Math.floor(r() * panelCount))
  return { panelCount, sequence, input: 0 }
}

export function isSolved(s: HoloState): boolean {
  return s.input >= s.sequence.length
}

export function progress(s: HoloState): number {
  return s.input / s.sequence.length
}

/** [next, correct] — a wrong press resets progress (harmless, replay). */
export function press(s: HoloState, panel: number): [HoloState, boolean] {
  const expected = s.sequence[s.input]
  if (panel === expected) return [{ ...s, input: s.input + 1 }, true]
  return [{ ...s, input: 0 }, false]
}
