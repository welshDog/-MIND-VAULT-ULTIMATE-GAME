import type { PuzzleModule } from '../types'
import type { OrbitCipherState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { OrbitCipherView } from './View'

export const orbitCipher: PuzzleModule<OrbitCipherState> = {
  id: 'orbit-cipher',
  createInitial,
  isSolved,
  progress,
  View: OrbitCipherView,
}
