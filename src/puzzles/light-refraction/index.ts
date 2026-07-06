import type { PuzzleModule } from '../types'
import type { LightState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { LightRefractionView } from './View'

export const lightRefraction: PuzzleModule<LightState> = {
  id: 'light-refraction',
  createInitial,
  isSolved,
  progress,
  View: LightRefractionView,
}
