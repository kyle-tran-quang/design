/*
 * Minimal stand-in for the `framer` package, so code components exported from
 * Framer as standalone files (e.g. CostEstimatorGenerationStandalone.tsx) run
 * unmodified outside Framer. Vite and TypeScript alias `framer` to this file.
 */

/** Outside Framer we are always a live page, never the editor canvas. */
export const RenderTarget = {
  canvas: 'CANVAS',
  export: 'EXPORT',
  thumbnail: 'THUMBNAIL',
  preview: 'PREVIEW',
  current: () => 'PREVIEW',
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
