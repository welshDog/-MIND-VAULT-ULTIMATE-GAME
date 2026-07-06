import { useRef, useState } from 'react'
import { useGame } from '../state/store'
import { usePlay, type PuzzleInstance } from '../state/play'
import { useSceneTheme } from './GameCanvas'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { getModule } from '../puzzles/registry'
import { audio } from '../audio/engine'
import type { ThemeDef } from '../themes/types'

/** Presents the current (first unsolved) puzzle on the box's front face. */
export function PuzzleStage() {
  const screen = useGame((s) => s.screen)
  const theme = useSceneTheme()
  const reduced = useReducedMotion()
  const puzzles = usePlay((s) => s.puzzles)
  const solved = usePlay((s) => s.solved)
  const markSolved = usePlay((s) => s.markSolved)
  const registerMistake = usePlay((s) => s.registerMistake)

  if (screen !== 'playing') return null
  const idx = solved.findIndex((x) => !x)
  if (idx < 0 || !puzzles[idx]) return null

  return (
    <group position={[0, 0.15, 1.15]}>
      <ActivePuzzle
        key={idx}
        puzzle={puzzles[idx]}
        theme={theme}
        reduced={reduced}
        onSolved={() => {
          markSolved(idx)
          audio.success(theme.sound)
        }}
        onMistake={registerMistake}
      />
    </group>
  )
}

function ActivePuzzle({
  puzzle,
  theme,
  reduced,
  onSolved,
  onMistake,
}: {
  puzzle: PuzzleInstance
  theme: ThemeDef
  reduced: boolean
  onSolved: () => void
  onMistake: () => void
}) {
  const mod = getModule(puzzle.id)
  const [state, setState] = useState(() => mod.createInitial(puzzle.seed, puzzle.difficulty))
  const solvedRef = useRef(false)
  const View = mod.View

  const handleChange = (next: unknown) => {
    setState(next)
    if (!solvedRef.current && mod.isSolved(next)) {
      solvedRef.current = true
      onSolved()
    }
  }

  return (
    <View
      state={state}
      onChange={handleChange}
      theme={theme}
      reduced={reduced}
      solved={solvedRef.current}
      onMistake={onMistake}
    />
  )
}
