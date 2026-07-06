import { create } from 'zustand'
import type { PuzzleId, ThemeId } from '../themes/types'
import { THEMES } from '../themes'
import { seedFor } from '../puzzles/types'

export interface PuzzleInstance {
  id: PuzzleId
  seed: number
  difficulty: number
}

interface PlayState {
  puzzles: PuzzleInstance[]
  solved: boolean[]
  startTime: number
  mistakes: number

  beginBox: (themeId: ThemeId, boxIndex: number) => void
  markSolved: (index: number) => void
  registerMistake: () => void
  allSolved: () => boolean
}

/** Ephemeral per-box play session (never persisted). */
export const usePlay = create<PlayState>((set, get) => ({
  puzzles: [],
  solved: [],
  startTime: 0,
  mistakes: 0,

  beginBox: (themeId, boxIndex) => {
    const set3 = THEMES[themeId].puzzleSet
    const difficulty = boxIndex + 1
    const puzzles: PuzzleInstance[] = set3.map((id, slot) => ({
      id,
      seed: seedFor(themeId, boxIndex, slot),
      difficulty,
    }))
    set({
      puzzles,
      solved: puzzles.map(() => false),
      startTime: performance.now(),
      mistakes: 0,
    })
  },

  markSolved: (index) =>
    set((s) => {
      if (s.solved[index]) return s
      const solved = s.solved.slice()
      solved[index] = true
      return { solved }
    }),

  registerMistake: () => set((s) => ({ mistakes: s.mistakes + 1 })),

  allSolved: () => {
    const s = get()
    return s.solved.length > 0 && s.solved.every(Boolean)
  },
}))
