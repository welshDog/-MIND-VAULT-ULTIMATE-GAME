import type { PuzzleModule } from '../types'
import type { SpatialRotationState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { SpatialRotationView } from './View'

export const spatialRotation: PuzzleModule<SpatialRotationState> = {
  id: 'spatial-rotation',
  createInitial,
  isSolved,
  progress,
  View: SpatialRotationView,
}
