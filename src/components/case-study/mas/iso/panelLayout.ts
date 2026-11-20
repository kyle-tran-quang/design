/**
 * Where the story panel sits, as numbers the camera can use. The panel is a tearsheet: it covers 40 % of the viewport's width,
 * fills its height and is flush with the right edge (styled with Tailwind in StoryPanel.tsx). The camera has to know the same
 * rectangle so it can frame the opened layer in whatever the panel leaves free. Keep the two in step: if the panel's classes
 * change, change this.
 */

/** From this viewport width the panel is a tearsheet on the right; below it, a sheet at the bottom. */
export const SIDE_MIN_W = 810
/** The tearsheet's share of the viewport width, with a floor so it stays readable on a small tablet. */
export const PANEL_SHARE = 0.4
export const PANEL_MIN_W = 360

export type Rect = { x: number; y: number; w: number; h: number }

/** The tearsheet's width in px for a frame this wide. */
export const panelWidth = (frameW: number) => Math.max(PANEL_MIN_W, Math.round(frameW * PANEL_SHARE))

/** The area of the frame the panel leaves free, in frame px, with room kept around the opened layer. */
export function freeArea(frameW: number, frameH: number, side: boolean): Rect {
  const margin = 32
  if (side) {
    const right = frameW - panelWidth(frameW)
    // the logo sits top-left, so keep the top clear of it
    return { x: margin, y: 88, w: Math.max(200, right - margin * 2), h: frameH - 88 - margin }
  }
  // bottom sheet: 54 % of the frame tall, flush with the bottom and the sides
  const sheetTop = frameH - frameH * 0.54
  return { x: margin / 2, y: 64, w: frameW - margin, h: Math.max(160, sheetTop - 64 - 16) }
}
