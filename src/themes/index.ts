import type { ThemeDef, ThemeId } from './types'

/* Pentatonic scales per theme (Hz). Root chosen for character:
   tutorial C major-ish, steampunk low D minor, crystal high A,
   space E suspended, temple G low. */

const THEME_LIST: ThemeDef[] = [
  {
    id: 'tutorial',
    icon: '🧩',
    accent: '#4A90E2',
    palette: ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'],
    boxes: 1,
    puzzleSet: ['color-dials', 'shape-assembly', 'spatial-rotation'],
    sound: { waveform: 'sine', scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25], filterHz: Infinity },
    env: {
      fogColor: '#0a0f18',
      fogNear: 8,
      fogFar: 26,
      keyLightColor: '#9ec5ff',
      keyIntensity: 2.2,
      rimLightColor: '#4A90E2',
      ambient: 0.35,
    },
  },
  {
    id: 'steampunk',
    icon: '⚙️',
    accent: '#B8860B',
    palette: ['#B8860B', '#CD853F', '#A0522D', '#8B4513', '#D2691E'],
    boxes: 5,
    puzzleSet: ['color-dials', 'spatial-rotation', 'gear-alignment'],
    sound: { waveform: 'sawtooth', scale: [146.83, 174.61, 196.0, 220.0, 261.63, 293.66], filterHz: 900 },
    env: {
      fogColor: '#140f06',
      fogNear: 7,
      fogFar: 24,
      keyLightColor: '#ffb54d',
      keyIntensity: 2.4,
      rimLightColor: '#D2691E',
      ambient: 0.3,
    },
  },
  {
    id: 'crystal',
    icon: '💎',
    accent: '#9370DB',
    palette: ['#9370DB', '#8A2BE2', '#7B68EE', '#6495ED', '#48D1CC'],
    boxes: 5,
    puzzleSet: ['shape-assembly', 'color-dials', 'light-refraction'],
    sound: { waveform: 'sine', scale: [440.0, 493.88, 554.37, 659.25, 739.99, 880.0], filterHz: Infinity },
    env: {
      fogColor: '#0d0a16',
      fogNear: 8,
      fogFar: 28,
      keyLightColor: '#c9b3ff',
      keyIntensity: 2.0,
      rimLightColor: '#48D1CC',
      ambient: 0.4,
    },
  },
  {
    id: 'space',
    icon: '🛰️',
    accent: '#00CED1',
    palette: ['#00CED1', '#1E90FF', '#00BFFF', '#87CEEB', '#B0E0E6'],
    boxes: 5,
    puzzleSet: ['spatial-rotation', 'shape-assembly', 'holo-sequence'],
    sound: { waveform: 'triangle', scale: [329.63, 369.99, 415.3, 493.88, 554.37, 659.25], filterHz: Infinity },
    env: {
      fogColor: '#04080d',
      fogNear: 10,
      fogFar: 32,
      keyLightColor: '#8fe8ff',
      keyIntensity: 1.8,
      rimLightColor: '#00CED1',
      ambient: 0.3,
    },
  },
  {
    id: 'temple',
    icon: '🏺',
    accent: '#CD853F',
    palette: ['#CD853F', '#DAA520', '#B8860B', '#DEB887', '#F4A460'],
    boxes: 5,
    puzzleSet: ['color-dials', 'spatial-rotation', 'glyph-pattern'],
    sound: { waveform: 'square', scale: [196.0, 220.0, 246.94, 293.66, 329.63, 392.0], filterHz: 700 },
    env: {
      fogColor: '#120d05',
      fogNear: 7,
      fogFar: 24,
      keyLightColor: '#ffd28a',
      keyIntensity: 2.2,
      rimLightColor: '#DAA520',
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
