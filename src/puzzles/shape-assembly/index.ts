import type { PuzzleModule } from '../types'
import type { ShapeAssemblyState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { ShapeAssemblyView } from './View'

export const shapeAssembly: PuzzleModule<ShapeAssemblyState> = {
  id: 'shape-assembly',
  createInitial,
  isSolved,
  progress,
  View: ShapeAssemblyView,
}
