import type { ThemeId } from '../themes/types'
import { THEME_ORDER } from '../themes'
import { ACHIEVEMENTS, type AchievementId } from '../achievements/definitions'
import type { ThemeProgress, AchievementProgress, Settings } from '../state/store'

interface LegacyThemeProgress {
  unlocked?: boolean
  completed?: number
}
interface LegacySave {
  gameData?: {
    themes?: Record<string, LegacyThemeProgress>
    crystalShards?: number
    settings?: {
      volume?: number // 0..100 in v1
      highContrast?: boolean
      hapticFeedback?: boolean
    }
  }
  achievements?: [string, { progress?: number; unlocked?: boolean }][]
  unlockedAchievements?: string[]
}

interface MigratedProgress {
  crystals: number
  themes: Record<ThemeId, ThemeProgress>
  achievements: Record<AchievementId, AchievementProgress>
  settings: Settings
}

/**
 * One-time reader of the v1 `mindVaultProgress` localStorage key.
 * Returns a partial v2 state, or null if there's nothing valid to migrate.
 * Defensive: never throws — any parse failure yields null (fresh start).
 * The old key is left in place so the legacy build still works.
 */
export function migrateLegacy(): MigratedProgress | null {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem('mindVaultProgress')
    if (!raw) return null
    const parsed = JSON.parse(raw) as LegacySave
    if (!parsed || typeof parsed !== 'object') return null

    const g = parsed.gameData ?? {}

    // Themes — default first theme unlocked, rest locked.
    const themes = Object.fromEntries(
      THEME_ORDER.map((id) => {
        const legacy = g.themes?.[id] ?? {}
        return [
          id,
          {
            unlocked: legacy.unlocked ?? id === 'tutorial',
            completed: Math.max(0, Number(legacy.completed) || 0),
          } satisfies ThemeProgress,
        ]
      }),
    ) as Record<ThemeId, ThemeProgress>

    // Achievements — merge unlocked set + per-achievement progress array.
    const unlockedSet = new Set(parsed.unlockedAchievements ?? [])
    const progressById = new Map((parsed.achievements ?? []).map(([id, v]) => [id, v]))
    const achievements = Object.fromEntries(
      ACHIEVEMENTS.map((a) => {
        const rec = progressById.get(a.id)
        return [
          a.id,
          {
            unlocked: unlockedSet.has(a.id) || rec?.unlocked === true,
            progress: Math.max(0, Number(rec?.progress) || 0),
          } satisfies AchievementProgress,
        ]
      }),
    ) as Record<AchievementId, AchievementProgress>

    // Settings — v1 volume was 0..100; clamp to 0..1.
    const s = g.settings ?? {}
    const volume =
      typeof s.volume === 'number' ? Math.min(1, Math.max(0, s.volume / 100)) : 0.75

    const settings: Settings = {
      volume,
      highContrast: s.highContrast === true,
      reducedMotion: 'auto',
      haptics: s.hapticFeedback !== false,
    }

    return {
      crystals: Math.max(0, Number(g.crystalShards) || 0),
      themes,
      achievements,
      settings,
    }
  } catch {
    return null
  }
}
