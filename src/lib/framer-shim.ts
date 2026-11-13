/*
 * Minimal stand-in for the `framer` package, so code components exported from
 * Framer as standalone files (e.g. CostEstimatorGenerationStandalone.tsx) run
 * unmodified outside Framer. Vite and TypeScript alias `framer` to this file.
 */
import { isLowPower } from './performance'


/**
 * Outside Framer we are always a live page, never the editor canvas. The exported cards play their blueprint drawing
 * only when `current()` is not 'CANVAS'; they otherwise show the finished card at once. Low-power devices get that
 * still version, since the drawing is what costs them. (The Maximo curtain is the exception: its canvas branch is an
 * inline still, so MasCinematic.tsx skips it directly instead.)
 */
export const RenderTarget = {
  canvas: 'CANVAS',
  export: 'EXPORT',
  thumbnail: 'THUMBNAIL',
  preview: 'PREVIEW',
  current: () => (isLowPower() ? 'CANVAS' : 'PREVIEW'),
} as const

export const ControlType = {
  Boolean: 'boolean',
  Number: 'number',
  String: 'string',
  Color: 'color',
  Enum: 'enum',
  Image: 'image',
  File: 'file',
  Font: 'font',
  Object: 'object',
  Array: 'array',
} as const

/** Property controls only matter in the Framer editor. */
export function addPropertyControls(_component: unknown, _controls: unknown) {}
