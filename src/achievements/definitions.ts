export type AchievementId =
  | 'firstBox'
  | 'speedSolver'
  | 'patternMaster'
  | 'shapeWizard'
  | 'spatialGenius'
  | 'explorer'
  | 'collector'
  | 'perfectionist'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface AchievementDef {
  id: AchievementId
  icon: string
  rarity: Rarity
  maxProgress: number
}

/** Ids + maxProgress preserved from v1 (legacy/app.js:146-180) so saves migrate cleanly. */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'firstBox', icon: '📦', rarity: 'common', maxProgress: 1 },
  { id: 'speedSolver', icon: '⚡', rarity: 'rare', maxProgress: 1 },
  { id: 'patternMaster', icon: '🎨', rarity: 'epic', maxProgress: 10 },
  { id: 'shapeWizard', icon: '🔷', rarity: 'epic', maxProgress: 15 },
  { id: 'spatialGenius', icon: '👁️', rarity: 'legendary', maxProgress: 1 },
  { id: 'explorer', icon: '🗺️', rarity: 'legendary', maxProgress: 5 },
  { id: 'collector', icon: '💎', rarity: 'epic', maxProgress: 100 },
  { id: 'perfectionist', icon: '👑', rarity: 'legendary', maxProgress: 1 },
]

export const ACHIEVEMENT_MAP: Record<AchievementId, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchievementId, AchievementDef>

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}
