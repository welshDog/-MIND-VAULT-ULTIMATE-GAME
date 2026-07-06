import type { PuzzleModule } from '../types'
import type { GearState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { GearAlignmentView } from './View'

export const gearAlignment: PuzzleModule<GearState> = {
  id: 'gear-alignment',
  createInitial,
  isSolved,
  progress,
  View: GearAlignmentView,
}
