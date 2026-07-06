import type { PuzzleModule } from '../types'
import type { HoloState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { HoloSequenceView } from './View'

export const holoSequence: PuzzleModule<HoloState> = {
  id: 'holo-sequence',
  createInitial,
  isSolved,
  progress,
  View: HoloSequenceView,
}
