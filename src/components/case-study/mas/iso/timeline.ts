import { bezier, lerp, pchip, type Camera } from './engine'

/**
 * Camera keyframes measured from the reference clip (Nested Sequence 04, 1920x1080 @ 23.976 fps).
 * Columns: frame, s (card size in stage px), rotZ (deg), elevation (deg), cy (screen y of the world origin).
 * Source: the isometric-3d-ui-showcase skill, stage 02 `CAM_KF`.
 */
const CAM_KF: number[][] = [
  [0, 842, 0, 90, 544], [2, 838, 0.3, 90, 542], [4, 840, 1.3, 88, 540], [6, 845, 3.9, 81, 540], [8, 841, 6.7, 79.7, 538],
  [10, 848, 10.7, 72.9, 540], [12, 850, 14.6, 66.4, 538], [14, 857, 18.5, 59, 540], [16, 860, 22.7, 53.4, 534],
  [18, 870, 26.9, 47, 538], [20, 872, 31.4, 41.9, 533], [22, 875, 34.7, 37.1, 536], [24, 874, 37.7, 32.9, 534],
  [26, 886, 39.2, 28.6, 533], [28, 894, 42.3, 25.8, 519], [30, 894, 43.4, 24, 500], [32, 893, 44.1, 23, 476],
  [34, 902, 43.7, 22.4, 446], [36, 891, 44, 22.9, 418], [38, 887, 44.6, 22.9, 388], [40, 889, 44, 23.1, 359],
  [42, 876, 45, 23.5, 333], [44, 872, 44.4, 23.7, 309], [46, 871, 44.5, 24.2, 286], [54, 841, 43, 25.2, 248],
  [60, 822, 43.7, 26.6, 257], [66, 797, 43.9, 27.5, 272], [72, 774, 44, 28.4, 280], [78, 750, 44.6, 29.4, 284],
  [84, 739, 43, 29.7, 284], [90, 699, 45.3, 31.5, 280], [96, 690, 44.2, 32.1, 274], [102, 672, 44.9, 32.5, 267],
  [108, 650, 45.2, 33.3, 265], [114, 617, 45.5, 34, 271], [120, 610, 46.3, 34.3, 274], [126, 589, 48, 34.8, 281],
  [132, 571, 48.2, 35.1, 291], [138, 549, 48.8, 35.3, 299], [144, 509, 50.3, 35.6, 307], [150, 459, 52.5, 35.8, 312],
  [156, 420, 54.3, 35.9, 313], [162, 397, 55.1, 36.3, 314], [168, 386, 55.2, 36.8, 316], [192, 380, 55.4, 36.8, 318],
  [216, 377.5, 55.5, 36.7, 319], [240, 374.5, 55.3, 36.9, 321], [264, 373, 55.3, 36.6, 322], [288, 369, 55.3, 36.6, 324],
  [316, 364.5, 55.4, 36.8, 326],
]

// The measurement is about +-1% noisy in s; unsmoothed it shimmers. Two light 3-point passes, as in the skill.
for (let pass = 0; pass < 2; pass++) {
  const prev = CAM_KF.map((r) => r[1])
  CAM_KF.forEach((r, i, a) => {
    if (i > 3 && i < a.length - 1) r[1] = (prev[i - 1] + 2 * prev[i] + prev[i + 1]) / 4
  })
}

/**
 * The table is read off video, so it carries noise: after the tilt, rotZ reverses direction a dozen times where the
 * real move is one steady drift, and at this face size 1 degree is about 17 px at the card's edge. The head of the
 * tilt (frames 0 to 32) is clean, so it is kept. After it the real motion is monotone (the camera yaws and rises
 * and shrinks away), so each channel is forced monotone and lightly smoothed.
 */
const TILT_END = 32
{
  let zHi = -Infinity
  let eHi = -Infinity
  let sLo = Infinity
  for (const r of CAM_KF) {
    if (r[0] >= TILT_END) {
      zHi = Math.max(zHi, r[2])
      r[2] = zHi
    }
    if (r[0] >= TILT_END + 2) {
      eHi = Math.max(eHi, r[3])
      r[3] = eHi
      sLo = Math.min(sLo, r[1])
      r[1] = sLo
    }
  }
  for (let pass = 0; pass < 3; pass++) {
    const prev = CAM_KF.map((r) => r.slice())
    CAM_KF.forEach((r, i, a) => {
      if (r[0] <= TILT_END || i === a.length - 1) return
      for (const c of [1, 2, 3, 4]) r[c] = (prev[i - 1][c] + 2 * prev[i][c] + prev[i + 1][c]) / 4
    })
  }
}

const fx = CAM_KF.map((r) => r[0])
const sCurve = pchip(fx, CAM_KF.map((r) => r[1]))
const zCurve = pchip(fx, CAM_KF.map((r) => r[2]))
const eCurve = pchip(fx, CAM_KF.map((r) => r[3]))
const yCurve = pchip(fx, CAM_KF.map((r) => r[4]))

/**
 * The look-at pan (the card sliding up the frame while the camera settles) starts with a hard kick in the table:
 * about 7 px/frame to 24 px/frame within four frames. It is replaced by one eased move over the same span.
 */
const PAN_FROM = 20
const PAN_TO = 72
const pan = bezier(0.4, 0, 0.5, 1)
const PAN_Y0 = yCurve(PAN_FROM)
const PAN_Y1 = yCurve(PAN_TO)

/** Camera for a (possibly fractional) frame, in the clip's 1920x1080 stage space. */
export function cameraAt(f: number): Camera {
  const cy = f <= PAN_FROM || f >= PAN_TO ? yCurve(f) : lerp(PAN_Y0, PAN_Y1, pan((f - PAN_FROM) / (PAN_TO - PAN_FROM)))
  return { s: sCurve(f), rotZ: zCurve(f), elev: eCurve(f), cx: 959, cy }
}

/** The clip is 1920x1080; the whole scene is authored there and scaled to the viewport. */
export const STAGE_W = 1920
export const STAGE_H = 1080

/** Last frame of the measured camera. */
export const LAST_FRAME = 316
