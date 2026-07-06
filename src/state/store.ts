import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ThemeId } from '../themes/types'
import { THEMES, THEME_ORDER, nextTheme } from '../themes'
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, type AchievementId } from '../achievements/definitions'
import { migrateLegacy } from '../save/migrateLegacy'

export type Screen = 'splash' | 'menu' | 'preview' | 'playing' | 'victory'
export type Overlay = 'none' | 'achievements' | 'settings'
export type MotionPref = 'auto' | 'on' | 'off'

export interface ThemeProgress {
  unlocked: boolean
  completed: number
}
export interface AchievementProgress {
  unlocked: boolean
  progress: number
}

export interface VictoryResult {
  theme: ThemeId
  boxIndex: number
  crystalsEarned: number
  timeSec: number
  unlockedTheme: ThemeId | null
  perfect: boolean
}

export interface Settings {
  volume: number // 0..1
  highContrast: boolean
  reducedMotion: MotionPref
  haptics: boolean
}

interface GameState {
  // ---- persisted: progress ----
  crystals: number
  themes: Record<ThemeId, ThemeProgress>
  achievements: Record<AchievementId, AchievementProgress>

  // ---- persisted: settings ----
  settings: Settings

  // ---- session (not persisted) ----
  screen: Screen
  overlay: Overlay
  currentTheme: ThemeId
  currentBoxIndex: number
  focusedTheme: ThemeId // hovered card in menu, drives background scene
  lastVictory: VictoryResult | null
  toast: { id: AchievementId; key: number } | null

  // ---- actions ----
  goto: (screen: Screen) => void
  setOverlay: (o: Overlay) => void
  focusTheme: (id: ThemeId) => void
  enterTheme: (id: ThemeId, boxIndex: number) => void
  completeBox: (timeSec: number, perfect: boolean) => VictoryResult
  bumpAchievement: (id: AchievementId, to: number) => void
  unlockAchievement: (id: AchievementId) => boolean
  showToast: (id: AchievementId) => void
  clearToast: () => void
  setSettings: (patch: Partial<Settings>) => void
}

function defaultThemes(): Record<ThemeId, ThemeProgress> {
  return Object.fromEntries(
    THEME_ORDER.map((id) => [id, { unlocked: id === 'tutorial', completed: 0 }]),
  ) as Record<ThemeId, ThemeProgress>
}

function defaultAchievements(): Record<AchievementId, AchievementProgress> {
  return Object.fromEntries(
    ACHIEVEMENTS.map((a) => [a.id, { unlocked: false, progress: 0 }]),
  ) as Record<AchievementId, AchievementProgress>
}

/** Crystal economy — ported verbatim from v1 (legacy/app.js:1451-1463). */
function calcCrystals(timeSec: number, boxIndex: number): number {
  let reward = 5
  if (timeSec < 60) reward += 5
  if (timeSec < 30) reward += 5
  reward += (boxIndex + 1) * 2
  return reward
}

let toastKey = 0

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      crystals: 0,
      themes: defaultThemes(),
      achievements: defaultAchievements(),
      settings: {
        volume: 0.75,
        highContrast: false,
        reducedMotion: 'auto',
        haptics: true,
      },

      screen: 'splash',
      overlay: 'none',
      currentTheme: 'tutorial',
      currentBoxIndex: 0,
      focusedTheme: 'tutorial',
      lastVictory: null,
      toast: null,

      goto: (screen) => set({ screen }),
      setOverlay: (overlay) => set({ overlay }),
      focusTheme: (focusedTheme) => set({ focusedTheme }),

      enterTheme: (id, boxIndex) =>
        set({ currentTheme: id, currentBoxIndex: boxIndex, focusedTheme: id }),

      completeBox: (timeSec, perfect) => {
        const state = get()
        const themeId = state.currentTheme
        const theme = state.themes[themeId]
        const boxIndex = state.currentBoxIndex

        const crystalsEarned = calcCrystals(timeSec, boxIndex)

        // Advance completion only if this box is a new high-water mark.
        const newCompleted = Math.max(theme.completed, boxIndex + 1)

        const themes = { ...state.themes, [themeId]: { ...theme, completed: newCompleted } }

        // Sequential unlock when the whole theme is cleared.
        let unlockedTheme: ThemeId | null = null
        if (newCompleted >= THEMES[themeId].boxes) {
          const nxt = nextTheme(themeId)
          if (nxt && !themes[nxt].unlocked) {
            themes[nxt] = { ...themes[nxt], unlocked: true }
            unlockedTheme = nxt
          }
        }

        const crystals = state.crystals + crystalsEarned

        const result: VictoryResult = {
          theme: themeId,
          boxIndex,
          crystalsEarned,
          timeSec,
          unlockedTheme,
          perfect,
        }

        set({ crystals, themes, lastVictory: result })
        return result
      },

      bumpAchievement: (id, to) =>
        set((state) => {
          const cur = state.achievements[id]
          if (cur.progress >= to) return state
          return {
            achievements: { ...state.achievements, [id]: { ...cur, progress: to } },
          }
        }),

      unlockAchievement: (id) => {
        const cur = get().achievements[id]
        if (cur.unlocked) return false
        const max = ACHIEVEMENT_MAP[id].maxProgress
        set((state) => ({
          achievements: {
            ...state.achievements,
            [id]: { unlocked: true, progress: max },
          },
          toast: { id, key: ++toastKey },
        }))
        return true
      },

      showToast: (id) => set({ toast: { id, key: ++toastKey } }),
      clearToast: () => set({ toast: null }),

      setSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    {
      name: 'mindVaultProgress.v2',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Only persist progress + settings; session state stays ephemeral.
      partialize: (s) => ({
        crystals: s.crystals,
        themes: s.themes,
        achievements: s.achievements,
        settings: s.settings,
      }),
      // If no v2 save exists yet, seed from a legacy v1 save (if present).
      merge: (persisted, current) => {
        if (persisted) return { ...current, ...(persisted as object) }
        const legacy = migrateLegacy()
        return legacy ? { ...current, ...legacy } : current
      },
    },
  ),
)
