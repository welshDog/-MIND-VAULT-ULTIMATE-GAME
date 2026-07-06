/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PuzzleId } from '../themes/types'
import type { PuzzleModule } from './types'
import { colorDials } from './color-dials'
import { shapeAssembly } from './shape-assembly'
import { spatialRotation } from './spatial-rotation'

// Heterogeneous plugin map — each module owns its own state type, so `any`
// is the pragmatic boundary here (state is opaque to the registry/stage).
const REGISTRY: Partial<Record<PuzzleId, PuzzleModule<any>>> = {
  'color-dials': colorDials,
  'shape-assembly': shapeAssembly,
  'spatial-rotation': spatialRotation,
}

export function getModule(id: PuzzleId): PuzzleModule<any> {
  // Fallback keeps the game playable before a mechanic is implemented (P4).
  return REGISTRY[id] ?? colorDials
}

export function registerModule(mod: PuzzleModule<any>) {
  REGISTRY[mod.id] = mod
}
