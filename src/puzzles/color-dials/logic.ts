import { rng } from '../types'

export interface ColorDialsState {
  colors: number // number of selectable colors (indices into theme palette)
  target: number[]
  dials: number[]
}

export function createInitial(seed: number, difficulty: number): ColorDialsState {
  const r = rng(seed)
  const count = Math.min(5, 3 + Math.floor((difficulty - 1) / 2)) // 3..5 dials
  const colors = Math.min(5, 3 + Math.floor(difficulty / 2)) // 3..5 colors
  const target = Array.from({ length: count }, () => 1 + Math.floor(r() * (colors - 1)))
  const dials = target.map(() => 0) // start at 0; targets avoid 0 so never pre-solved
  return { colors, target, dials }
}

export function isSolved(s: ColorDialsState): boolean {
  return s.dials.every((d, i) => d === s.target[i])
}

export function progress(s: ColorDialsState): number {
  const matched = s.dials.filter((d, i) => d === s.target[i]).length
  return matched / s.dials.length
}

export function cycle(s: ColorDialsState, i: number): ColorDialsState {
  const dials = s.dials.slice()
  dials[i] = (dials[i] + 1) % s.colors
  return { ...s, dials }
}

export function matched(s: ColorDialsState, i: number): boolean {
  return s.dials[i] === s.target[i]
}
