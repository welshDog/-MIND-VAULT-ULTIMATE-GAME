import { useGame, type VictoryResult } from '../state/store'
import { THEMES, THEME_ORDER } from '../themes'
import type { PuzzleId } from '../themes/types'

/**
 * Evaluate achievements after a box is completed. Mirrors v1's rules
 * (legacy/app.js checkVictoryAchievements) plus the new perfect-run counters.
 * Call AFTER completeBox so crystals/themes reflect the win.
 */
export function runAchievements(result: VictoryResult, puzzleIds: PuzzleId[]) {
  const g = useGame.getState()

  // First box ever.
  g.unlockAchievement('firstBox')

  // Speed.
  if (result.timeSec < 60) g.unlockAchievement('speedSolver')

  // Crystal collector (progress toward 100).
  const crystals = useGame.getState().crystals
  g.bumpAchievement('collector', Math.min(100, crystals))
  if (crystals >= 100) g.unlockAchievement('collector')

  // Explorer — every theme unlocked.
  const themes = () => useGame.getState().themes
  if (THEME_ORDER.every((id) => themes()[id].unlocked)) g.unlockAchievement('explorer')

  // Perfectionist — every theme fully completed.
  if (THEME_ORDER.every((id) => themes()[id].completed >= THEMES[id].boxes)) {
    g.unlockAchievement('perfectionist')
  }

  // Perfect-run driven counters.
  if (result.perfect) {
    if (puzzleIds.includes('spatial-rotation')) g.unlockAchievement('spatialGenius')

    if (puzzleIds.includes('color-dials')) {
      const p = useGame.getState().achievements.patternMaster.progress + 1
      g.bumpAchievement('patternMaster', p)
      if (p >= 10) g.unlockAchievement('patternMaster')
    }
    if (puzzleIds.includes('shape-assembly')) {
      const p = useGame.getState().achievements.shapeWizard.progress + 1
      g.bumpAchievement('shapeWizard', p)
      if (p >= 15) g.unlockAchievement('shapeWizard')
    }
  }
}
