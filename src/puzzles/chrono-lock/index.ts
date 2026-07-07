import type { PuzzleModule } from '../types'
import type { ChronoLockState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { ChronoLockView } from './View'

export const chronoLock: PuzzleModule<ChronoLockState> = {
  id: 'chrono-lock',
  createInitial,
  isSolved,
  progress,
  View: ChronoLockView,
}
