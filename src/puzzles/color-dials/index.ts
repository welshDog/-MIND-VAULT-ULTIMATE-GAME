import type { PuzzleModule } from '../types'
import type { ColorDialsState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { ColorDialsView } from './View'

export const colorDials: PuzzleModule<ColorDialsState> = {
  id: 'color-dials',
  createInitial,
  isSolved,
  progress,
  View: ColorDialsView,
}
