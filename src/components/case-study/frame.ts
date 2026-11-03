/**
 * From the 810px tablet breakpoint the fixed SectionNav sits at the right edge (its lines end 64px
 * in). Frames are capped so they always keep 88px clear on both sides, staying centred, and never
 * run under it. Above ~1176px the 1000px cap wins and this has no effect.
 */
const navClearance = 'min-[810px]:max-w-[min(1000px,calc(100vw_-_176px))]'

/**
 * Case study content frame: at most 1000px wide, centred. `box-content` keeps
 * the side padding outside the 1000px, so the content itself never exceeds it.
 * Full-bleed backgrounds and the hero image sit outside this frame.
 */
export const contentFrame = `mx-auto box-content max-w-[1000px] px-6 ${navClearance}`

/**
 * The same 1000px cap without side padding, for text inside a band that already
 * pads itself (for example a section with its own responsive `px-*`).
 */
export const textFrame = `mx-auto w-full max-w-[1000px] ${navClearance}`

/**
 * Body paragraphs: at most 600px wide inside a frame, so long copy stays easy to read and scan.
 * Left-aligned (no auto margins); put it on the paragraph or the wrapper of a run of paragraphs.
 */
export const readingFrame = 'max-w-[600px]'
