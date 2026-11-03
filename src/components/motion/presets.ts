import type { TargetAndTransition, Transition } from 'motion/react'

/*
 * Animation values copied from the Framer export of the case study pages
 * (page-work-mas-pricing.js and its shared components). Framer specifies
 * springs as duration + bounce, which `motion` accepts as is.
 */

export type MotionState = {
  opacity?: number
  x?: number
  y?: number
  scale?: number
  rotateY?: number
  filter?: string
}

const ease = [0.44, 0, 0.56, 1] as const

export const transitions = {
  /** Most scroll appears, button hovers. */
  spring: { type: 'spring', duration: 0.4, bounce: 0.2 },
  springSoft: { type: 'spring', duration: 0.4, bounce: 0.1 },
  fade: { type: 'tween', duration: 0.5, ease },
} satisfies Record<string, Transition>

/** Scroll-triggered appear effects ("Appear on scroll" in Framer). `amount` is Framer's threshold. */
export const scrollPresets = {
  /** Challenge screenshots: rise 150px. */
  rise: { from: { opacity: 0, y: 150 }, transition: transitions.springSoft, once: true, amount: 0.5 },
  /** "What this means" ticket, validation quotes. */
  fade: { from: { opacity: 0 }, transition: transitions.fade, once: true, amount: 0.5 },
  quote: { from: { opacity: 0 }, transition: transitions.spring, once: true, amount: 0.5 },
  /** Phase walkthrough videos. */
  settle: { from: { opacity: 0.3, scale: 0.9, y: 50 }, transition: transitions.spring, once: true, amount: 0.5 },
  /** Before/after panels and clips: replays every time they re-enter the viewport. */
  pop: { from: { opacity: 0.4, scale: 0.8, y: 50 }, transition: transitions.spring, once: false, amount: 0.5 },
  /** Breadslice full-width images: rise 200px from 80% scale. */
  lift: { from: { opacity: 0, scale: 0.8, y: 200 }, transition: transitions.spring, once: true, amount: 0.5 },
  /** "Up next" card. */
  zoom: { from: { opacity: 0, scale: 0.9 }, transition: transitions.fade, once: true, amount: 0 },
  /** MAS Pricing problem figures and diagram: a quick scale-up. Pair with `origin-bottom` so it grows from the bottom edge. */
  grow: { from: { opacity: 0, scale: 0.85, y: 40 }, transition: transitions.spring, once: true, amount: 0.3 },
  /** CarDoctor DS illustrations: rise 150px from half opacity (page-work-cardoctor-ds.js). */
  drift: {
    from: { opacity: 0.5, y: 150 },
    transition: { type: 'tween', duration: 0.3, ease: [0.12, 0.23, 0.5, 1] },
    once: true,
    amount: 0,
  },
  /** A slide up from below, fading in, once a good part is in view so the motion is seen (CarDoctor DS challenge sticker). */
  slideUp: {
    from: { opacity: 0, y: 96 },
    transition: { type: 'spring', duration: 0.8, bounce: 0.12 },
    once: true,
    amount: 0.4,
  },
  /** CarDoctor DS "Challenge" and "Approach & impact" copy: each line flips in around the Y axis. */
  flip: {
    from: { opacity: 0.001, rotateY: 90 },
    transition: { type: 'spring', duration: 0.4, bounce: 0 },
    once: true,
    amount: 0.5,
  },
} satisfies Record<string, { from: MotionState; transition: Transition; once: boolean; amount: number }>

export type ScrollPreset = keyof typeof scrollPresets

/** Text effects: `transition.delay` in Framer is the stagger between tokens. */
export const textPresets = {
  /** Hero title: characters sharpen and rise on load. */
  heroTitle: {
    tokenize: 'character',
    from: { opacity: 0.001, y: 10, filter: 'blur(7px)' },
    transition: { type: 'tween', duration: 0.2, ease },
    stagger: 0.05,
    startDelay: 0,
  },
  /** Hero summary: words sharpen and rise when in view. */
  heroSummary: {
    tokenize: 'word',
    from: { opacity: 0.001, y: 10, filter: 'blur(10px)' },
    transition: { type: 'spring', duration: 0.8, bounce: 0 },
    stagger: 0.05,
    startDelay: 0.3,
  },
  /** Role / Timeline: characters flip in. */
  heroMeta: {
    tokenize: 'character',
    from: { opacity: 0.001, rotateY: 90 },
    transition: { type: 'spring', duration: 0.4, bounce: 0 },
    stagger: 0.05,
    startDelay: 0,
  },
  /** Footer tagline. */
  footerTagline: {
    tokenize: 'word',
    from: { opacity: 0.001, y: 10, filter: 'blur(10px)' },
    transition: { type: 'tween', duration: 0.5, ease },
    stagger: 0.05,
    startDelay: 0.2,
  },
} satisfies Record<
  string,
  { tokenize: 'character' | 'word'; from: MotionState; transition: Transition; stagger: number; startDelay: number }
>

export type TextPreset = keyof typeof textPresets

const REST: Required<MotionState> = { opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0, filter: 'blur(0px)' }

/** The resting values for exactly the properties `from` animates. */
export function restingState(from: MotionState): MotionState {
  return Object.fromEntries(Object.keys(from).map((k) => [k, REST[k as keyof MotionState]])) as MotionState
}

/**
 * `initial`/`animate` props for an entrance that waits for `play`.
 * With `hold`, the element stays fully visible until it plays (so the generation
 * curtain can trace it), then jumps to `from` and animates in.
 */
export function entranceProps(
  from: MotionState,
  play: boolean,
  hold: boolean,
): { initial: TargetAndTransition | false; animate: TargetAndTransition } {
  const rest = restingState(from) as TargetAndTransition
  // A settled blur(0px) still costs a filter pass on every repaint, so clear it once the entrance finishes.
  const settle = play && 'filter' in from ? { transitionEnd: { filter: 'none' } } : {}
  if (hold) {
    const keyframes = Object.fromEntries(
      Object.entries(from).map(([k, v]) => [k, [v, rest[k as keyof TargetAndTransition]]]),
    ) as TargetAndTransition
    return { initial: false, animate: play ? { ...keyframes, ...settle } : rest }
  }
  return { initial: from as TargetAndTransition, animate: play ? { ...rest, ...settle } : (from as TargetAndTransition) }
}
