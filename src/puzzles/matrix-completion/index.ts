import type { PuzzleModule } from '../types'
import type { MatrixState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { MatrixCompletionView } from './View'

export const matrixCompletion: PuzzleModule<MatrixState> = {
  id: 'matrix-completion',
  createInitial,
  isSolved,
  progress,
  View: MatrixCompletionView,
}
