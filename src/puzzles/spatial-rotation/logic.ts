import { rng } from '../types'

export interface SpatialRotationState {
  detents: number // steps around a full turn
  rot: number[] // current detent per segment; solved when all 0
}

export function createInitial(seed: number, difficulty: number): SpatialRotationState {
  const r = rng(seed)
  const count = Math.min(5, 3 + Math.floor((difficulty - 1) / 2)) // 3..5 segments
  const detents = 4 // 90° steps
  const rot = Array.from({ length: count }, () => 1 + Math.floor(r() * (detents - 1)))
  return { detents, rot }
}

export function isSolved(s: SpatialRotationState): boolean {
  return s.rot.every((r) => r === 0)
}

export function progress(s: SpatialRotationState): number {
  return s.rot.filter((r) => r === 0).length / s.rot.length
}

export function rotate(s: SpatialRotationState, i: number, dir: number): SpatialRotationState {
  const rot = s.rot.slice()
  rot[i] = (rot[i] + dir + s.detents) % s.detents
  return { ...s, rot }
}

export function aligned(s: SpatialRotationState, i: number): boolean {
  return s.rot[i] === 0
}
