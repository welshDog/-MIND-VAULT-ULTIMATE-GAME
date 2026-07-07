import type { ThemeDef, ThemeId } from './types'

/* Pentatonic scales per theme (Hz). Root chosen for character:
   tutorial C major-ish, steampunk low D minor, crystal high A,
   space E suspended, temple G low. */

/* Per-world colour is HFZ-branded (space-black + one signature accent each),
   NO ORANGE. Puzzle palettes use the same 5 clearly-distinct brand hues
   (violet · cyan · mint · gold · pink) so colour-match puzzles stay legible. */
const THEME_LIST: ThemeDef[] = [
  {
    id: 'tutorial',
    icon: '🧩',
    accent: '#A855F7',
    palette: ['#A855F7', '#00D4FF', '#10F5A0', '#FCD34D', '#D946EF'],
    boxes: 1,
    puzzleSet: ['color-dials', 'shape-assembly', 'spatial-rotation'],
    sound: { waveform: 'sine', scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25], filterHz: Infinity },
    env: {
      fogColor: '#0a0e1a',
      fogNear: 8,
      fogFar: 26,
      keyLightColor: '#cbb4ff',
      keyIntensity: 2.2,
      rimLightColor: '#A855F7',
      ambient: 0.35,
    },
  },
  {
    id: 'steampunk',
    icon: '⚙️',
    accent: '#FCD34D',
    palette: ['#FCD34D', '#F59E0B', '#A855F7', '#00D4FF', '#10F5A0'],
    boxes: 5,
    puzzleSet: ['color-dials', 'spatial-rotation', 'gear-alignment'],
    sound: { waveform: 'sawtooth', scale: [146.83, 174.61, 196.0, 220.0, 261.63, 293.66], filterHz: 900 },
    env: {
      fogColor: '#0f0b18',
      fogNear: 7,
      fogFar: 24,
      keyLightColor: '#ffe9b8',
      keyIntensity: 2.4,
      rimLightColor: '#F59E0B',
      ambient: 0.3,
    },
  },
  {
    id: 'crystal',
    icon: '💎',
    accent: '#00D4FF',
    palette: ['#00D4FF', '#00FFFF', '#A855F7', '#10F5A0', '#D946EF'],
    boxes: 5,
    puzzleSet: ['shape-assembly', 'color-dials', 'light-refraction'],
    sound: { waveform: 'sine', scale: [440.0, 493.88, 554.37, 659.25, 739.99, 880.0], filterHz: Infinity },
    env: {
      fogColor: '#0a1220',
      fogNear: 8,
      fogFar: 28,
      keyLightColor: '#bef3ff',
      keyIntensity: 2.0,
      rimLightColor: '#00D4FF',
      ambient: 0.4,
    },
  },
  {
    id: 'space',
    icon: '🛰️',
    accent: '#D946EF',
    palette: ['#D946EF', '#A855F7', '#00D4FF', '#10F5A0', '#FCD34D'],
    boxes: 5,
    puzzleSet: ['spatial-rotation', 'shape-assembly', 'holo-sequence'],
    sound: { waveform: 'triangle', scale: [329.63, 369.99, 415.3, 493.88, 554.37, 659.25], filterHz: Infinity },
    env: {
      fogColor: '#05060f',
      fogNear: 10,
      fogFar: 32,
      keyLightColor: '#f0beff',
      keyIntensity: 1.8,
      rimLightColor: '#D946EF',
      ambient: 0.3,
    },
  },
  {
    id: 'temple',
    icon: '🏺',
    accent: '#10F5A0',
    palette: ['#10F5A0', '#34D399', '#FCD34D', '#A855F7', '#00D4FF'],
    boxes: 5,
    puzzleSet: ['color-dials', 'spatial-rotation', 'glyph-pattern'],
    sound: { waveform: 'square', scale: [196.0, 220.0, 246.94, 293.66, 329.63, 392.0], filterHz: 700 },
    env: {
      fogColor: '#05130d',
      fogNear: 7,
      fogFar: 24,
      keyLightColor: '#b8ffde',
      keyIntensity: 2.2,
      rimLightColor: '#10F5A0',
      ambient: 0.35,
    },
  },
]

export const THEME_ORDER: ThemeId[] = ['tutorial', 'steampunk', 'crystal', 'space', 'temple']

export const THEMES: Record<ThemeId, ThemeDef> = Object.fromEntries(
  THEME_LIST.map((t) => [t.id, t]),
) as Record<ThemeId, ThemeDef>

export function nextTheme(id: ThemeId): ThemeId | null {
  const i = THEME_ORDER.indexOf(id)
  return i >= 0 && i < THEME_ORDER.length - 1 ? THEME_ORDER[i + 1] : null
}
