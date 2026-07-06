export type ThemeId = 'tutorial' | 'steampunk' | 'crystal' | 'space' | 'temple'

export type PuzzleId =
  | 'color-dials'
  | 'shape-assembly'
  | 'spatial-rotation'
  | 'gear-alignment'
  | 'light-refraction'
  | 'holo-sequence'
  | 'glyph-pattern'

export interface ThemeSound {
  waveform: OscillatorType
  /** Pentatonic scale frequencies (Hz), low → high */
  scale: number[]
  /** Lowpass cutoff for warmth; Infinity = none */
  filterHz: number
}

export interface ThemeEnv {
  fogColor: string
  fogNear: number
  fogFar: number
  keyLightColor: string
  keyIntensity: number
  rimLightColor: string
  ambient: number
}

export interface ThemeDef {
  id: ThemeId
  /** Emoji glyph — zero-text iconography */
  icon: string
  accent: string
  /** 5-color palette from v1 */
  palette: string[]
  boxes: number
  /** 3 mechanics per box, drawn from this set */
  puzzleSet: PuzzleId[]
  sound: ThemeSound
  env: ThemeEnv
}
