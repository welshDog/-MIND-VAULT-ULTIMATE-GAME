import type { PuzzleModule } from '../types'
import type { GlyphState } from './logic'
import { createInitial, isSolved, progress } from './logic'
import { GlyphPatternView } from './View'

export const glyphPattern: PuzzleModule<GlyphState> = {
  id: 'glyph-pattern',
  createInitial,
  isSolved,
  progress,
  View: GlyphPatternView,
}
