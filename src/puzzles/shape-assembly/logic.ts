import { rng } from '../types'

export type ShapeKind = 'box' | 'cone' | 'sphere' | 'cyl' | 'octa'
const ALL: ShapeKind[] = ['box', 'cone', 'sphere', 'cyl', 'octa']

export interface ShapeAssemblyState {
  sockets: { shape: ShapeKind; filled: boolean }[]
  pieces: { shape: ShapeKind; placed: boolean }[]
  selected: number | null
}

export function createInitial(seed: number, difficulty: number): ShapeAssemblyState {
  const r = rng(seed)
  const n = Math.min(5, 3 + Math.floor(difficulty / 2)) // 3..5
  const pool = [...ALL].sort(() => r() - 0.5).slice(0, n)
  const sockets = pool.map((shape) => ({ shape, filled: false }))
  const pieces = [...pool].sort(() => r() - 0.5).map((shape) => ({ shape, placed: false }))
  return { sockets, pieces, selected: null }
}

export function isSolved(s: ShapeAssemblyState): boolean {
  return s.sockets.every((so) => so.filled)
}

export function progress(s: ShapeAssemblyState): number {
  return s.sockets.filter((so) => so.filled).length / s.sockets.length
}

export function select(s: ShapeAssemblyState, i: number): ShapeAssemblyState {
  if (s.pieces[i].placed) return s
  return { ...s, selected: s.selected === i ? null : i }
}

/** Returns [next, placed] — placed=false means a wrong (harmless) attempt. */
export function place(s: ShapeAssemblyState, socketIdx: number): [ShapeAssemblyState, boolean] {
  if (s.selected == null) return [s, false]
  const socket = s.sockets[socketIdx]
  const piece = s.pieces[s.selected]
  if (socket.filled || piece.shape !== socket.shape) return [{ ...s, selected: null }, false]

  const sockets = s.sockets.map((so, i) => (i === socketIdx ? { ...so, filled: true } : so))
  const pieces = s.pieces.map((p, i) => (i === s.selected ? { ...p, placed: true } : p))
  return [{ ...s, sockets, pieces, selected: null }, true]
}
